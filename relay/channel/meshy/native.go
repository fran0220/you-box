package meshy

import (
	"errors"
	"fmt"
	"io"
	"math"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/constant"
	"github.com/QuantumNous/new-api/logger"
	"github.com/QuantumNous/new-api/model"
	relaycommon "github.com/QuantumNous/new-api/relay/common"
	relayhelper "github.com/QuantumNous/new-api/relay/helper"
	"github.com/QuantumNous/new-api/service"
	"github.com/QuantumNous/new-api/setting/ratio_setting"
	"github.com/QuantumNous/new-api/types"

	"github.com/gin-gonic/gin"
)

const (
	ModelTextTo3D       = "meshy-text-to-3d"
	ModelImageTo3D      = "meshy-image-to-3d"
	ModelMultiImageTo3D = "meshy-multi-image-to-3d"
	ModelRemesh         = "meshy-remesh"
	ModelConvert        = "meshy-convert"
	ModelResize         = "meshy-resize"
	ModelRetexture      = "meshy-retexture"
	ModelRigging        = "meshy-rigging"
	ModelAnimation      = "meshy-animation"
)

const (
	billingNone = iota
	billingRequest
)

type NativeEndpoint struct {
	Name         string
	BillingKind  int
	DefaultModel string
	Stream       bool
}

type NativeUsage struct {
	ModelName    string
	BillingKind  int
	Units        int
	UnitName     string
	ExtraContent string
}

var DefaultModelList = []string{
	ModelTextTo3D,
	ModelImageTo3D,
	ModelMultiImageTo3D,
	ModelRemesh,
	ModelConvert,
	ModelResize,
	ModelRetexture,
	ModelRigging,
	ModelAnimation,
}

func IsNativeProxyPath(path string) bool {
	return strings.HasPrefix(path, "/meshy/")
}

func UpstreamPathFromProxyPath(path string) string {
	upstreamPath := strings.TrimPrefix(path, "/meshy")
	if upstreamPath == "" {
		return "/"
	}
	return upstreamPath
}

func MatchNativeEndpoint(method string, upstreamPath string) (*NativeEndpoint, bool) {
	method = strings.ToUpper(method)
	cleanPath := normalizeNativePath(upstreamPath)
	segments := splitPathSegments(cleanPath)
	if len(segments) < 2 || segments[0] != "openapi" {
		return nil, false
	}
	if method == http.MethodGet && len(segments) == 2 && segments[1] == "v2" {
		return nil, false
	}
	if len(segments) < 3 {
		return nil, false
	}
	version := segments[1]
	resource := segments[2]

	if method == http.MethodGet && version == "v2" && resource == "balance" && len(segments) == 3 {
		return &NativeEndpoint{Name: "balance", BillingKind: billingNone, DefaultModel: ModelTextTo3D}, true
	}
	endpointModel, ok := modelForResource(version, resource)
	if !ok {
		return nil, false
	}

	if method == http.MethodPost && len(segments) == 3 {
		return &NativeEndpoint{Name: resource, BillingKind: billingRequest, DefaultModel: endpointModel}, true
	}
	if method == http.MethodGet && (len(segments) == 3 || len(segments) == 4) {
		return &NativeEndpoint{Name: resource, BillingKind: billingNone, DefaultModel: endpointModel}, true
	}
	if method == http.MethodDelete && len(segments) == 4 {
		return &NativeEndpoint{Name: resource, BillingKind: billingNone, DefaultModel: endpointModel}, true
	}
	if method == http.MethodGet && len(segments) == 5 && segments[4] == "stream" {
		return &NativeEndpoint{Name: resource, BillingKind: billingNone, DefaultModel: endpointModel, Stream: true}, true
	}
	return nil, false
}

func modelForResource(version string, resource string) (string, bool) {
	switch resource {
	case "text-to-3d":
		return ModelTextTo3D, version == "v2"
	case "image-to-3d":
		return ModelImageTo3D, version == "v1"
	case "multi-image-to-3d":
		return ModelMultiImageTo3D, version == "v1"
	case "remesh":
		return ModelRemesh, version == "v1"
	case "convert":
		return ModelConvert, version == "v1"
	case "resize":
		return ModelResize, version == "v1"
	case "retexture":
		return ModelRetexture, version == "v1"
	case "rigging":
		return ModelRigging, version == "v1"
	case "animations":
		return ModelAnimation, version == "v1"
	default:
		return "", false
	}
}

