package common

import (
	"testing"

	"github.com/QuantumNous/new-api/constant"
)

func TestGptImage2IsImageGenerationModel(t *testing.T) {
	if !IsImageGenerationModel("gpt-image-2") {
		t.Fatal("gpt-image-2 should be classified as an image generation model")
	}
}

func TestGptImage2UsesImageGenerationEndpointOnly(t *testing.T) {
	endpoints := GetEndpointTypesByChannelType(constant.ChannelTypeOpenAI, "gpt-image-2")
	if len(endpoints) != 1 || endpoints[0] != constant.EndpointTypeImageGeneration {
		t.Fatalf("gpt-image-2 endpoints = %v, want image-generation only", endpoints)
	}
}
