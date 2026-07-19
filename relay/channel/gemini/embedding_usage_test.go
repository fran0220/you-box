package gemini

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/QuantumNous/new-api/dto"
	relaycommon "github.com/QuantumNous/new-api/relay/common"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestGeminiEmbeddingUsageAllModalities(t *testing.T) {
	usage, err := geminiEmbeddingUsage(&dto.GeminiEmbeddingUsageMetadata{
		PromptTokenCount: 150, TotalTokenCount: 150,
		PromptTokenDetails: []dto.GeminiPromptTokensDetails{
			{Modality: "TEXT", TokenCount: 10}, {Modality: "IMAGE", TokenCount: 20},
			{Modality: "AUDIO", TokenCount: 30}, {Modality: "DOCUMENT", TokenCount: 40},
			{Modality: "VIDEO", TokenCount: 50},
		},
	}, &dto.Usage{PromptTokens: 999})
	assert.NoError(t, err)
	assert.Equal(t, 150, usage.PromptTokens)
	assert.Equal(t, 10, usage.PromptTokensDetails.TextTokens)
	assert.Equal(t, 20, usage.PromptTokensDetails.ImageTokens)
	assert.Equal(t, 30, usage.PromptTokensDetails.AudioTokens)
	assert.Equal(t, 40, usage.PromptTokensDetails.DocumentTokens)
	assert.Equal(t, 50, usage.PromptTokensDetails.VideoTokens)
}

func TestCountEmbeddingTokensUsesSelectedChannelAndPluralDetails(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		assert.Equal(t, "/v1beta/models/gemini-embedding-2:countTokens", r.URL.Path)
		assert.Equal(t, "selected-key", r.Header.Get("x-goog-api-key"))
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"totalTokens":70,"promptTokensDetails":[{"modality":"TEXT","tokenCount":10},{"modality":"VIDEO","tokenCount":60}]}`))
	}))
	defer server.Close()

	c, _ := gin.CreateTestContext(httptest.NewRecorder())
	c.Request = httptest.NewRequest(http.MethodPost, "/v1beta/models/gemini-embedding-2:embedContent", nil)
	usage, err := CountEmbeddingTokens(c, &relaycommon.RelayInfo{ChannelMeta: &relaycommon.ChannelMeta{
		ChannelBaseUrl: server.URL, ApiKey: "selected-key", UpstreamModelName: "gemini-embedding-2",
	}}, []dto.GeminiChatContent{{Parts: []dto.GeminiPart{{Text: "hello"}}}})
	require.NoError(t, err)
	assert.Equal(t, 70, usage.PromptTokens)
	assert.Equal(t, 10, usage.PromptTokensDetails.TextTokens)
	assert.Equal(t, 60, usage.PromptTokensDetails.VideoTokens)
}

func TestGeminiEmbeddingUsageRejectsUnknownModality(t *testing.T) {
	_, err := geminiEmbeddingUsage(&dto.GeminiEmbeddingUsageMetadata{
		PromptTokenCount:   1,
		PromptTokenDetails: []dto.GeminiPromptTokensDetails{{Modality: "UNKNOWN", TokenCount: 1}},
	}, &dto.Usage{PromptTokens: 999})
	require.ErrorContains(t, err, "unsupported usage modality")
}

func TestGeminiEmbeddingUsageRejectsNegativeModalityCount(t *testing.T) {
	_, err := geminiEmbeddingUsage(&dto.GeminiEmbeddingUsageMetadata{
		PromptTokenCount:   1,
		PromptTokenDetails: []dto.GeminiPromptTokensDetails{{Modality: "TEXT", TokenCount: -1}},
	}, &dto.Usage{PromptTokens: 999})
	require.ErrorContains(t, err, "negative TEXT token count")
}

func TestGeminiEmbeddingUsageFallsBackWhenDetailsAreMissing(t *testing.T) {
	fallback := &dto.Usage{PromptTokens: 7}
	usage, err := geminiEmbeddingUsage(&dto.GeminiEmbeddingUsageMetadata{PromptTokenCount: 7}, fallback)
	assert.NoError(t, err)
	assert.Same(t, fallback, usage)
}

func TestGeminiEmbeddingUsageFallsBackWithoutMetadata(t *testing.T) {
	fallback := &dto.Usage{PromptTokens: 7}
	usage, err := geminiEmbeddingUsage(nil, fallback)
	assert.NoError(t, err)
	assert.Same(t, fallback, usage)
}
