package relay

import (
	"testing"

	"github.com/QuantumNous/new-api/dto"
	"github.com/stretchr/testify/require"
)

func TestValidateEmbeddingBillingModalities(t *testing.T) {
	usage := &dto.Usage{}
	usage.PromptTokensDetails.ImageTokens = 1
	usage.PromptTokensDetails.DocumentTokens = 2
	usage.PromptTokensDetails.AudioTokens = 3
	usage.PromptTokensDetails.VideoTokens = 4

	require.NoError(t, validateEmbeddingBillingModalities(usage, map[string]bool{
		"img": true, "doc": true, "ai": true, "vid": true,
	}))

	for _, missing := range []string{"img", "doc", "ai", "vid"} {
		t.Run(missing, func(t *testing.T) {
			vars := map[string]bool{"img": true, "doc": true, "ai": true, "vid": true}
			delete(vars, missing)
			require.ErrorContains(t, validateEmbeddingBillingModalities(usage, vars), missing+" modality")
		})
	}
}
