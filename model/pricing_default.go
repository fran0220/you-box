package model

import (
	"strings"
)

type defaultModelCatalogMetadata struct {
	Vendor         string
	Description    string
	DescriptionKey string
	Tags           string
	Icon           string
}

var defaultVendorDescriptions = map[string]string{
	"ElevenLabs": "Voice AI platform for speech synthesis, transcription, sound effects, music generation, and audio processing.",
}

var defaultVendorDescriptionKeys = map[string]string{
	"ElevenLabs": "Voice AI platform for speech synthesis, transcription, sound effects, music generation, and audio processing.",
}

var defaultModelCatalogMetadataByName = map[string]defaultModelCatalogMetadata{
	"eleven_v3": {
		Vendor:         "ElevenLabs",
		Description:    "ElevenLabs' latest expressive text-to-speech model for high-quality voice generation.",
		DescriptionKey: "ElevenLabs' latest expressive text-to-speech model for high-quality voice generation.",
		Tags:           "tts,voice,audio",
		Icon:           "ElevenLabs.Avatar",
	},
	"scribe_v2": {
		Vendor:         "ElevenLabs",
		Description:    "Speech-to-text model for transcription, subtitles, and spoken-language understanding.",
		DescriptionKey: "Speech-to-text model for transcription, subtitles, and spoken-language understanding.",
		Tags:           "stt,transcription,audio",
		Icon:           "ElevenLabs.Avatar",
	},
	"eleven_multilingual_sts_v2": {
		Vendor:         "ElevenLabs",
		Description:    "Speech-to-speech model for transforming spoken audio while preserving expressive delivery.",
		DescriptionKey: "Speech-to-speech model for transforming spoken audio while preserving expressive delivery.",
		Tags:           "speech-to-speech,voice,audio",
		Icon:           "ElevenLabs.Avatar",
	},
	"eleven_text_to_sound_v2": {
		Vendor:         "ElevenLabs",
		Description:    "Text-to-sound-effects model for short SFX, notification sounds, game audio, and ambience.",
		DescriptionKey: "Text-to-sound-effects model for short SFX, notification sounds, game audio, and ambience.",
		Tags:           "sfx,sound-effects,audio",
		Icon:           "ElevenLabs.Avatar",
	},
	"music_v2": {
		Vendor:         "ElevenLabs",
		Description:    "Music generation model for prompt-driven instrumental tracks, stings, and longer compositions.",
		DescriptionKey: "Music generation model for prompt-driven instrumental tracks, stings, and longer compositions.",
		Tags:           "music,generation,audio",
		Icon:           "ElevenLabs.Avatar",
	},
	"elevenlabs-audio-isolation": {
		Vendor:         "ElevenLabs",
		Description:    "Audio isolation capability for separating or enhancing speech from noisy source audio.",
		DescriptionKey: "Audio isolation capability for separating or enhancing speech from noisy source audio.",
		Tags:           "isolation,cleanup,audio",
		Icon:           "ElevenLabs.Avatar",
	},
	"elevenlabs-forced-alignment": {
		Vendor:         "ElevenLabs",
		Description:    "Forced alignment capability that aligns transcript text to audio and returns word and character timestamps.",
		DescriptionKey: "Forced alignment capability that aligns transcript text to audio and returns word and character timestamps.",
		Tags:           "alignment,timestamps,audio",
		Icon:           "ElevenLabs.Avatar",
	},
}

// 简化的供应商映射规则
var defaultVendorRules = map[string]string{
	"gpt":                  "OpenAI",
	"dall-e":               "OpenAI",
	"whisper":              "OpenAI",
	"tts-":                 "OpenAI",
	"o1":                   "OpenAI",
	"o3":                   "OpenAI",
	"eleven_":              "ElevenLabs",
	"elevenlabs":           "ElevenLabs",
	"eleven_text_to_sound": "ElevenLabs",
	"music_v":              "ElevenLabs",
	"scribe":               "ElevenLabs",
	"claude":               "Anthropic",
	"gemini":               "Google",
	"moonshot":             "Moonshot",
	"kimi":                 "Moonshot",
	"chatglm":              "智谱",
	"glm-":                 "智谱",
	"qwen":                 "阿里巴巴",
	"deepseek":             "DeepSeek",
	"abab":                 "MiniMax",
	"ernie":                "百度",
	"spark":                "讯飞",
	"hunyuan":              "腾讯",
	"command":              "Cohere",
	"@cf/":                 "Cloudflare",
	"360":                  "360",
	"yi":                   "零一万物",
	"jina":                 "Jina",
	"mistral":              "Mistral",
	"grok":                 "xAI",
	"llama":                "Meta",
	"doubao":               "字节跳动",
	"kling":                "快手",
	"jimeng":               "即梦",
	"vidu":                 "Vidu",
}

