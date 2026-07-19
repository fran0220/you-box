package billing_setting

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestGeminiEmbedding2DefaultBillingExpression(t *testing.T) {
	require.Equal(t, BillingModeTieredExpr, GetBillingMode("gemini-embedding-2"))
	expr, ok := GetBillingExpr("gemini-embedding-2")
	require.True(t, ok)
	require.NoError(t, SmokeTestExpr(expr))
}
