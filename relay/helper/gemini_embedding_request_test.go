package helper

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/QuantumNous/new-api/common"
	relayconstant "github.com/QuantumNous/new-api/relay/constant"
	"github.com/QuantumNous/new-api/types"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func geminiRequestContext(path, body string) *gin.Context {
	c, _ := gin.CreateTestContext(httptest.NewRecorder())
	c.Request = httptest.NewRequest("POST", path, strings.NewReader(body))
	c.Request.Header.Set("Content-Type", "application/json")
	return c
}

func TestIsGeminiEmbeddingPath(t *testing.T) {
	assert.True(t, IsGeminiEmbeddingPath("/v1beta/models/gemini-embedding-2:embedContent"))
	assert.True(t, IsGeminiEmbeddingPath("/v1beta/models/gemini-embedding-2:batchEmbedContents"))
	assert.False(t, IsGeminiEmbeddingPath("/v1beta/models/gemini-2.5-flash:generateContent"))
}

func TestValidateOpenAIEmbeddingRejectsNonTextWithBadRequest(t *testing.T) {
	body, err := common.Marshal(map[string]any{
		"model": "gemini-embedding-2",
		"input": map[string]any{"text": "invalid"},
	})
	require.NoError(t, err)

	request, err := GetAndValidateEmbeddingRequest(
		geminiRequestContext("/v1/embeddings", string(body)),
		relayconstant.RelayModeEmbeddings,
	)
	require.Nil(t, request)
	require.ErrorContains(t, err, "input must be a string")
	var apiErr *types.NewAPIError
	require.True(t, errors.As(err, &apiErr))
	assert.Equal(t, http.StatusBadRequest, apiErr.StatusCode)
}

func TestValidateGeminiBatchEmbeddingRequest(t *testing.T) {
	tests := []struct {
		name    string
		body    string
		wantErr string
	}{
		{name: "empty", body: "{\"requests\":[]}", wantErr: "requests is required"},
		{name: "null item", body: "{\"requests\":[null]}", wantErr: "requests[0] must not be null"},
		{name: "missing parts", body: "{\"requests\":[{\"content\":{}}]}", wantErr: "requests[0].content.parts is required"},
		{name: "valid", body: "{\"requests\":[{\"content\":{\"parts\":[{\"text\":\"hello\"}]}}]}"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			request, err := GetAndValidateGeminiBatchEmbeddingRequest(geminiRequestContext("/v1beta/models/gemini-embedding-2:batchEmbedContents", tt.body))
			if tt.wantErr != "" {
				require.ErrorContains(t, err, tt.wantErr)
				return
			}
			require.NoError(t, err)
			assert.Len(t, request.Requests, 1)
		})
	}
}
