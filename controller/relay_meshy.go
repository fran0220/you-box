package controller

import (
	"fmt"
	"net/http"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/dto"
	"github.com/QuantumNous/new-api/logger"
	"github.com/QuantumNous/new-api/relay/channel/meshy"
	relaycommon "github.com/QuantumNous/new-api/relay/common"
	"github.com/QuantumNous/new-api/service"
	"github.com/QuantumNous/new-api/types"

	"github.com/gin-gonic/gin"
)

func RelayMeshy(c *gin.Context) {
	requestId := c.GetString(common.RequestIdKey)
	var newAPIError *types.NewAPIError
	defer func() {
		if newAPIError == nil {
			return
		}
		logger.LogError(c, fmt.Sprintf("Meshy relay error: %s", common.LocalLogPreview(newAPIError.Error())))
		newAPIError.SetMessage(common.MessageWithRequestId(newAPIError.Error(), requestId))
		c.JSON(newAPIError.StatusCode, gin.H{"error": newAPIError.ToOpenAIError()})
	}()

	upstreamPath := meshy.UpstreamPathFromProxyPath(c.Request.URL.Path)
	endpoint, ok := meshy.MatchNativeEndpoint(c.Request.Method, upstreamPath)
	if !ok {
		newAPIError = types.NewOpenAIError(fmt.Errorf("Meshy endpoint is not allowed: %s %s", c.Request.Method, upstreamPath), types.ErrorCodeInvalidRequest, http.StatusNotFound)
		return
	}

	relayInfo, err := relaycommon.GenRelayInfo(c, types.RelayFormatOpenAI, &dto.BaseRequest{}, nil)
	if err != nil {
		newAPIError = types.NewError(err, types.ErrorCodeGenRelayInfoFailed)
		return
	}
	relayInfo.InitChannelMeta(c)
	relayInfo.IsStream = endpoint.Stream

	usage := meshy.EstimateNativeUsage(endpoint, relayInfo.OriginModelName)
	priceData, quota, err := meshy.NativeQuota(c, relayInfo, usage)
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

	resp, err := meshy.NativeProxy(c, relayInfo, upstreamPath)
	if err != nil {
		newAPIError = types.NewOpenAIError(err, types.ErrorCodeDoRequestFailed, http.StatusInternalServerError)
		return
	}
	statusCode := resp.StatusCode
	copyErr := meshy.CopyNativeResponse(c, resp)
	if copyErr != nil {
		newAPIError = types.NewOpenAIError(copyErr, types.ErrorCodeReadResponseBodyFailed, http.StatusInternalServerError)
		return
	}
	if statusCode < http.StatusOK || statusCode >= http.StatusBadRequest {
		return
	}

	succeeded = true
	meshy.RecordNativeConsume(c, relayInfo, usage, quota, priceData)
}
