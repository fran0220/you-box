package relay

import (
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/constant"
	"github.com/QuantumNous/new-api/dto"
	"github.com/QuantumNous/new-api/logger"
	"github.com/QuantumNous/new-api/pkg/billingexpr"
	geminichannel "github.com/QuantumNous/new-api/relay/channel/gemini"
	relaycommon "github.com/QuantumNous/new-api/relay/common"
	"github.com/QuantumNous/new-api/relay/helper"
	"github.com/QuantumNous/new-api/service"
	"github.com/QuantumNous/new-api/service/relayconvert"
	"github.com/QuantumNous/new-api/setting/model_setting"
	"github.com/QuantumNous/new-api/types"

	"github.com/gin-gonic/gin"
)

func isNoThinkingRequest(req *dto.GeminiChatRequest) bool {
	if req.GenerationConfig.ThinkingConfig != nil && req.GenerationConfig.ThinkingConfig.ThinkingBudget != nil {
		configBudget := req.GenerationConfig.ThinkingConfig.ThinkingBudget
		if configBudget != nil && *configBudget == 0 {
			// 如果思考预算为 0，则认为是非思考请求
			return true
		}
	}
	return false
}

func GeminiHelper(c *gin.Context, info *relaycommon.RelayInfo) (newAPIError *types.NewAPIError) {
	info.InitChannelMeta(c)

	geminiReq, ok := info.Request.(*dto.GeminiChatRequest)
	if !ok {
		return types.NewErrorWithStatusCode(fmt.Errorf("invalid request type, expected *dto.GeminiChatRequest, got %T", info.Request), types.ErrorCodeInvalidRequest, http.StatusBadRequest, types.ErrOptionWithSkipRetry())
	}

	request, err := common.DeepCopy(geminiReq)
	if err != nil {
		return types.NewError(fmt.Errorf("failed to copy request to GeminiChatRequest: %w", err), types.ErrorCodeInvalidRequest, types.ErrOptionWithSkipRetry())
	}

	// model mapped 模型映射
	err = helper.ModelMappedHelper(c, info, request)
	if err != nil {
		return types.NewError(err, types.ErrorCodeChannelModelMappedError, types.ErrOptionWithSkipRetry())
	}

	if model_setting.GetGeminiSettings().ThinkingAdapterEnabled {
		if isNoThinkingRequest(request) {
			// check is thinking
			if !strings.Contains(info.OriginModelName, "-nothinking") {
				// try to get no thinking model price
				noThinkingModelName := info.OriginModelName + "-nothinking"
				containPrice := helper.HasModelBillingConfig(noThinkingModelName)
				if containPrice {
					info.OriginModelName = noThinkingModelName
					info.UpstreamModelName = noThinkingModelName
				}
			}
		}
		if request.GenerationConfig.ThinkingConfig == nil {
			relayconvert.ApplyGeminiThinkingConfig(request, info)
		}
	}

	adaptor := GetAdaptor(info.ApiType)
	if adaptor == nil {
		return types.NewError(fmt.Errorf("invalid api type: %d", info.ApiType), types.ErrorCodeInvalidApiType, types.ErrOptionWithSkipRetry())
	}

	adaptor.Init(info)

	if info.ChannelSetting.SystemPrompt != "" {
		if request.SystemInstructions == nil {
			request.SystemInstructions = &dto.GeminiChatContent{
				Parts: []dto.GeminiPart{
					{Text: info.ChannelSetting.SystemPrompt},
				},
			}
		} else if len(request.SystemInstructions.Parts) == 0 {
			request.SystemInstructions.Parts = []dto.GeminiPart{{Text: info.ChannelSetting.SystemPrompt}}
		} else if info.ChannelSetting.SystemPromptOverride {
			common.SetContextKey(c, constant.ContextKeySystemPromptOverride, true)
			merged := false
			for i := range request.SystemInstructions.Parts {
				if request.SystemInstructions.Parts[i].Text == "" {
					continue
				}
				request.SystemInstructions.Parts[i].Text = info.ChannelSetting.SystemPrompt + "\n" + request.SystemInstructions.Parts[i].Text
				merged = true
				break
			}
			if !merged {
				request.SystemInstructions.Parts = append([]dto.GeminiPart{{Text: info.ChannelSetting.SystemPrompt}}, request.SystemInstructions.Parts...)
			}
		}
	}

	// Clean up empty system instruction
	if request.SystemInstructions != nil {
		hasContent := false
		for _, part := range request.SystemInstructions.Parts {
			if part.Text != "" {
				hasContent = true
				break
			}
		}
		if !hasContent {
			request.SystemInstructions = nil
		}
	}

	var requestBody io.Reader
	if model_setting.GetGlobalSettings().PassThroughRequestEnabled || info.ChannelSetting.PassThroughBodyEnabled {
		storage, err := common.GetBodyStorage(c)
		if err != nil {
			return types.NewErrorWithStatusCode(err, types.ErrorCodeReadRequestBodyFailed, http.StatusBadRequest, types.ErrOptionWithSkipRetry())
		}
		requestBody = common.ReaderOnly(storage)
	} else {
		// 使用 ConvertGeminiRequest 转换请求格式
		convertedRequest, err := adaptor.ConvertGeminiRequest(c, info, request)
		if err != nil {
			return types.NewError(err, types.ErrorCodeConvertRequestFailed, types.ErrOptionWithSkipRetry())
		}
		relaycommon.AppendRequestConversionFromRequest(info, convertedRequest)
		jsonData, err := common.Marshal(convertedRequest)
		if err != nil {
			return types.NewError(err, types.ErrorCodeConvertRequestFailed, types.ErrOptionWithSkipRetry())
		}

		// apply param override
		if len(info.ParamOverride) > 0 {
			jsonData, err = relaycommon.ApplyParamOverrideWithRelayInfo(jsonData, info)
			if err != nil {
				return newAPIErrorFromParamOverride(err)
			}
		}

		logger.LogDebug(c, "Gemini request body: %s", jsonData)

		body, size, closer, err := relaycommon.NewOutboundJSONBody(jsonData)
		if err != nil {
			return types.NewError(err, types.ErrorCodeConvertRequestFailed, types.ErrOptionWithSkipRetry())
		}
		defer func() { _ = closer.Close() /* cleanup only */ }()
		info.UpstreamRequestBodySize = size
		requestBody = body
	}

	resp, err := adaptor.DoRequest(c, info, requestBody)
	if err != nil {
		logger.LogError(c, "Do gemini request failed: "+err.Error())
		return types.NewOpenAIError(err, types.ErrorCodeDoRequestFailed, http.StatusInternalServerError)
	}

	statusCodeMappingStr := c.GetString("status_code_mapping")

	var httpResp *http.Response
	if resp != nil {
		httpResp = resp.(*http.Response)
		info.IsStream = info.IsStream || strings.HasPrefix(httpResp.Header.Get("Content-Type"), "text/event-stream")
		if httpResp.StatusCode != http.StatusOK {
			newAPIError = service.RelayErrorHandler(c.Request.Context(), httpResp, false)
			// reset status code 重置状态码
			service.ResetStatusCode(newAPIError, statusCodeMappingStr)
			return newAPIError
		}
	}

	usage, openaiErr := adaptor.DoResponse(c, resp.(*http.Response), info)
	if openaiErr != nil {
		service.ResetStatusCode(openaiErr, statusCodeMappingStr)
		return openaiErr
	}

	service.PostTextConsumeQuota(c, info, usage.(*dto.Usage), nil)
	return nil
}

