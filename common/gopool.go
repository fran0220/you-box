package common

import (
	"context"
	"fmt"
	"math"

	"github.com/bytedance/gopkg/util/gopool"
)

var relayGoPool gopool.Pool

type relayStopChanContextKey struct{}

func ContextWithRelayStopChan(ctx context.Context, stopChan chan bool) context.Context {
	return context.WithValue(ctx, relayStopChanContextKey{}, stopChan)
}

func relayStopChanFromContext(ctx context.Context) (chan bool, bool) {
	if ctx == nil {
		return nil, false
	}
	stopChan, ok := ctx.Value(relayStopChanContextKey{}).(chan bool)
	return stopChan, ok
}

func init() {
	relayGoPool = gopool.NewPool("gopool.RelayPool", math.MaxInt32, gopool.NewConfig())
	relayGoPool.SetPanicHandler(func(ctx context.Context, i interface{}) {
		if stopChan, ok := relayStopChanFromContext(ctx); ok {
			SafeSendBool(stopChan, true)
		}
		SysError(fmt.Sprintf("panic in gopool.RelayPool: %v", i))
	})
}

func RelayCtxGo(ctx context.Context, f func()) {
	relayGoPool.CtxGo(ctx, f)
}
