package elevenlabs

import (
	"bytes"
	"errors"
	"fmt"
	"io"
	"math"
	"mime/multipart"
	"net/http"
	"net/url"
	"path/filepath"
	"strconv"
	"strings"
	"time"
	"unicode/utf8"

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
	"github.com/tidwall/gjson"
)

const (
	NativeBaseModel            = "elevenlabs"
	NativeSoundGenerationModel = "eleven_text_to_sound_v2"
	NativeMusicModel           = "music_v2"
	NativeAudioIsolationModel  = "elevenlabs-audio-isolation"
	NativeForcedAlignmentModel = "elevenlabs-forced-alignment"
	DefaultTTSModel            = "eleven_v3"
	DefaultSTTModel            = "scribe_v2"
	DefaultSpeechToSpeechModel = "eleven_multilingual_sts_v2"
)

const (
	billingNone = iota
	billingCharacters
	billingAudioTokens
	billingMusicDuration
)

const defaultMusicDurationSeconds = 30

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
	DefaultTTSModel,
	DefaultSTTModel,
	DefaultSpeechToSpeechModel,
	NativeSoundGenerationModel,
	NativeMusicModel,
	NativeAudioIsolationModel,
	NativeForcedAlignmentModel,
}

func IsNativeProxyPath(path string) bool {
	if strings.HasPrefix(path, "/elevenlabs/") {
		return true
	}
	// Studio/Portal may call unique ElevenLabs endpoints without the /elevenlabs
	// prefix (e.g. POST /v1/sound-generation). Only paths that do not collide
	// with OpenAI-compatible /v1 routes are treated as native aliases.
	return IsBareNativeAliasPath(path)
}

// IsBareNativeAliasPath reports whether path is a short /v1 alias for an
// ElevenLabs-native endpoint that cannot be confused with OpenAI routes.
func IsBareNativeAliasPath(path string) bool {
	clean := normalizeNativePath(path)
	switch clean {
	case "/v1/sound-generation",
		"/v1/music",
		"/v1/music/stream",
		"/v1/audio-isolation",
		"/v1/audio-isolation/stream",
		"/v1/forced-alignment":
		return true
	}
	if strings.HasPrefix(clean, "/v1/speech-to-speech/") {
		return true
	}
	return false
}

func UpstreamPathFromProxyPath(path string) string {
	if strings.HasPrefix(path, "/elevenlabs") {
		upstreamPath := strings.TrimPrefix(path, "/elevenlabs")
		if upstreamPath == "" {
			return "/"
		}
		return upstreamPath
	}
	// Bare alias already matches the upstream ElevenLabs path.
	return path
}

