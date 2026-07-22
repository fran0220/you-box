package common

import (
	"context"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestRelayStopChanContextRoundTrip(t *testing.T) {
	stopChan := make(chan bool, 1)
	ctx := ContextWithRelayStopChan(context.Background(), stopChan)

	got, ok := relayStopChanFromContext(ctx)
	require.True(t, ok)
	require.Equal(t, stopChan, got)
}
