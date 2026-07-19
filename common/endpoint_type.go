package common

import (
	"strings"

	"github.com/QuantumNous/new-api/constant"
)

func elevenLabsEndpointTypes(modelName string) []constant.EndpointType {
	switch modelName {
	case "eleven_v3":
		return []constant.EndpointType{constant.EndpointTypeAudioTTS}
	case "scribe_v2":
		return []constant.EndpointType{constant.EndpointTypeAudioSTT}
	case "eleven_multilingual_sts_v2":
		return []constant.EndpointType{constant.EndpointTypeAudioSpeechToSpeech}
	case "eleven_text_to_sound_v2":
		return []constant.EndpointType{constant.EndpointTypeAudioSFX}
	case "music_v2":
		return []constant.EndpointType{constant.EndpointTypeAudioMusic}
	case "elevenlabs-audio-isolation":
		return []constant.EndpointType{constant.EndpointTypeAudioIsolation}
	case "elevenlabs-forced-alignment":
		return []constant.EndpointType{constant.EndpointTypeAudioAlignment}
	default:
		return nil
	}
}

func meshyEndpointTypes(modelName string) []constant.EndpointType {
	switch modelName {
	case "meshy-text-to-3d":
		return []constant.EndpointType{constant.EndpointTypeModel3DText}
	case "meshy-image-to-3d":
		return []constant.EndpointType{constant.EndpointTypeModel3DImage}
	case "meshy-multi-image-to-3d":
		return []constant.EndpointType{constant.EndpointTypeModel3DMultiImage}
	case "meshy-remesh":
		return []constant.EndpointType{constant.EndpointTypeModel3DRemesh}
	case "meshy-convert":
		return []constant.EndpointType{constant.EndpointTypeModel3DConvert}
	case "meshy-resize":
		return []constant.EndpointType{constant.EndpointTypeModel3DResize}
	case "meshy-retexture":
		return []constant.EndpointType{constant.EndpointTypeModel3DRetexture}
	case "meshy-rigging":
		return []constant.EndpointType{constant.EndpointTypeModel3DRigging}
	case "meshy-animation":
		return []constant.EndpointType{constant.EndpointTypeModel3DCharacterAnim}
	case "meshy-uv-unwrap":
		return []constant.EndpointType{constant.EndpointTypeModel3DPostProcess}
	default:
		return nil
	}
}

// GetEndpointTypesByChannelType 获取渠道最优先端点类型。
// ElevenLabs 音频能力使用细粒度端点类型，避免模型广场把 TTS/STT/SFX/Music 等都显示成笼统 Audio。
// 其他音频模型继续归入 audio，避免模型广场把 TTS/STT/语音处理模型显示为 Chat。
func GetEndpointTypesByChannelType(channelType int, modelName string) []constant.EndpointType {
	var endpointTypes []constant.EndpointType
	if IsImageGenerationModel(modelName) {
		return []constant.EndpointType{constant.EndpointTypeImageGeneration}
	}
	if channelType == constant.ChannelTypeGemini && strings.Contains(strings.ToLower(modelName), "embedding") {
		return []constant.EndpointType{constant.EndpointTypeEmbeddings, constant.EndpointTypeGeminiEmbedding}
	}
	if elevenLabsTypes := elevenLabsEndpointTypes(modelName); len(elevenLabsTypes) > 0 {
		endpointTypes = elevenLabsTypes
	} else if meshyTypes := meshyEndpointTypes(modelName); len(meshyTypes) > 0 {
		endpointTypes = meshyTypes
	} else if IsAudioModel(modelName) {
		endpointTypes = []constant.EndpointType{constant.EndpointTypeAudio}
	} else {
		switch channelType {
		case constant.ChannelTypeJina:
			endpointTypes = []constant.EndpointType{constant.EndpointTypeJinaRerank}
		//case constant.ChannelTypeMidjourney, constant.ChannelTypeMidjourneyPlus:
		//	endpointTypes = []constant.EndpointType{constant.EndpointTypeMidjourney}
		//case constant.ChannelTypeSunoAPI:
		//	endpointTypes = []constant.EndpointType{constant.EndpointTypeSuno}
		//case constant.ChannelTypeKling:
		//	endpointTypes = []constant.EndpointType{constant.EndpointTypeKling}
		//case constant.ChannelTypeJimeng:
		//	endpointTypes = []constant.EndpointType{constant.EndpointTypeJimeng}
		case constant.ChannelTypeAws:
			fallthrough
		case constant.ChannelTypeAnthropic:
			endpointTypes = []constant.EndpointType{constant.EndpointTypeAnthropic, constant.EndpointTypeOpenAI}
		case constant.ChannelTypeVertexAi:
			fallthrough
		case constant.ChannelTypeGemini:
			endpointTypes = []constant.EndpointType{constant.EndpointTypeGemini, constant.EndpointTypeOpenAI}
		case constant.ChannelTypeOpenRouter: // OpenRouter 只支持 OpenAI 端点
			endpointTypes = []constant.EndpointType{constant.EndpointTypeOpenAI}
		case constant.ChannelTypeXai:
			endpointTypes = []constant.EndpointType{constant.EndpointTypeOpenAI, constant.EndpointTypeOpenAIResponse}
		case constant.ChannelTypeSora:
			endpointTypes = []constant.EndpointType{constant.EndpointTypeOpenAIVideo}
		default:
			if IsOpenAIResponseOnlyModel(modelName) {
				endpointTypes = []constant.EndpointType{constant.EndpointTypeOpenAIResponse}
			} else {
				endpointTypes = []constant.EndpointType{constant.EndpointTypeOpenAI}
			}
		}
	}
	return endpointTypes
}
