package model

import (
	"errors"
	"strings"

	"github.com/QuantumNous/new-api/common"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
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
	"gpt-image-2": {
		Vendor:         "OpenAI",
		Description:    "Image generation model for creating and editing high-quality images from text and visual prompts.",
		DescriptionKey: "Image generation model for creating and editing high-quality images from text and visual prompts.",
		Tags:           "image,generation,vision",
		Icon:           "OpenAI",
	},
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
	"grok-composer-2.5-fast": {
		Vendor:         "xAI",
		Description:    "Fast Grok Composer model for code generation, agentic editing, and text workflows.",
		DescriptionKey: "Fast Grok Composer model for code generation, agentic editing, and text workflows.",
		Tags:           "chat,code,agent",
		Icon:           "XAI.Color",
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

func normalizeModelMetadataNames(modelNames []string) []string {
	seen := make(map[string]struct{}, len(modelNames))
	names := make([]string, 0, len(modelNames))
	for _, modelName := range modelNames {
		modelName = strings.TrimSpace(modelName)
		if modelName == "" {
			continue
		}
		if _, exists := seen[modelName]; exists {
			continue
		}
		seen[modelName] = struct{}{}
		names = append(names, modelName)
	}
	return names
}

func getOrCreateVendorWithDB(db *gorm.DB, vendorName string, vendorMap map[int]*Vendor) (int, error) {
	vendorName = strings.TrimSpace(vendorName)
	if vendorName == "" {
		return 0, nil
	}

	for id, vendor := range vendorMap {
		if vendor.Name == vendorName {
			updates := make(map[string]interface{})
			if strings.TrimSpace(vendor.Description) == "" && defaultVendorDescriptions[vendor.Name] != "" {
				vendor.Description = defaultVendorDescriptions[vendor.Name]
				updates["description"] = vendor.Description
			}
			if strings.TrimSpace(vendor.Icon) == "" && getDefaultVendorIcon(vendor.Name) != "" {
				vendor.Icon = getDefaultVendorIcon(vendor.Name)
				updates["icon"] = vendor.Icon
			}
			if len(updates) > 0 {
				if err := db.Model(&Vendor{}).Where("id = ?", id).Updates(updates).Error; err != nil {
					return 0, err
				}
			}
			return id, nil
		}
	}

	var existing Vendor
	if err := db.Where("name = ?", vendorName).First(&existing).Error; err == nil {
		vendorMap[existing.Id] = &existing
		return getOrCreateVendorWithDB(db, vendorName, vendorMap)
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return 0, err
	}

	vendor := &Vendor{
		Name:        vendorName,
		Description: defaultVendorDescriptions[vendorName],
		Status:      1,
		Icon:        getDefaultVendorIcon(vendorName),
	}
	if err := db.Create(vendor).Error; err != nil {
		return 0, err
	}
	vendorMap[vendor.Id] = vendor
	return vendor.Id, nil
}

func fillExistingDefaultModelMetadataWithDB(db *gorm.DB, modelName string, vendorMap map[int]*Vendor) error {
	metadata, exists := defaultModelCatalogMetadataByName[modelName]
	if !exists {
		return nil
	}

	var existing Model
	if err := db.Where("model_name = ?", modelName).First(&existing).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil
		}
		return err
	}

	updates := make(map[string]interface{})
	if strings.TrimSpace(existing.Description) == "" && metadata.Description != "" {
		updates["description"] = metadata.Description
	}
	if strings.TrimSpace(existing.Tags) == "" && metadata.Tags != "" {
		updates["tags"] = metadata.Tags
	}
	if strings.TrimSpace(existing.Icon) == "" && metadata.Icon != "" {
		updates["icon"] = metadata.Icon
	}
	if existing.VendorID == 0 && strings.TrimSpace(metadata.Vendor) != "" {
		vendorID, err := getOrCreateVendorWithDB(db, metadata.Vendor, vendorMap)
		if err != nil {
			return err
		}
		updates["vendor_id"] = vendorID
	}
	if len(updates) == 0 {
		return nil
	}
	updates["updated_time"] = common.GetTimestamp()
	return db.Model(&Model{}).Where("id = ?", existing.Id).Updates(updates).Error
}

// EnsureModelMetadataForNames creates editable model metadata rows for channel
// models that are missing from the admin catalog. Model prices still live in
// system option maps (ModelRatio, ModelPrice, CompletionRatio, ...); these rows
// are the admin-facing catalog entries needed to edit those prices and decide
// whether a model is listed in the model plaza.
func EnsureModelMetadataForNames(modelNames []string, tx *gorm.DB) error {
	names := normalizeModelMetadataNames(modelNames)
	if len(names) == 0 {
		return nil
	}

	db := DB
	if tx != nil {
		db = tx
	}

	var existingNames []string
	if err := db.Model(&Model{}).Where("model_name IN ?", names).Pluck("model_name", &existingNames).Error; err != nil {
		return err
	}
	existingSet := make(map[string]struct{}, len(existingNames))
	for _, modelName := range existingNames {
		existingSet[modelName] = struct{}{}
	}

	var vendors []Vendor
	if err := db.Find(&vendors).Error; err != nil {
		return err
	}
	vendorMap := make(map[int]*Vendor, len(vendors))
	for i := range vendors {
		vendorMap[vendors[i].Id] = &vendors[i]
	}
	for _, modelName := range names {
		if _, exists := existingSet[modelName]; exists {
			if err := fillExistingDefaultModelMetadataWithDB(db, modelName, vendorMap); err != nil {
				return err
			}
		}
	}

	now := common.GetTimestamp()
	modelsToCreate := make([]Model, 0)
	disabledModelNames := make([]string, 0)
	for _, modelName := range names {
		if _, exists := existingSet[modelName]; exists {
			continue
		}

		status := 0
		if _, hasDefaultCatalog := defaultModelCatalogMetadataByName[modelName]; hasDefaultCatalog {
			status = 1
		}

		metadata := Model{
			ModelName:    modelName,
			Status:       status,
			SyncOfficial: 1,
			NameRule:     NameRuleExact,
			CreatedTime:  now,
			UpdatedTime:  now,
		}
		if vendorName := defaultVendorNameForModel(modelName); vendorName != "" {
			vendorID, err := getOrCreateVendorWithDB(db, vendorName, vendorMap)
			if err != nil {
				return err
			}
			metadata.VendorID = vendorID
		}
		applyDefaultModelMetadata(&metadata)
		modelsToCreate = append(modelsToCreate, metadata)
		if status == 0 {
			disabledModelNames = append(disabledModelNames, modelName)
		}
	}

	if len(modelsToCreate) == 0 {
		return nil
	}
	if err := db.Clauses(clause.OnConflict{DoNothing: true}).Create(&modelsToCreate).Error; err != nil {
		return err
	}
	if len(disabledModelNames) > 0 {
		return db.Model(&Model{}).Where("model_name IN ?", disabledModelNames).Update("status", 0).Error
	}
	return nil
}

func EnsureModelMetadataForEnabledModels() error {
	return EnsureModelMetadataForNames(GetEnabledModels(), nil)
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