func GeminiEmbeddingHandler(c *gin.Context, info *relaycommon.RelayInfo) (newAPIError *types.NewAPIError) {
	info.InitChannelMeta(c)

	isBatch := strings.HasSuffix(c.Request.URL.Path, "batchEmbedContents")
	info.IsGeminiBatchEmbedding = isBatch

	var req dto.Request
	var err error

	if isBatch {
		batchRequest := &dto.GeminiBatchEmbeddingRequest{}
		err = common.UnmarshalBodyReusable(c, batchRequest)
		if err != nil {
			return types.NewError(err, types.ErrorCodeInvalidRequest, types.ErrOptionWithSkipRetry())
		}
		req = batchRequest
		for _, r := range batchRequest.Requests {
			if r == nil {
				return types.NewError(fmt.Errorf("embedding batch contains a null request"), types.ErrorCodeInvalidRequest, types.ErrOptionWithSkipRetry())
			}
		}
	} else {
		singleRequest := &dto.GeminiEmbeddingRequest{}
		err = common.UnmarshalBodyReusable(c, singleRequest)
		if err != nil {
			return types.NewError(err, types.ErrorCodeInvalidRequest, types.ErrOptionWithSkipRetry())
		}
		req = singleRequest
	}

	err = helper.ModelMappedHelper(c, info, req)
	if err != nil {
		return types.NewError(err, types.ErrorCodeChannelModelMappedError, types.ErrOptionWithSkipRetry())
	}

	req.SetModelName("models/" + info.UpstreamModelName)

	adaptor := GetAdaptor(info.ApiType)
	if adaptor == nil {
		return types.NewError(fmt.Errorf("invalid api type: %d", info.ApiType), types.ErrorCodeInvalidApiType, types.ErrOptionWithSkipRetry())
	}
	adaptor.Init(info)

	var requestBody io.Reader
	jsonData, err := common.Marshal(req)
	if err != nil {
		return types.NewError(err, types.ErrorCodeConvertRequestFailed, types.ErrOptionWithSkipRetry())
	}

	// apply param override
	if len(info.ParamOverride) > 0 {
		jsonData, err = relaycommon.ApplyParamOverrideWithRelayInfo(jsonData, info)
		if err != nil {
			return newAPIErrorFromParamOverride(err)
		}
	}
	logger.LogDebug(c, "Gemini embedding request body: %s", jsonData)

	// Multimodal embedding prices differ by modality. Before sending the
	// request, ask the selected Gemini channel for authoritative modality token
	// counts and reserve the corresponding quota. This prevents a successful
	// expensive media response from being returned before sufficient funds are
	// secured.
	var finalContents []dto.GeminiChatContent
	hasMedia := false
	if isBatch {
		var finalRequest dto.GeminiBatchEmbeddingRequest
		if err = common.Unmarshal(jsonData, &finalRequest); err != nil {
			return types.NewError(err, types.ErrorCodeConvertRequestFailed, types.ErrOptionWithSkipRetry())
		}
		for _, item := range finalRequest.Requests {
			if item == nil {
				return types.NewError(fmt.Errorf("embedding batch contains a null request"), types.ErrorCodeInvalidRequest, types.ErrOptionWithSkipRetry())
			}
			finalContents = append(finalContents, item.Content)
		}
	} else {
		var finalRequest dto.GeminiEmbeddingRequest
		if err = common.Unmarshal(jsonData, &finalRequest); err != nil {
			return types.NewError(err, types.ErrorCodeConvertRequestFailed, types.ErrOptionWithSkipRetry())
		}
		finalContents = []dto.GeminiChatContent{finalRequest.Content}
	}
	for _, content := range finalContents {
		for _, part := range content.Parts {
			if part.InlineData != nil || part.FileData != nil {
				hasMedia = true
				break
			}
		}
	}
	if hasMedia {
		if info.TieredBillingSnapshot == nil || info.TieredBillingSnapshot.ExprVersion < 2 {
			return types.NewErrorWithStatusCode(fmt.Errorf("multimodal Gemini embeddings require a v2 tiered billing expression"), types.ErrorCodeInvalidRequest, http.StatusBadRequest, types.ErrOptionWithSkipRetry())
		}
		preflightUsage, countErr := geminichannel.CountEmbeddingTokens(c, info, finalContents)
		if countErr != nil {
			return types.NewOpenAIError(countErr, types.ErrorCodeDoRequestFailed, http.StatusBadGateway)
		}
		info.EmbeddingPreflightUsage = preflightUsage
		usedVars := billingexpr.UsedVars(info.TieredBillingSnapshot.ExprString)
		if billingErr := validateEmbeddingBillingModalities(preflightUsage, usedVars); billingErr != nil {
			return types.NewErrorWithStatusCode(billingErr, types.ErrorCodeInvalidRequest, http.StatusInternalServerError, types.ErrOptionWithSkipRetry())
		}
		ok, targetQuota, result := service.TryTieredSettle(info, service.BuildTieredTokenParams(preflightUsage, false, usedVars))
		if !ok || result == nil {
			return types.NewErrorWithStatusCode(fmt.Errorf("failed to calculate multimodal embedding reservation"), types.ErrorCodeInvalidRequest, http.StatusInternalServerError, types.ErrOptionWithSkipRetry())
		}
		if info.Billing != nil {
			if reserveErr := info.Billing.Reserve(targetQuota); reserveErr != nil {
				return types.NewErrorWithStatusCode(reserveErr, types.ErrorCodeInsufficientUserQuota, http.StatusForbidden, types.ErrOptionWithSkipRetry(), types.ErrOptionWithNoRecordErrorLog())
			}
		}
	}

	body, size, closer, err := relaycommon.NewOutboundJSONBody(jsonData)
	if err != nil {
		return types.NewError(err, types.ErrorCodeConvertRequestFailed, types.ErrOptionWithSkipRetry())
	}
	defer func() { _ = closer.Close() /* cleanup only */ }()
	info.UpstreamRequestBodySize = size
	requestBody = body

	resp, err := adaptor.DoRequest(c, info, requestBody)
	if err != nil {
		logger.LogError(c, "Do gemini request failed: "+err.Error())
		return types.NewOpenAIError(err, types.ErrorCodeDoRequestFailed, http.StatusInternalServerError)
	}

	statusCodeMappingStr := c.GetString("status_code_mapping")
	var httpResp *http.Response
	if resp != nil {
		httpResp = resp.(*http.Response)
		if httpResp.StatusCode != http.StatusOK {
			newAPIError = service.RelayErrorHandler(c.Request.Context(), httpResp, false)
			service.ResetStatusCode(newAPIError, statusCodeMappingStr)
			return newAPIError
		}
	}

	usage, openaiErr := adaptor.DoResponse(c, resp.(*http.Response), info)
	if openaiErr != nil {
		service.ResetStatusCode(openaiErr, statusCodeMappingStr)
		return openaiErr
	}

	service.PostTextConsumeQuota(c, info, usage.(*dto.Usage), nil)
	return nil
}

func validateEmbeddingBillingModalities(usage *dto.Usage, usedVars map[string]bool) error {
	if usage == nil {
		return fmt.Errorf("gemini embedding preflight usage is missing")
	}
	required := []struct {
		tokens int
		name   string
	}{
		{usage.PromptTokensDetails.ImageTokens, "img"},
		{usage.PromptTokensDetails.DocumentTokens, "doc"},
		{usage.PromptTokensDetails.AudioTokens, "ai"},
		{usage.PromptTokensDetails.VideoTokens, "vid"},
	}
	for _, modality := range required {
		if modality.tokens > 0 && !usedVars[modality.name] {
			return fmt.Errorf("gemini embedding billing expression must price the %s modality", modality.name)
		}
	}
	return nil
}