func NativeModelForRequest(_ *gin.Context, endpoint *NativeEndpoint) (string, error) {
	if endpoint == nil || strings.TrimSpace(endpoint.DefaultModel) == "" {
		return ModelTextTo3D, nil
	}
	return endpoint.DefaultModel, nil
}

func EstimateNativeUsage(endpoint *NativeEndpoint, modelName string) NativeUsage {
	usage := NativeUsage{ModelName: modelName}
	if endpoint == nil {
		return usage
	}
	usage.BillingKind = endpoint.BillingKind
	if endpoint.BillingKind == billingRequest {
		usage.Units = 1
		usage.UnitName = "request"
		usage.ExtraContent = fmt.Sprintf("Meshy %s，异步任务请求 1 次", endpoint.Name)
	} else {
		usage.UnitName = "none"
	}
	return usage
}

func NativeQuota(c *gin.Context, info *relaycommon.RelayInfo, usage NativeUsage) (types.PriceData, int, error) {
	groupRatioInfo := relayhelper.HandleGroupRatio(c, info)
	priceData := types.PriceData{GroupRatioInfo: groupRatioInfo}
	if usage.BillingKind == billingNone || usage.Units <= 0 {
		info.PriceData = priceData
		return priceData, 0, nil
	}

	modelPrice, usePrice := ratio_setting.GetModelPrice(usage.ModelName, false)
	priceData.ModelPrice = modelPrice
	priceData.UsePrice = usePrice
	if usePrice {
		quota := int(math.Round(modelPrice * common.QuotaPerUnit * groupRatioInfo.GroupRatio))
		priceData.QuotaToPreConsume = quota
		info.PriceData = priceData
		return priceData, quota, nil
	}

	modelRatio, success, matchName := ratio_setting.GetModelRatio(usage.ModelName)
	if !success && !info.UserSetting.AcceptUnsetRatioModel {
		return priceData, 0, fmt.Errorf("model %s price is not configured", matchName)
	}
	priceData.ModelRatio = modelRatio
	quota := int(math.Round(float64(usage.Units) * modelRatio * groupRatioInfo.GroupRatio))
	if modelRatio != 0 && groupRatioInfo.GroupRatio != 0 && quota <= 0 {
		quota = 1
	}
	priceData.QuotaToPreConsume = quota
	info.PriceData = priceData
	return priceData, quota, nil
}

func NativeProxy(c *gin.Context, info *relaycommon.RelayInfo, upstreamPath string) (*http.Response, error) {
	body, contentLength, err := nativeRequestBody(c)
	if err != nil {
		return nil, err
	}
	requestURL, err := buildNativeRequestURL(info.ChannelBaseUrl, upstreamPath, c.Request.URL.RawQuery)
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequestWithContext(c.Request.Context(), c.Request.Method, requestURL, body)
	if err != nil {
		return nil, fmt.Errorf("new Meshy request failed: %w", err)
	}
	if contentLength > 0 {
		req.ContentLength = contentLength
	}
	copyNativeRequestHeaders(c, req)
	req.Header.Set("Authorization", "Bearer "+info.ApiKey)

	client, err := service.GetHttpClientWithProxy(info.ChannelSetting.Proxy)
	if err != nil {
		return nil, fmt.Errorf("new proxy http client failed: %w", err)
	}
	return client.Do(req)
}

func CopyNativeResponse(c *gin.Context, resp *http.Response) error {
	if resp == nil {
		return errors.New("nil Meshy response")
	}
	defer service.CloseResponseBodyGracefully(resp)
	for k, v := range resp.Header {
		if len(v) == 0 || !shouldCopyNativeResponseHeader(k) || !service.ShouldCopyUpstreamHeader(c, k, v) {
			continue
		}
		c.Writer.Header().Set(k, v[0])
	}
	c.Writer.WriteHeader(resp.StatusCode)
	_, err := io.Copy(c.Writer, resp.Body)
	if err != nil {
		logger.LogError(c, "failed to copy Meshy response: "+err.Error())
		return err
	}
	c.Writer.Flush()
	return nil
}

