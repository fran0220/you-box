package service

import (
	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/pkg/appusage"
	"github.com/QuantumNous/new-api/product"
)

func StartYouBoxBackgroundTasks() {
	// API key recurring spend-limit reset task (daily/weekly/monthly).
	StartTokenSpendLimitResetTask()

	// Auto top-up balance monitoring (low-balance alerts).
	StartAutoTopUpTask()
}

func InitYouBoxRuntimeResources() {
	// Apps leaderboard attribution only when rankings feature is on.
	if product.Enabled(product.FeatureRankings) {
		appusage.Init()
	}
	if product.Enabled(product.FeatureAgentDesktop) {
		if err := InitAgentAuthKeys(); err != nil {
			common.SysLog("agent auth keys not initialized: " + err.Error())
		}
	}
}