// 供应商默认图标映射
var defaultVendorIcons = map[string]string{
	"OpenAI":     "OpenAI",
	"ElevenLabs": "ElevenLabs.Avatar",
	"Anthropic":  "Claude.Color",
	"Google":     "Gemini.Color",
	"Moonshot":   "Moonshot",
	"智谱":         "Zhipu.Color",
	"阿里巴巴":       "Qwen.Color",
	"DeepSeek":   "DeepSeek.Color",
	"MiniMax":    "Minimax.Color",
	"百度":         "Wenxin.Color",
	"讯飞":         "Spark.Color",
	"腾讯":         "Hunyuan.Color",
	"Cohere":     "Cohere.Color",
	"Cloudflare": "Cloudflare.Color",
	"360":        "Ai360.Color",
	"零一万物":       "Yi.Color",
	"Jina":       "Jina",
	"Mistral":    "Mistral.Color",
	"xAI":        "XAI",
	"Meta":       "Ollama",
	"字节跳动":       "Doubao.Color",
	"快手":         "Kling.Color",
	"即梦":         "Jimeng.Color",
	"Vidu":       "Vidu",
	"微软":         "AzureAI",
	"Microsoft":  "AzureAI",
	"Azure":      "AzureAI",
}

func defaultVendorNameForModel(modelName string) string {
	if metadata, exists := defaultModelCatalogMetadataByName[modelName]; exists {
		return metadata.Vendor
	}

	modelLower := strings.ToLower(modelName)
	for pattern, vendorName := range defaultVendorRules {
		if strings.Contains(modelLower, pattern) {
			return vendorName
		}
	}
	return ""
}

func applyDefaultVendorMetadata(vendor *Vendor) {
	if vendor == nil {
		return
	}
	if vendor.Description == "" {
		vendor.Description = defaultVendorDescriptions[vendor.Name]
	}
	if vendor.Icon == "" {
		vendor.Icon = getDefaultVendorIcon(vendor.Name)
	}
}

func applyDefaultModelMetadata(model *Model) {
	if model == nil {
		return
	}
	metadata, exists := defaultModelCatalogMetadataByName[model.ModelName]
	if !exists {
		return
	}
	if model.Description == "" {
		model.Description = metadata.Description
	}
	if model.Tags == "" {
		model.Tags = metadata.Tags
	}
	if model.Icon == "" {
		model.Icon = metadata.Icon
	}
}

func defaultModelDescriptionKey(modelName string, description string) string {
	metadata, exists := defaultModelCatalogMetadataByName[modelName]
	if !exists {
		return ""
	}
	if strings.TrimSpace(description) == "" || description == metadata.Description {
		return metadata.DescriptionKey
	}
	return ""
}

func defaultVendorDescriptionKey(vendorName string, description string) string {
	defaultDescription, exists := defaultVendorDescriptions[vendorName]
	if !exists {
		return ""
	}
	if strings.TrimSpace(description) == "" || description == defaultDescription {
		return defaultVendorDescriptionKeys[vendorName]
	}
	return ""
}

// initDefaultVendorMapping 简化的默认供应商映射
func initDefaultVendorMapping(metaMap map[string]*Model, vendorMap map[int]*Vendor, enableAbilities []AbilityWithChannel) {
	for _, ability := range enableAbilities {
		modelName := ability.Model
		if existing, exists := metaMap[modelName]; exists {
			if existing.VendorID == 0 {
				if vendorName := defaultVendorNameForModel(modelName); vendorName != "" {
					existing.VendorID = getOrCreateVendor(vendorName, vendorMap)
				}
			}
			applyDefaultModelMetadata(existing)
			continue
		}

		// 匹配供应商
		vendorID := 0
		if vendorName := defaultVendorNameForModel(modelName); vendorName != "" {
			vendorID = getOrCreateVendor(vendorName, vendorMap)
		}

		// 创建模型元数据
		metadata := &Model{
			ModelName: modelName,
			VendorID:  vendorID,
			Status:    1,
			NameRule:  NameRuleExact,
		}
		applyDefaultModelMetadata(metadata)
		metaMap[modelName] = metadata
	}
}

// 查找或创建供应商
func getOrCreateVendor(vendorName string, vendorMap map[int]*Vendor) int {
	// 查找现有供应商
	for id, vendor := range vendorMap {
		if vendor.Name == vendorName {
			applyDefaultVendorMetadata(vendor)
			return id
		}
	}

	// 创建新供应商
	newVendor := &Vendor{
		Name:        vendorName,
		Description: defaultVendorDescriptions[vendorName],
		Status:      1,
		Icon:        getDefaultVendorIcon(vendorName),
	}

	if err := newVendor.Insert(); err != nil {
		return 0
	}

	vendorMap[newVendor.Id] = newVendor
	return newVendor.Id
}

// 获取供应商默认图标
func getDefaultVendorIcon(vendorName string) string {
	if icon, exists := defaultVendorIcons[vendorName]; exists {
		return icon
	}
	return ""
}
