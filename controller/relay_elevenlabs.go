package controller

import (
	"fmt"
	"net/http"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/dto"
	"github.com/QuantumNous/new-api/logger"
	"github.com/QuantumNous/new-api/relay/channel/elevenlabs"
	relaycommon "github.com/QuantumNous/new-api/relay/common"
	"github.com/QuantumNous/new-api/service"
	"github.com/QuantumNous/new-api/types"

	"github.com/gin-gonic/gin"
)

func RelayElevenLabs(c *gin.Context) {
	requestId := c.GetString(common.RequestIdKey)
	var newAPIError *types.NewAPIError
	defer func() {
		if newAPIError == nil {
			return
		}
		logger.LogError(c, fmt.Sprintf("ElevenLabs relay error: %s", common.LocalLogPreview(newAPIError.Error())))
		newAPIError.SetMessage(common.MessageWithRequestId(newAPIError.Error(), requestId))
		c.JSON(newAPIError.StatusCode, gin.H{"error": newAPIError.ToOpenAIError()})
	}()

	upstreamPath := elevenlabs.UpstreamPathFromProxyPath(c.Request.URL.Path)
	endpoint, ok := elevenlabs.MatchNativeEndpoint(c.Request.Method, upstreamPath)
	if !ok {
		newAPIError = types.NewOpenAIError(fmt.Errorf("ElevenLabs endpoint is not allowed: %s %s", c.Request.Method, upstreamPath), types.ErrorCodeInvalidRequest, http.StatusNotFound)
		return
	}

	relayInfo, err := relaycommon.GenRelayInfo(c, types.RelayFormatOpenAI, &dto.BaseRequest{}, nil)
	if err != nil {
		newAPIError = types.NewError(err, types.ErrorCodeGenRelayInfoFailed)
		return
	}
	relayInfo.InitChannelMeta(c)
	relayInfo.IsStream = endpoint.Stream

	usage, err := elevenlabs.EstimateNativeUsage(c, endpoint, relayInfo.OriginModelName)
	if err != nil {
		newAPIError = types.NewError(err, types.ErrorCodeInvalidRequest, types.ErrOptionWithSkipRetry())
		return
	}

	priceData, quota, err := elevenlabs.NativeQuota(c, relayInfo, usage)
	if err != nil {
		newAPIError = types.NewError(err, types.ErrorCodeModelPriceError, types.ErrOptionWithStatusCode(http.StatusBadRequest))
		return
	}

	preConsumed := false
	if quota > 0 && !priceData.FreeModel {
		newAPIError = service.PreConsumeBilling(c, quota, relayInfo)
		if newAPIError != nil {
			return
		}
		preConsumed = true
	}

	succeeded := false
	defer func() {
		if succeeded || !preConsumed || relayInfo.Billing == nil {
			return
		}
		relayInfo.Billing.Refund(c)
	}()

	resp, err := elevenlabs.NativeProxy(c, relayInfo, upstreamPath)
	if err != nil {
		newAPIError = types.NewOpenAIError(err, types.ErrorCodeDoRequestFailed, http.StatusInternalServerError)
		return
	}
	estimatedUnits := usage.Units
	usage = elevenlabs.UpdateUsageFromResponseHeaders(usage, resp)
	if usage.Units != estimatedUnits && usage.BillingKind != 0 {
		priceData, quota, err = elevenlabs.NativeQuota(c, relayInfo, usage)
		if err != nil {
			service.CloseResponseBodyGracefully(resp)
			newAPIError = types.NewError(err, types.ErrorCodeModelPriceError, types.ErrOptionWithStatusCode(http.StatusBadRequest))
			return
		}
	}

	statusCode := resp.StatusCode
	copyErr := elevenlabs.CopyNativeResponse(c, resp)
	if copyErr != nil {
		newAPIError = types.NewOpenAIError(copyErr, types.ErrorCodeReadResponseBodyFailed, http.StatusInternalServerError)
		return
	}
	if statusCode < http.StatusOK || statusCode >= http.StatusBadRequest {
		return
	}

	succeeded = true
	elevenlabs.RecordNativeConsume(c, relayInfo, usage, quota, priceData)
}
