package gemini

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/constant"
	"github.com/QuantumNous/new-api/dto"
	"github.com/QuantumNous/new-api/logger"
	relaycommon "github.com/QuantumNous/new-api/relay/common"
	"github.com/QuantumNous/new-api/relay/helper"
	"github.com/QuantumNous/new-api/service"
	"github.com/QuantumNous/new-api/setting/model_setting"
	"github.com/QuantumNous/new-api/types"

	"github.com/gin-gonic/gin"
)

func GeminiTextGenerationHandler(c *gin.Context, info *relaycommon.RelayInfo, resp *http.Response) (*dto.Usage, *types.NewAPIError) {
	defer service.CloseResponseBodyGracefully(resp)

	// 读取响应体
	responseBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, types.NewOpenAIError(err, types.ErrorCodeBadResponseBody, http.StatusInternalServerError)
	}

	logger.LogDebug(c, "Gemini native response body: %s", responseBody)

	// 解析为 Gemini 原生响应格式
	var geminiResponse dto.GeminiChatResponse
	err = common.Unmarshal(responseBody, &geminiResponse)
	if err != nil {
		return nil, types.NewOpenAIError(err, types.ErrorCodeBadResponseBody, http.StatusInternalServerError)
	}

	if len(geminiResponse.Candidates) == 0 && geminiResponse.PromptFeedback != nil && geminiResponse.PromptFeedback.BlockReason != nil {
		common.SetContextKey(c, constant.ContextKeyAdminRejectReason, fmt.Sprintf("gemini_block_reason=%s", *geminiResponse.PromptFeedback.BlockReason))
	}

	// 计算使用量（优先上游 UsageMetadata，缺失时本地估算并保留 Gemini 计费语义）
	usage := buildUsageFromGeminiResponse(c, info, &geminiResponse)

	service.IOCopyBytesGracefully(c, resp, responseBody)

	return &usage, nil
}

func NativeGeminiEmbeddingHandler(c *gin.Context, resp *http.Response, info *relaycommon.RelayInfo) (*dto.Usage, *types.NewAPIError) {
	defer service.CloseResponseBodyGracefully(resp)

	responseBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, types.NewOpenAIError(err, types.ErrorCodeBadResponseBody, http.StatusInternalServerError)
	}

	logger.LogDebug(c, "Gemini native embedding response body: %s", responseBody)

	usage := info.EmbeddingPreflightUsage
	if usage == nil {
		usage = service.ResponseText2Usage(c, "", info.UpstreamModelName, info.GetEstimatePromptTokens())
	}

	if info.IsGeminiBatchEmbedding {
		var geminiResponse dto.GeminiBatchEmbeddingResponse
		err = common.Unmarshal(responseBody, &geminiResponse)
		if err != nil {
			return nil, types.NewOpenAIError(err, types.ErrorCodeBadResponseBody, http.StatusInternalServerError)
		}
		usage, err = geminiEmbeddingUsage(geminiResponse.UsageMetadata, usage)
	} else {
		var geminiResponse dto.GeminiEmbeddingResponse
		err = common.Unmarshal(responseBody, &geminiResponse)
		if err != nil {
			return nil, types.NewOpenAIError(err, types.ErrorCodeBadResponseBody, http.StatusInternalServerError)
		}
		usage, err = geminiEmbeddingUsage(geminiResponse.UsageMetadata, usage)
	}
	if err != nil {
		return nil, types.NewOpenAIError(err, types.ErrorCodeBadResponseBody, http.StatusBadGateway)
	}

	service.IOCopyBytesGracefully(c, resp, responseBody)

	return usage, nil
}

