package appusage

import (
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
)

const flushInterval = 30 * time.Second

func flushLoop() {
	ticker := time.NewTicker(flushInterval)
	defer ticker.Stop()
	for range ticker.C {
		flush()
	}
}

// flush drains the in-memory counters and persists them with additive upserts.
// On failure a batch is re-accumulated so it is retried on the next tick.
func flush() {
	mu.Lock()
	if len(hot) == 0 {
		mu.Unlock()
		return
	}
	snapshot := hot
	hot = map[aggKey]*counters{}
	mu.Unlock()

	for key, c := range snapshot {
		if c.requests == 0 {
			continue
		}
		err := model.UpsertAppUsage(&model.AppUsage{
			App:          key.app,
			ModelName:    key.model,
			RequestCount: c.requests,
			TotalTokens:  c.tokens,
		})
		if err != nil {
			common.SysError("failed to flush app usage: " + err.Error())
			mu.Lock()
			existing := hot[key]
			if existing == nil {
				existing = &counters{}
				hot[key] = existing
			}
			existing.requests += c.requests
			existing.tokens += c.tokens
			mu.Unlock()
		}
	}
}
