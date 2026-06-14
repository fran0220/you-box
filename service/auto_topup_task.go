package service

import (
	"context"
	"fmt"
	"sync"
	"sync/atomic"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/dto"
	"github.com/QuantumNous/new-api/logger"
	"github.com/QuantumNous/new-api/model"

	"github.com/bytedance/gopkg/util/gopool"
)

// Auto top-up monitoring (OpenRouter-style), fork-owned and additive. When an
// opted-in user's balance drops below their configured threshold, this task
// sends an actionable low-balance notification suggesting they top up the
// configured amount.
//
// Note on scope: this intentionally does NOT perform an unattended real-money
// charge. Doing so safely requires a saved, off-session payment method and a
// consent flow that the current checkout does not establish; shipping untested
// charging code would be unsafe. attemptAutoTopUp is the extension point where
// a charge integration can be added once saved payment methods are available.

const (
	autoTopUpTickInterval = 5 * time.Minute
	autoTopUpBatchSize    = 200
	// Minimum gap between notifications to the same user, to avoid spam.
	autoTopUpCooldown = 6 * time.Hour
)

var (
	autoTopUpOnce    sync.Once
	autoTopUpRunning atomic.Bool
	// userId -> last notified unix seconds (in-memory; resets on restart, which
	// only means at most one extra notification per user after a restart).
	autoTopUpLastNotified sync.Map
)

func StartAutoTopUpTask() {
	autoTopUpOnce.Do(func() {
		if !common.IsMasterNode {
			return
		}
		gopool.Go(func() {
			logger.LogInfo(context.Background(), fmt.Sprintf("auto top-up task started: tick=%s", autoTopUpTickInterval))
			ticker := time.NewTicker(autoTopUpTickInterval)
			defer ticker.Stop()

			runAutoTopUpOnce()
			for range ticker.C {
				runAutoTopUpOnce()
			}
		})
	})
}

func runAutoTopUpOnce() {
	if !autoTopUpRunning.CompareAndSwap(false, true) {
		return
	}
	defer autoTopUpRunning.Store(false)

	ctx := context.Background()
	afterId := 0
	for {
		users, err := model.GetEnabledUsersAfter(afterId, autoTopUpBatchSize)
		if err != nil {
			logger.LogWarn(ctx, fmt.Sprintf("auto top-up scan failed: %v", err))
			return
		}
		if len(users) == 0 {
			break
		}
		for _, user := range users {
			afterId = user.Id
			processAutoTopUpUser(ctx, user)
		}
		if len(users) < autoTopUpBatchSize {
			break
		}
	}
}

func processAutoTopUpUser(ctx context.Context, user *model.User) {
	setting := user.GetSetting()
	if !setting.AutoTopupEnabled || setting.AutoTopupThreshold <= 0 {
		return
	}

	thresholdQuota := int(setting.AutoTopupThreshold * common.QuotaPerUnit)
	if user.Quota >= thresholdQuota {
		return
	}

	// Cooldown: don't notify the same user more than once per window.
	now := time.Now().Unix()
	if last, ok := autoTopUpLastNotified.Load(user.Id); ok {
		if now-last.(int64) < int64(autoTopUpCooldown.Seconds()) {
			return
		}
	}

	if attemptAutoTopUp(ctx, user, setting) {
		autoTopUpLastNotified.Store(user.Id, now)
		return
	}

	if err := sendAutoTopUpNotice(user, setting); err != nil {
		logger.LogWarn(ctx, fmt.Sprintf("auto top-up notify failed for user %d: %v", user.Id, err))
		return
	}
	autoTopUpLastNotified.Store(user.Id, now)
}

// attemptAutoTopUp is the extension point for an unattended charge. It returns
// true when a charge was performed (so no notification is sent). Today it is a
// safe no-op — see the package note above.
func attemptAutoTopUp(_ context.Context, _ *model.User, _ dto.UserSetting) bool {
	return false
}

func sendAutoTopUpNotice(user *model.User, setting dto.UserSetting) error {
	topUpLink := PaymentReturnURL("/console/topup")
	prompt := "余额不足，已触发自动充值提醒"

	notifyType := setting.NotifyType
	if notifyType == "" {
		notifyType = dto.NotifyTypeEmail
	}

	var content string
	var values []interface{}
	switch notifyType {
	case dto.NotifyTypeBark, dto.NotifyTypeGotify:
		content = "{{value}}，当前余额 {{value}}，建议充值 ${{value}}。"
		values = []interface{}{
			prompt,
			logger.FormatQuota(user.Quota),
			fmt.Sprintf("%.2f", setting.AutoTopupAmount),
		}
	default:
		content = "{{value}}，当前余额为 {{value}}，建议充值 ${{value}}。<br/>充值链接：<a href='{{value}}'>{{value}}</a>"
		values = []interface{}{
			prompt,
			logger.FormatQuota(user.Quota),
			fmt.Sprintf("%.2f", setting.AutoTopupAmount),
			topUpLink,
			topUpLink,
		}
	}

	return NotifyUser(
		user.Id,
		user.Email,
		setting,
		dto.NewNotify(dto.NotifyTypeQuotaExceed, prompt, content, values),
	)
}
