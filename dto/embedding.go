package dto

import (
	"fmt"
	"strings"

	"github.com/QuantumNous/new-api/types"

	"github.com/gin-gonic/gin"
)

type EmbeddingOptions struct {
	Seed             int      `json:"seed,omitempty"`
	Temperature      *float64 `json:"temperature,omitempty"`
	TopK             int      `json:"top_k,omitempty"`
	TopP             *float64 `json:"top_p,omitempty"`
	FrequencyPenalty *float64 `json:"frequency_penalty,omitempty"`
	PresencePenalty  *float64 `json:"presence_penalty,omitempty"`
	NumPredict       int      `json:"num_predict,omitempty"`
	NumCtx           int      `json:"num_ctx,omitempty"`
}

type EmbeddingRequest struct {
	Model            string   `json:"model"`
	Input            any      `json:"input"`
	EncodingFormat   string   `json:"encoding_format,omitempty"`
	Dimensions       *int     `json:"dimensions,omitempty"`
	User             string   `json:"user,omitempty"`
	Seed             *float64 `json:"seed,omitempty"`
	Temperature      *float64 `json:"temperature,omitempty"`
	TopP             *float64 `json:"top_p,omitempty"`
	FrequencyPenalty *float64 `json:"frequency_penalty,omitempty"`
	PresencePenalty  *float64 `json:"presence_penalty,omitempty"`
}

func (r *EmbeddingRequest) GetTokenCountMeta() *types.TokenCountMeta {
	var texts = make([]string, 0)

	inputs := r.ParseInput()
	texts = append(texts, inputs...)

	return &types.TokenCountMeta{
		CombineText: strings.Join(texts, "\n"),
	}
}

func (r *EmbeddingRequest) IsStream(c *gin.Context) bool {
	return false
}

func (r *EmbeddingRequest) SetModelName(modelName string) {
	if modelName != "" {
		r.Model = modelName
	}
}

func (r *EmbeddingRequest) ParseInput() []string {
	if r.Input == nil {
		return make([]string, 0)
	}
	var input []string
	switch r.Input.(type) {
	case string:
		input = []string{r.Input.(string)}
	case []any:
		input = make([]string, 0, len(r.Input.([]any)))
		for _, item := range r.Input.([]any) {
			if str, ok := item.(string); ok {
				input = append(input, str)
			}
		}
	}
	return input
}

// ParseTextInput parses the OpenAI embeddings input without discarding invalid
// array members. The OpenAI-compatible endpoint is intentionally text-only.
func (r *EmbeddingRequest) ParseTextInput() ([]string, error) {
	if r.Input == nil {
		return nil, fmt.Errorf("input is required")
	}
	switch input := r.Input.(type) {
	case string:
		return []string{input}, nil
	case []any:
		texts := make([]string, len(input))
		for i, item := range input {
			text, ok := item.(string)
			if !ok {
				return nil, fmt.Errorf("input[%d] must be a string", i)
			}
			texts[i] = text
		}
		return texts, nil
	default:
		return nil, fmt.Errorf("input must be a string or an array of strings")
	}
}

type EmbeddingResponseItem struct {
	Object    string    `json:"object"`
	Index     int       `json:"index"`
	Embedding []float64 `json:"embedding"`
}

type EmbeddingResponse struct {
	Object string                  `json:"object"`
	Data   []EmbeddingResponseItem `json:"data"`
	Model  string                  `json:"model"`
	Usage  `json:"usage"`
}
