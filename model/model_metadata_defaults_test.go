package model

import (
	"testing"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/constant"
	"github.com/stretchr/testify/require"
)

func TestEnsureModelMetadataForNamesUsesElevenLabsCatalog(t *testing.T) {
	truncateTables(t)

	require.NoError(t, EnsureModelMetadataForNames([]string{"eleven_v3", "gpt-image-2", "custom-audio-model"}, nil))

	var metadata Model
	require.NoError(t, DB.Where("model_name = ?", "eleven_v3").First(&metadata).Error)
	require.Equal(t, "ElevenLabs' latest expressive text-to-speech model for high-quality voice generation.", metadata.Description)
	require.Equal(t, "tts,voice,audio", metadata.Tags)
	require.Equal(t, "ElevenLabs.Avatar", metadata.Icon)
	require.Equal(t, NameRuleExact, metadata.NameRule)
	require.Equal(t, 1, metadata.Status)

	var vendor Vendor
	require.NoError(t, DB.First(&vendor, metadata.VendorID).Error)
	require.Equal(t, "ElevenLabs", vendor.Name)
	require.Equal(t, "Voice AI platform for speech synthesis, transcription, sound effects, music generation, and audio processing.", vendor.Description)

	var placeholder Model
	require.NoError(t, DB.Where("model_name = ?", "custom-audio-model").First(&placeholder).Error)
	require.Equal(t, 0, placeholder.Status)
	require.Empty(t, placeholder.Description)

	var imageModel Model
	require.NoError(t, DB.Where("model_name = ?", "gpt-image-2").First(&imageModel).Error)
	require.Equal(t, 1, imageModel.Status)
	require.Equal(t, "Image generation model for creating and editing high-quality images from text and visual prompts.", imageModel.Description)
	require.Equal(t, "image,generation,vision", imageModel.Tags)
	require.Equal(t, "OpenAI", imageModel.Icon)
}

func TestEnsureModelMetadataForNamesFillsExistingElevenLabsCatalog(t *testing.T) {
	truncateTables(t)

	require.NoError(t, DB.Create(&Model{ModelName: "eleven_multilingual_sts_v2", Status: 1, SyncOfficial: 1, NameRule: NameRuleExact}).Error)
	grokPlaceholder := &Model{ModelName: "grok-composer-2.5-fast", Status: 0, SyncOfficial: 1, NameRule: NameRuleExact}
	require.NoError(t, grokPlaceholder.Insert())
	var seededGrok Model
	require.NoError(t, DB.Where("model_name = ?", "grok-composer-2.5-fast").First(&seededGrok).Error)
	require.Equal(t, 0, seededGrok.Status)

	require.NoError(t, EnsureModelMetadataForNames([]string{"eleven_multilingual_sts_v2", "grok-composer-2.5-fast"}, nil))

	var metadata Model
	require.NoError(t, DB.Where("model_name = ?", "eleven_multilingual_sts_v2").First(&metadata).Error)
	require.Equal(t, "Speech-to-speech model for transforming spoken audio while preserving expressive delivery.", metadata.Description)
	require.Equal(t, "speech-to-speech,voice,audio", metadata.Tags)
	require.Equal(t, "ElevenLabs.Avatar", metadata.Icon)
	require.Equal(t, 1, metadata.Status)

	var vendor Vendor
	require.NoError(t, DB.First(&vendor, metadata.VendorID).Error)
	require.Equal(t, "ElevenLabs", vendor.Name)

	var grok Model
	require.NoError(t, DB.Where("model_name = ?", "grok-composer-2.5-fast").First(&grok).Error)
	require.Equal(t, "Fast Grok Composer model for code generation, agentic editing, and text workflows.", grok.Description)
	require.Equal(t, "chat,code,agent", grok.Tags)
	require.Equal(t, "XAI.Color", grok.Icon)
	require.Equal(t, 0, grok.Status)
}

func TestPricingRequiresConfiguredModelMetadata(t *testing.T) {
	truncateTables(t)
	priority := int64(0)
	require.NoError(t, DB.Create(&Channel{
		Id:     1,
		Name:   "elevenlabs",
		Type:   constant.ChannelTypeElevenLabs,
		Status: common.ChannelStatusEnabled,
	}).Error)
	require.NoError(t, DB.Create(&Ability{
		Group:     "default",
		Model:     "eleven_v3",
		ChannelId: 1,
		Enabled:   true,
		Priority:  &priority,
	}).Error)

	InvalidatePricingCache()
	require.Empty(t, GetPricing())

	require.NoError(t, EnsureModelMetadataForNames([]string{"eleven_v3"}, nil))
	InvalidatePricingCache()
	pricing := GetPricing()
	require.Len(t, pricing, 1)
	require.Equal(t, "eleven_v3", pricing[0].ModelName)
	require.Equal(t, "ElevenLabs' latest expressive text-to-speech model for high-quality voice generation.", pricing[0].Description)
	require.NotEmpty(t, pricing[0].DescriptionKey)
}