func RecordNativeConsume(c *gin.Context, info *relaycommon.RelayInfo, usage NativeUsage, quota int, priceData types.PriceData) {
	if usage.BillingKind == billingNone || usage.Units <= 0 {
		return
	}
	model.UpdateUserUsedQuotaAndRequestCount(info.UserId, quota)
	model.UpdateChannelUsedQuota(info.ChannelId, quota)
	if err := service.SettleBilling(c, info, quota); err != nil {
		logger.LogError(c, "error settling billing: "+err.Error())
	}
	other := map[string]interface{}{
		"provider":     "meshy",
		"billing_unit": usage.UnitName,
		"billing_kind": usage.BillingKind,
		"unit_count":   usage.Units,
		"model_ratio":  priceData.ModelRatio,
		"model_price":  priceData.ModelPrice,
		"group_ratio":  priceData.GroupRatioInfo.GroupRatio,
	}
	if priceData.GroupRatioInfo.HasSpecialRatio {
		other["user_group_ratio"] = priceData.GroupRatioInfo.GroupSpecialRatio
	}
	model.RecordConsumeLog(c, info.UserId, model.RecordConsumeLogParams{
		ChannelId:        info.ChannelId,
		PromptTokens:     usage.Units,
		CompletionTokens: 0,
		ModelName:        usage.ModelName,
		TokenName:        c.GetString("token_name"),
		Quota:            quota,
		Content:          usage.ExtraContent,
		TokenId:          info.TokenId,
		UseTimeSeconds:   int(time.Since(info.StartTime).Seconds()),
		IsStream:         info.IsStream,
		Group:            info.UsingGroup,
		Other:            other,
	})
}

func nativeRequestBody(c *gin.Context) (io.Reader, int64, error) {
	if c.Request.Method == http.MethodGet || c.Request.Body == nil {
		return nil, 0, nil
	}
	storage, err := common.GetBodyStorage(c)
	if err != nil {
		return nil, 0, err
	}
	if _, err := storage.Seek(0, io.SeekStart); err != nil {
		return nil, 0, err
	}
	return common.ReaderOnly(storage), storage.Size(), nil
}

func buildNativeRequestURL(baseURL string, upstreamPath string, rawQuery string) (string, error) {
	if strings.TrimSpace(baseURL) == "" {
		baseURL = constant.ChannelBaseURLs[constant.ChannelTypeMeshy]
	}
	parsed, err := url.Parse(strings.TrimRight(baseURL, "/"))
	if err != nil {
		return "", err
	}
	basePath := strings.TrimRight(parsed.Path, "/")
	parsed.Path = basePath + normalizeNativePath(upstreamPath)
	parsed.RawQuery = rawQuery
	return parsed.String(), nil
}

func copyNativeRequestHeaders(c *gin.Context, req *http.Request) {
	for key, values := range c.Request.Header {
		if len(values) == 0 || shouldSkipNativeRequestHeader(key) {
			continue
		}
		for _, value := range values {
			req.Header.Add(key, value)
		}
	}
}

func shouldSkipNativeRequestHeader(name string) bool {
	switch strings.ToLower(strings.TrimSpace(name)) {
	case "", "host", "content-length", "accept-encoding", "connection", "keep-alive", "proxy-authenticate", "proxy-authorization", "te", "trailer", "transfer-encoding", "upgrade", "authorization", "x-api-key", "cookie":
		return true
	default:
		return false
	}
}

func shouldCopyNativeResponseHeader(name string) bool {
	switch strings.ToLower(strings.TrimSpace(name)) {
	case "connection", "keep-alive", "proxy-authenticate", "proxy-authorization", "te", "trailer", "transfer-encoding", "upgrade":
		return false
	default:
		return true
	}
}

func normalizeNativePath(path string) string {
	if path == "" {
		return "/"
	}
	if !strings.HasPrefix(path, "/") {
		path = "/" + path
	}
	return strings.TrimRight(path, "/")
}

func splitPathSegments(path string) []string {
	path = strings.Trim(path, "/")
	if path == "" {
		return nil
	}
	return strings.Split(path, "/")
}
