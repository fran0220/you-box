package dto

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestEmbeddingRequestParseTextInputRejectsMixedAndNonText(t *testing.T) {
	for _, input := range []any{[]any{"ok", float64(1)}, map[string]any{"text": "no"}, []any{[]any{"tokens"}}} {
		_, err := (&EmbeddingRequest{Input: input}).ParseTextInput()
		require.Error(t, err)
	}
	texts, err := (&EmbeddingRequest{Input: []any{"a", "b"}}).ParseTextInput()
	require.NoError(t, err)
	assert.Equal(t, []string{"a", "b"}, texts)
}