func geminiEmbeddingUsage(metadata *dto.GeminiEmbeddingUsageMetadata, fallback *dto.Usage) (*dto.Usage, error) {
	if metadata == nil || (metadata.PromptTokenCount == 0 && len(metadata.PromptTokenDetails) == 0) {
		return fallback, nil
	}
	if metadata.PromptTokenCount > 0 && len(metadata.PromptTokenDetails) == 0 && fallback != nil {
		return fallback, nil
	}
	usage, err := geminiEmbeddingUsageFromDetails(metadata.PromptTokenCount, metadata.PromptTokenDetails)
	if err != nil {
		return nil, err
	}
	usage.TotalTokens = metadata.TotalTokenCount
	if usage.TotalTokens == 0 {
		usage.TotalTokens = usage.PromptTokens
	}
	usage.UsageSource = "provider"
	return usage, nil
}

func geminiEmbeddingUsageFromDetails(total int, details []dto.GeminiPromptTokensDetails) (*dto.Usage, error) {
	if total <= 0 || len(details) == 0 {
		return nil, fmt.Errorf("gemini embedding usage is missing modality token details")
	}
	usage := &dto.Usage{PromptTokens: total, TotalTokens: total}
	for _, detail := range details {
		if detail.TokenCount < 0 {
			return nil, fmt.Errorf("gemini embedding returned a negative %s token count", detail.Modality)
		}
		switch strings.ToUpper(detail.Modality) {
		case "TEXT":
			usage.PromptTokensDetails.TextTokens += detail.TokenCount
		case "IMAGE":
			usage.PromptTokensDetails.ImageTokens += detail.TokenCount
		case "AUDIO":
			usage.PromptTokensDetails.AudioTokens += detail.TokenCount
		case "DOCUMENT", "PDF":
			usage.PromptTokensDetails.DocumentTokens += detail.TokenCount
		case "VIDEO":
			usage.PromptTokensDetails.VideoTokens += detail.TokenCount
		default:
			return nil, fmt.Errorf("gemini embedding returned unsupported usage modality %q", detail.Modality)
		}
	}
	return usage, nil
}

// CountEmbeddingTokens obtains billing-grade modality counts from the same
// selected Gemini channel that will serve the embedding request.
func CountEmbeddingTokens(c *gin.Context, info *relaycommon.RelayInfo, contents []dto.GeminiChatContent) (*dto.Usage, error) {
	payload, err := common.Marshal(dto.GeminiCountTokensRequest{Contents: contents})
	if err != nil {
		return nil, err
	}
	version := model_setting.GetGeminiVersionSetting(info.UpstreamModelName)
	url := fmt.Sprintf("%s/%s/models/%s:countTokens", strings.TrimRight(info.ChannelBaseUrl, "/"), version, info.UpstreamModelName)
	req, err := http.NewRequestWithContext(c.Request.Context(), http.MethodPost, url, bytes.NewReader(payload))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-goog-api-key", info.ApiKey)
	client, err := service.GetHttpClientWithProxy(info.ChannelSetting.Proxy)
	if err != nil {
		return nil, err
	}
	if client == nil {
		client = http.DefaultClient
	}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer service.CloseResponseBodyGracefully(resp)
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("gemini countTokens returned %d: %s", resp.StatusCode, strings.TrimSpace(string(body)))
	}
	var countResponse dto.GeminiCountTokensResponse
	if err = common.Unmarshal(body, &countResponse); err != nil {
		return nil, err
	}
	return geminiEmbeddingUsageFromDetails(countResponse.TotalTokens, countResponse.PromptTokensDetails)
}

func GeminiTextGenerationStreamHandler(c *gin.Context, info *relaycommon.RelayInfo, resp *http.Response) (*dto.Usage, *types.NewAPIError) {
	helper.SetEventStreamHeaders(c)

	return geminiStreamHandler(c, info, resp, func(data string, geminiResponse *dto.GeminiChatResponse) bool {
		err := helper.StringData(c, data)
		if err != nil {
			logger.LogError(c, "failed to write stream data: "+err.Error())
			return false
		}
		info.SendResponseCount++
		return true
	})
}