func MatchNativeEndpoint(method string, upstreamPath string) (*NativeEndpoint, bool) {
	method = strings.ToUpper(method)
	cleanPath := normalizeNativePath(upstreamPath)
	segments := splitPathSegments(cleanPath)

	if len(segments) == 0 {
		return nil, false
	}
	if segments[0] != "v1" && segments[0] != "v2" {
		return nil, false
	}
	if isBlockedNativePath(segments) {
		return nil, false
	}

	if method == http.MethodGet {
		if cleanPath == "/v1/models" {
			return &NativeEndpoint{Name: "models", BillingKind: billingNone, DefaultModel: DefaultTTSModel}, true
		}
		if isReadOnlyVoicePath(segments) {
			return &NativeEndpoint{Name: "voices", BillingKind: billingNone, DefaultModel: DefaultTTSModel}, true
		}
		return nil, false
	}

	if method != http.MethodPost {
		return nil, false
	}

	if len(segments) >= 3 && segments[0] == "v1" && segments[1] == "text-to-speech" {
		if len(segments) == 3 {
			return &NativeEndpoint{Name: "text-to-speech", BillingKind: billingCharacters, DefaultModel: DefaultTTSModel}, true
		}
		if len(segments) == 4 && (segments[3] == "stream" || segments[3] == "with-timestamps") {
			return &NativeEndpoint{Name: "text-to-speech", BillingKind: billingCharacters, DefaultModel: DefaultTTSModel, Stream: segments[3] == "stream"}, true
		}
		if len(segments) == 5 && segments[3] == "stream" && segments[4] == "with-timestamps" {
			return &NativeEndpoint{Name: "text-to-speech", BillingKind: billingCharacters, DefaultModel: DefaultTTSModel, Stream: true}, true
		}
		return nil, false
	}

	if segments[0] == "v1" && len(segments) >= 2 {
		switch segments[1] {
		case "speech-to-text":
			if len(segments) == 2 {
				return &NativeEndpoint{Name: "speech-to-text", BillingKind: billingAudioTokens, DefaultModel: DefaultSTTModel}, true
			}
		case "speech-to-speech":
			if len(segments) == 3 || (len(segments) == 4 && segments[3] == "stream") {
				return &NativeEndpoint{Name: "speech-to-speech", BillingKind: billingAudioTokens, DefaultModel: DefaultSpeechToSpeechModel, Stream: len(segments) == 4}, true
			}
		case "audio-isolation":
			if len(segments) == 2 || (len(segments) == 3 && segments[2] == "stream") {
				return &NativeEndpoint{Name: "audio-isolation", BillingKind: billingAudioTokens, DefaultModel: NativeAudioIsolationModel, Stream: len(segments) == 3}, true
			}
		case "forced-alignment":
			if len(segments) == 2 {
				return &NativeEndpoint{Name: "forced-alignment", BillingKind: billingAudioTokens, DefaultModel: NativeForcedAlignmentModel}, true
			}
		case "sound-generation":
			if len(segments) == 2 {
				return &NativeEndpoint{Name: "sound-generation", BillingKind: billingCharacters, DefaultModel: NativeSoundGenerationModel}, true
			}
		case "music":
			// ElevenLabs supports both non-stream compose (/v1/music) and stream
			// (/v1/music/stream). Studio commonly posts to /v1/music.
			if len(segments) == 2 {
				return &NativeEndpoint{Name: "music", BillingKind: billingMusicDuration, DefaultModel: NativeMusicModel}, true
			}
			if len(segments) == 3 && segments[2] == "stream" {
				return &NativeEndpoint{Name: "music", BillingKind: billingMusicDuration, DefaultModel: NativeMusicModel, Stream: true}, true
			}
		case "text-to-dialogue":
			if len(segments) == 2 {
				return &NativeEndpoint{Name: "text-to-dialogue", BillingKind: billingCharacters, DefaultModel: DefaultTTSModel}, true
			}
			if len(segments) == 3 && (segments[2] == "stream" || segments[2] == "with-timestamps") {
				return &NativeEndpoint{Name: "text-to-dialogue", BillingKind: billingCharacters, DefaultModel: DefaultTTSModel, Stream: segments[2] == "stream"}, true
			}
			if len(segments) == 4 && segments[2] == "stream" && segments[3] == "with-timestamps" {
				return &NativeEndpoint{Name: "text-to-dialogue", BillingKind: billingCharacters, DefaultModel: DefaultTTSModel, Stream: true}, true
			}
		}
	}

	return nil, false
}

func NativeModelForRequest(c *gin.Context, endpoint *NativeEndpoint) (string, error) {
	if endpoint == nil {
		return NativeBaseModel, nil
	}
	if endpoint.BillingKind == billingNone {
		return endpoint.DefaultModel, nil
	}
	if endpoint.BillingKind == billingAudioTokens && isMultipartRequest(c) {
		modelID, err := formField(c, "model_id", "model")
		if err != nil {
			return "", err
		}
		if modelID != "" {
			return modelID, nil
		}
		return endpoint.DefaultModel, nil
	}
	if isJSONRequest(c) {
		body, err := requestBodyBytes(c)
		if err != nil {
			return "", err
		}
		for _, key := range []string{"model_id", "model"} {
			if value := strings.TrimSpace(gjson.GetBytes(body, key).String()); value != "" {
				return value, nil
			}
		}
	}
	return endpoint.DefaultModel, nil
}

