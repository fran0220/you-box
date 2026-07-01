package service

import (
	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/pkg/appusage"
)

func StartYouBoxBackgroundTasks() {
	// API key recurring spend-limit reset task (daily/weekly/monthly).
	StartTokenSpendLimitResetTask()

	// Auto top-up balance monitoring (low-balance alerts).
	StartAutoTopUpTask()
}

func InitYouBoxRuntimeResources() {
	appusage.Init()
	if err := InitAgentAuthKeys(); err != nil {
		common.SysLog("agent auth keys not initialized: " + err.Error())
	}
}
