package billingexpr_test

import (
	"testing"

	"github.com/QuantumNous/new-api/pkg/billingexpr"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestVersion2DocumentVideoAndV1Compatibility(t *testing.T) {
	_, _, err := billingexpr.RunExpr(`doc + vid`, billingexpr.TokenParams{Doc: 1, Vid: 1})
	require.Error(t, err, "unprefixed expressions must retain the v1 environment")
	_, _, err = billingexpr.RunExpr(`v1:doc + vid`, billingexpr.TokenParams{Doc: 1, Vid: 1})
	require.Error(t, err)
	cost, _, err := billingexpr.RunExpr(`v2:p*.20+img*.45+doc*.45+ai*6.50+vid*12`, billingexpr.TokenParams{
		P: 100, Img: 200, Doc: 300, AI: 400, Vid: 500,
	})
	require.NoError(t, err)
	assert.InDelta(t, 8845, cost, 1e-9)
}
