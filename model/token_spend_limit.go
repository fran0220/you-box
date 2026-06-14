package model

import (
	"time"

	"github.com/QuantumNous/new-api/common"
)

// Recurring spend-limit reset for API keys (OpenRouter-style). This is an
// additive, fork-owned feature: a key with SpendLimit > 0 and a recurring
// ResetPeriod has its RemainQuota refilled to SpendLimit every period. The
// limit itself is enforced by the existing RemainQuota decrement on each
// request, so the billing hot path is never touched here.

const (
	ResetPeriodNone    = "none"
	ResetPeriodDaily   = "daily"
	ResetPeriodWeekly  = "weekly"
	ResetPeriodMonthly = "monthly"
)

// IsValidResetPeriod reports whether a period string triggers recurring resets.
func IsValidResetPeriod(period string) bool {
	switch period {
	case ResetPeriodDaily, ResetPeriodWeekly, ResetPeriodMonthly:
		return true
	}
	return false
}

// computeNextResetTime returns the next reset timestamp (unix seconds) for a
// period, measured from `from`. Returns 0 for non-recurring periods.
func computeNextResetTime(from int64, period string) int64 {
	t := time.Unix(from, 0).UTC()
	switch period {
	case ResetPeriodDaily:
		return t.AddDate(0, 0, 1).Unix()
	case ResetPeriodWeekly:
		return t.AddDate(0, 0, 7).Unix()
	case ResetPeriodMonthly:
		return t.AddDate(0, 1, 0).Unix()
	default:
		return 0
	}
}

// ResetDueTokenSpendLimits refills the RemainQuota of tokens whose recurring
// spend window has elapsed back to their SpendLimit, and schedules the next
// reset. Newly-created keys (NextResetTime == 0) are only scheduled — their
// initial RemainQuota is set at creation time — so usage in the first interval
// is not refunded. Returns the number of tokens processed.
func ResetDueTokenSpendLimits(limit int) (int, error) {
	if limit <= 0 {
		limit = 500
	}
	now := common.GetTimestamp()

	var tokens []Token
	err := DB.Where(
		"reset_period IN (?) AND spend_limit > 0 AND (next_reset_time = 0 OR next_reset_time <= ?)",
		[]string{ResetPeriodDaily, ResetPeriodWeekly, ResetPeriodMonthly}, now,
	).Limit(limit).Find(&tokens).Error
	if err != nil {
		return 0, err
	}
	if len(tokens) == 0 {
		return 0, nil
	}

	processed := 0
	for i := range tokens {
		token := tokens[i]
		next := computeNextResetTime(now, token.ResetPeriod)
		if next == 0 {
			continue
		}

		if token.NextResetTime == 0 {
			// First time seen: just schedule. The key's initial RemainQuota was
			// set to SpendLimit at creation, so do not refill (avoids refunding
			// usage in the first interval).
			if err := DB.Model(&Token{}).Where("id = ?", token.Id).
				Update("next_reset_time", next).Error; err != nil {
				continue
			}
		} else {
			// Period elapsed: refill the budget and schedule the next reset.
			if err := DB.Model(&Token{}).Where("id = ?", token.Id).Updates(map[string]interface{}{
				"remain_quota":    token.SpendLimit,
				"used_quota":      0,
				"next_reset_time": next,
			}).Error; err != nil {
				continue
			}
			if common.RedisEnabled {
				_ = cacheDeleteToken(token.Key)
			}
		}
		processed++
	}
	return processed, nil
}
