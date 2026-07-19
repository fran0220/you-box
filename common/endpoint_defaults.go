package common

import "github.com/QuantumNous/new-api/constant"

// EndpointInfo 描述单个端点的默认请求信息
// path: 上游路径
// method: HTTP 请求方式，例如 POST/GET
// 目前均为 POST，后续可扩展
//
// json 标签用于直接序列化到 API 输出
// 例如：{"path":"/v1/chat/completions","method":"POST"}

type EndpointInfo struct {
	Path   string `json:"path"`
	Method string `json:"method"`
}

// defaultEndpointInfoMap 保存内置端点的默认 Path 与 Method
var defaultEndpointInfoMap = map[constant.EndpointType]EndpointInfo{
	constant.EndpointTypeOpenAI:                {Path: "/v1/chat/completions", Method: "POST"},
	constant.EndpointTypeOpenAIResponse:        {Path: "/v1/responses", Method: "POST"},
	constant.EndpointTypeOpenAIResponseCompact: {Path: "/v1/responses/compact", Method: "POST"},
	constant.EndpointTypeAnthropic:             {Path: "/v1/messages", Method: "POST"},
	constant.EndpointTypeGemini:                {Path: "/v1beta/models/{model}:generateContent", Method: "POST"},
	constant.EndpointTypeGeminiEmbedding:       {Path: "/v1beta/models/{model}:embedContent", Method: "POST"},
	constant.EndpointTypeJinaRerank:            {Path: "/v1/rerank", Method: "POST"},
	constant.EndpointTypeImageGeneration:       {Path: "/v1/images/generations", Method: "POST"},
	constant.EndpointTypeEmbeddings:            {Path: "/v1/embeddings", Method: "POST"},
	constant.EndpointTypeAudio:                 {Path: "/v1/audio/speech", Method: "POST"},
	constant.EndpointTypeAudioTTS:              {Path: "/v1/audio/speech", Method: "POST"},
	constant.EndpointTypeAudioSTT:              {Path: "/v1/audio/transcriptions", Method: "POST"},
	constant.EndpointTypeAudioSpeechToSpeech:   {Path: "/elevenlabs/v1/speech-to-speech/{voice_id}", Method: "POST"},
	constant.EndpointTypeAudioSFX:              {Path: "/elevenlabs/v1/sound-generation", Method: "POST"},
	constant.EndpointTypeAudioMusic:            {Path: "/elevenlabs/v1/music/stream", Method: "POST"},
	constant.EndpointTypeAudioIsolation:        {Path: "/elevenlabs/v1/audio-isolation", Method: "POST"},
	constant.EndpointTypeAudioAlignment:        {Path: "/elevenlabs/v1/forced-alignment", Method: "POST"},
	constant.EndpointTypeModel3D:               {Path: "/meshy/openapi/v2/text-to-3d", Method: "POST"},
	constant.EndpointTypeModel3DText:           {Path: "/meshy/openapi/v2/text-to-3d", Method: "POST"},
	constant.EndpointTypeModel3DImage:          {Path: "/meshy/openapi/v1/image-to-3d", Method: "POST"},
	constant.EndpointTypeModel3DMultiImage:     {Path: "/meshy/openapi/v1/multi-image-to-3d", Method: "POST"},
	constant.EndpointTypeModel3DPostProcess:    {Path: "/meshy/openapi/v1/remesh", Method: "POST"},
	constant.EndpointTypeModel3DAnimation:      {Path: "/meshy/openapi/v1/rigging", Method: "POST"},
	constant.EndpointTypeModel3DRemesh:         {Path: "/meshy/openapi/v1/remesh", Method: "POST"},
	constant.EndpointTypeModel3DConvert:        {Path: "/meshy/openapi/v1/convert", Method: "POST"},
	constant.EndpointTypeModel3DResize:         {Path: "/meshy/openapi/v1/resize", Method: "POST"},
	constant.EndpointTypeModel3DRetexture:      {Path: "/meshy/openapi/v1/retexture", Method: "POST"},
	constant.EndpointTypeModel3DRigging:        {Path: "/meshy/openapi/v1/rigging", Method: "POST"},
	constant.EndpointTypeModel3DCharacterAnim:  {Path: "/meshy/openapi/v1/animations", Method: "POST"},
}

// GetDefaultEndpointInfo 返回指定端点类型的默认信息以及是否存在
func GetDefaultEndpointInfo(et constant.EndpointType) (EndpointInfo, bool) {
	info, ok := defaultEndpointInfoMap[et]
	return info, ok
}