func EstimateNativeUsage(c *gin.Context, endpoint *NativeEndpoint, modelName string) (NativeUsage, error) {
	usage := NativeUsage{
		ModelName:   modelName,
		BillingKind: endpoint.BillingKind,
	}

	switch endpoint.BillingKind {
	case billingNone:
		usage.UnitName = "none"
		return usage, nil
	case billingCharacters:
		chars, err := estimateCharacterUnits(c)
		if err != nil {
			return usage, err
		}
		usage.Units = chars
		usage.UnitName = "characters"
		usage.ExtraContent = fmt.Sprintf("ElevenLabs %s，字符数 %d", endpoint.Name, chars)
		return usage, nil
	case billingAudioTokens:
		duration, err := estimateAudioDuration(c)
		if err != nil {
			return usage, err
		}
		audioTokens := durationToAudioTokens(duration)
		usage.Units = audioTokens
		usage.UnitName = "audio_tokens"
		usage.ExtraContent = fmt.Sprintf("ElevenLabs %s，音频时长 %.2fs，音频计费单位 %d", endpoint.Name, duration, audioTokens)
		return usage, nil
	case billingMusicDuration:
		duration, err := estimateMusicDuration(c)
		if err != nil {
			return usage, err
		}
		audioTokens := durationToAudioTokens(duration)
		usage.Units = audioTokens
		usage.UnitName = "audio_tokens"
		usage.ExtraContent = fmt.Sprintf("ElevenLabs %s，目标时长 %.2fs，音频计费单位 %d", endpoint.Name, duration, audioTokens)
		return usage, nil
	default:
		return usage, fmt.Errorf("unsupported ElevenLabs billing kind: %d", endpoint.BillingKind)
	}
}

func UpdateUsageFromResponseHeaders(usage NativeUsage, resp *http.Response) NativeUsage {
	if resp == nil || usage.BillingKind != billingCharacters {
		return usage
	}
	characterCost := strings.TrimSpace(resp.Header.Get("character-cost"))
	if characterCost == "" {
		return usage
	}
	value, err := strconv.Atoi(characterCost)
	if err != nil || value <= 0 {
		return usage
	}
	usage.Units = value
	usage.ExtraContent = fmt.Sprintf("%s，上游 character-cost %d", usage.ExtraContent, value)
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
		return nil, fmt.Errorf("new ElevenLabs request failed: %w", err)
	}
	if contentLength > 0 {
		req.ContentLength = contentLength
	}
	copyNativeRequestHeaders(c, req)
	req.Header.Set("xi-api-key", info.ApiKey)

	client, err := service.GetHttpClientWithProxy(info.ChannelSetting.Proxy)
	if err != nil {
		return nil, fmt.Errorf("new proxy http client failed: %w", err)
	}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	return resp, nil
}

