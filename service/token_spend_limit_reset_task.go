package service

import (
	"context"
	"fmt"
	"sync"
	"sync/atomic"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/logger"
	"github.com/QuantumNous/new-api/model"

	"github.com/bytedance/gopkg/util/gopool"
)

// Fork-owned background task that refills API keys with a recurring spend
// budget (see model.ResetDueTokenSpendLimits). Mirrors the subscription quota
// reset task so it composes with the existing scheduler conventions.

const (
	tokenSpendLimitResetTickInterval = 1 * time.Minute
	tokenSpendLimitResetBatchSize    = 500
)

var (
	tokenSpendLimitResetOnce    sync.Once
	tokenSpendLimitResetRunning atomic.Bool
)

func StartTokenSpendLimitResetTask() {
	tokenSpendLimitResetOnce.Do(func() {
		if !common.IsMasterNode {
			return
		}
		gopool.Go(func() {
			logger.LogInfo(context.Background(), fmt.Sprintf("token spend limit reset task started: tick=%s", tokenSpendLimitResetTickInterval))
			ticker := time.NewTicker(tokenSpendLimitResetTickInterval)
			defer ticker.Stop()

			runTokenSpendLimitResetOnce()
			for range ticker.C {
				runTokenSpendLimitResetOnce()
			}
		})
	})
}

func runTokenSpendLimitResetOnce() {
	if !tokenSpendLimitResetRunning.CompareAndSwap(false, true) {
		return
	}
	defer tokenSpendLimitResetRunning.Store(false)

	ctx := context.Background()
	total := 0
	for {
		n, err := model.ResetDueTokenSpendLimits(tokenSpendLimitResetBatchSize)
		if err != nil {
			logger.LogWarn(ctx, fmt.Sprintf("token spend limit reset task failed: %v", err))
			return
		}
		total += n
		if n < tokenSpendLimitResetBatchSize {
			break
		}
	}
	if common.DebugEnabled && total > 0 {
		logger.LogDebug(ctx, "token spend limit reset: count=%d", total)
	}
}