func CopyNativeResponse(c *gin.Context, resp *http.Response) error {
	if resp == nil {
		return errors.New("nil ElevenLabs response")
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
		logger.LogError(c, "failed to copy ElevenLabs response: "+err.Error())
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

	useTimeSeconds := time.Now().Unix() - info.StartTime.Unix()
	other := map[string]interface{}{
		"provider":     "elevenlabs",
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

	promptTokens := usage.Units
	completionTokens := 0
	if usage.BillingKind == billingAudioTokens || usage.BillingKind == billingMusicDuration {
		promptTokens = 0
		completionTokens = usage.Units
	}

	model.RecordConsumeLog(c, info.UserId, model.RecordConsumeLogParams{
		ChannelId:        info.ChannelId,
		PromptTokens:     promptTokens,
		CompletionTokens: completionTokens,
		ModelName:        usage.ModelName,
		TokenName:        c.GetString("token_name"),
		Quota:            quota,
		Content:          usage.ExtraContent,
		TokenId:          info.TokenId,
		UseTimeSeconds:   int(useTimeSeconds),
		IsStream:         info.IsStream,
		Group:            info.UsingGroup,
		Other:            other,
	})
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

func isBlockedNativePath(segments []string) bool {
	if len(segments) < 2 {
		return false
	}
	blocked := map[string]struct{}{
		"history":          {},
		"convai":           {},
		"workspace":        {},
		"workspaces":       {},
		"api-keys":         {},
		"service-accounts": {},
		"webhooks":         {},
		"dubbing":          {},
		"realtime":         {},
		"studio":           {},
	}
	_, ok := blocked[segments[1]]
	return ok
}

func isReadOnlyVoicePath(segments []string) bool {
	if len(segments) < 2 {
		return false
	}
	if segments[1] != "voices" {
		return false
	}
	if len(segments) == 2 {
		return true
	}
	if segments[0] != "v1" {
		return false
	}
	if len(segments) == 3 {
		return true
	}
	if len(segments) == 4 && segments[2] == "settings" && segments[3] == "default" {
		return true
	}
	if len(segments) == 4 && segments[3] == "settings" {
		return true
	}
	return false
}

func isMultipartRequest(c *gin.Context) bool {
	return strings.HasPrefix(c.Request.Header.Get("Content-Type"), "multipart/form-data")
}

func isJSONRequest(c *gin.Context) bool {
	contentType := c.Request.Header.Get("Content-Type")
	return contentType == "" || strings.HasPrefix(contentType, "application/json")
}

func requestBodyBytes(c *gin.Context) ([]byte, error) {
	storage, err := common.GetBodyStorage(c)
	if err != nil {
		return nil, err
	}
	body, err := storage.Bytes()
	if err != nil {
		return nil, err
	}
	if _, err := storage.Seek(0, io.SeekStart); err != nil {
		return nil, err
	}
	c.Request.Body = io.NopCloser(storage)
	return body, nil
}

func formField(c *gin.Context, names ...string) (string, error) {
	form, err := common.ParseMultipartFormReusable(c)
	if err != nil {
		return "", err
	}
	defer form.RemoveAll()
	for _, name := range names {
		values := form.Value[name]
		if len(values) > 0 && strings.TrimSpace(values[0]) != "" {
			return strings.TrimSpace(values[0]), nil
		}
	}
	return "", nil
}

func estimateCharacterUnits(c *gin.Context) (int, error) {
	if !isJSONRequest(c) {
		return 0, errors.New("ElevenLabs character-billed endpoint requires JSON request body")
	}
	body, err := requestBodyBytes(c)
	if err != nil {
		return 0, err
	}
	if len(bytes.TrimSpace(body)) == 0 {
		return 0, errors.New("request body is required")
	}
	var payload any
	if err := common.Unmarshal(body, &payload); err != nil {
		return 0, err
	}
	chars := countTextFields(payload)
	if chars <= 0 {
		return 0, errors.New("ElevenLabs request must contain text or prompt for character billing")
	}
	return chars, nil
}

func countTextFields(value any) int {
	switch typed := value.(type) {
	case map[string]any:
		total := 0
		for key, child := range typed {
			lowerKey := strings.ToLower(key)
			if text, ok := child.(string); ok && shouldCountTextField(lowerKey) {
				total += utf8.RuneCountInString(text)
				continue
			}
			total += countTextFields(child)
		}
		return total
	case []any:
		total := 0
		for _, child := range typed {
			total += countTextFields(child)
		}
		return total
	default:
		return 0
	}
}

func shouldCountTextField(key string) bool {
	switch key {
	case "text", "prompt":
		return true
	default:
		return false
	}
}

func estimateAudioDuration(c *gin.Context) (float64, error) {
	if !isMultipartRequest(c) {
		return 0, errors.New("ElevenLabs audio-billed endpoint requires multipart/form-data request body")
	}
	form, err := common.ParseMultipartFormReusable(c)
	if err != nil {
		return 0, err
	}
	defer form.RemoveAll()
	for _, fileHeaders := range form.File {
		for _, fileHeader := range fileHeaders {
			if fileHeader == nil || fileHeader.Size <= 0 {
				continue
			}
			file, err := fileHeader.Open()
			if err != nil {
				return 0, err
			}
			duration, durationErr := common.GetAudioDuration(c.Request.Context(), file, strings.ToLower(filepath.Ext(fileHeader.Filename)))
			_ = file.Close()
			if durationErr != nil {
				return 0, durationErr
			}
			if duration > 0 {
				return duration, nil
			}
		}
	}
	return 0, errors.New("audio file is required")
}

func estimateMusicDuration(c *gin.Context) (float64, error) {
	if !isJSONRequest(c) {
		return 0, errors.New("ElevenLabs music endpoint requires JSON request body")
	}
	body, err := requestBodyBytes(c)
	if err != nil {
		return 0, err
	}
	if len(bytes.TrimSpace(body)) == 0 {
		return 0, errors.New("request body is required")
	}
	lengthMs := gjson.GetBytes(body, "music_length_ms")
	if !lengthMs.Exists() || lengthMs.Type == gjson.Null {
		return defaultMusicDurationSeconds, nil
	}
	if lengthMs.Type != gjson.Number {
		return 0, errors.New("music_length_ms must be a number")
	}
	duration := lengthMs.Float() / 1000.0
	if duration <= 0 {
		return 0, errors.New("music_length_ms must be greater than zero")
	}
	return duration, nil
}

func durationToAudioTokens(duration float64) int {
	if duration <= 0 {
		return 0
	}
	return int(math.Round(math.Ceil(duration) / 60.0 * 1000))
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
		baseURL = constant.ChannelBaseURLs[constant.ChannelTypeElevenLabs]
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
	lower := strings.ToLower(strings.TrimSpace(name))
	if lower == "" {
		return true
	}
	switch lower {
	case "host", "content-length", "accept-encoding", "connection", "keep-alive", "proxy-authenticate", "proxy-authorization", "te", "trailer", "transfer-encoding", "upgrade", "authorization", "x-api-key", "xi-api-key", "cookie":
		return true
	default:
		return false
	}
}

func shouldCopyNativeResponseHeader(name string) bool {
	lower := strings.ToLower(strings.TrimSpace(name))
	switch lower {
	case "connection", "keep-alive", "proxy-authenticate", "proxy-authorization", "te", "trailer", "transfer-encoding", "upgrade":
		return false
	default:
		return true
	}
}

func multipartFileToBytes(fileHeader *multipart.FileHeader) ([]byte, error) {
	file, err := fileHeader.Open()
	if err != nil {
		return nil, err
	}
	defer file.Close()
	return io.ReadAll(file)
}

func BuildOpenAITranscriptionMultipart(c *gin.Context, upstreamModel string) (io.Reader, int, error) {
	form, err := common.ParseMultipartFormReusable(c)
	if err != nil {
		return nil, 0, fmt.Errorf("error parsing multipart form: %w", err)
	}
	defer form.RemoveAll()

	var requestBody bytes.Buffer
	writer := multipart.NewWriter(&requestBody)
	_ = writer.WriteField("model_id", upstreamModel)

	for key, values := range form.Value {
		if key == "model" || key == "model_id" {
			continue
		}
		fieldName := key
		if key == "language" {
			fieldName = "language_code"
		}
		for _, value := range values {
			_ = writer.WriteField(fieldName, value)
		}
	}

	fileHeaders := form.File["file"]
	if len(fileHeaders) == 0 {
		return nil, 0, errors.New("file is required")
	}
	fileHeader := fileHeaders[0]
	fileBytes, err := multipartFileToBytes(fileHeader)
	if err != nil {
		return nil, 0, err
	}
	part, err := writer.CreateFormFile("file", fileHeader.Filename)
	if err != nil {
		return nil, 0, err
	}
	if _, err := part.Write(fileBytes); err != nil {
		return nil, 0, err
	}

	file, err := fileHeader.Open()
	if err != nil {
		return nil, 0, err
	}
	duration, durationErr := common.GetAudioDuration(c.Request.Context(), file, strings.ToLower(filepath.Ext(fileHeader.Filename)))
	_ = file.Close()
	if durationErr != nil {
		return nil, 0, durationErr
	}
	audioTokens := durationToAudioTokens(duration)

	if err := writer.Close(); err != nil {
		return nil, 0, err
	}
	c.Request.Header.Set("Content-Type", writer.FormDataContentType())
	return &requestBody, audioTokens, nil
}

// OpenAIAudioModel returns the upstream ElevenLabs model for the OpenAI-shaped
// /v1/audio bridge. Explicit model names are preserved: OpenAI models such as
// tts-1 or whisper-1 are not ElevenLabs aliases and must not be translated.
func OpenAIAudioModel(modelName string, speech bool) string {
	modelName = strings.TrimSpace(modelName)
	if modelName != "" {
		return modelName
	}
	if speech {
		return DefaultTTSModel
	}
	return DefaultSTTModel
}

func OutputFormatQueryValue(responseFormat string) string {
	switch strings.ToLower(strings.TrimSpace(responseFormat)) {
	case "mp3", "":
		return "mp3_44100_128"
	case "opus":
		return "opus_48000_64"
	case "wav":
		return "wav_44100"
	case "pcm":
		return "pcm_24000"
	default:
		return ""
	}
}
