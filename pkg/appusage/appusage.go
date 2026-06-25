// Package appusage implements OpenRouter-style app attribution: requests that
// carry an HTTP-Referer / X-Title header are aggregated by (app, model) and
// surfaced as an apps leaderboard. It is an additive, fork-owned feature
// modeled on pkg/perf_metrics — counters accumulate in memory and flush to the
// app_usage table with additive upserts, so the billing hot path is untouched.
package appusage

import (
	"net/url"
	"strings"
	"sync"
)

type aggKey struct {
	app   string
	model string
}

type counters struct {
	requests int64
	tokens   int64
}

var (
	mu  sync.Mutex
	hot = map[aggKey]*counters{}
)

func firstNonEmpty(values ...string) string {
	for _, v := range values {
		if strings.TrimSpace(v) != "" {
			return strings.TrimSpace(v)
		}
	}
	return ""
}

func truncate(s string, max int) string {
	if len(s) > max {
		return s[:max]
	}
	return s
}

// resolveApp derives a stable, human-readable app label from the title and
// referer. A title wins; otherwise the referer's host is used. Returns "" when
// the request carries no attribution (such requests are not recorded).
func resolveApp(title, referer string) string {
	if title != "" {
		return truncate(title, 255)
	}
	if referer == "" {
		return ""
	}
	if u, err := url.Parse(referer); err == nil && u.Host != "" {
		return u.Host
	}
	return truncate(referer, 255)
}

// RecordFromHeaders extracts attribution headers and records a sample. Header
// key casing is normalized internally, so canonical MIME keys (e.g. "X-Title",
// "Http-Referer" from net/http) and already-lowercased keys both work.
func RecordFromHeaders(headers map[string]string, modelName string, tokens int64) {
	if len(headers) == 0 {
		return
	}
	// Build a lowercased-key view without mutating the caller's map. Later keys
	// of the same normalized name win; in practice attribution keys are unique.
	lower := make(map[string]string, len(headers))
	for k, v := range headers {
		lower[strings.ToLower(k)] = v
	}
	title := firstNonEmpty(lower["x-title"], lower["x-openrouter-title"])
	referer := firstNonEmpty(lower["referer"], lower["http-referer"])
	Record(title, referer, modelName, tokens)
}

// Record accumulates one attributed request. No-op when the request carries no
// app attribution or no model.
func Record(title, referer, modelName string, tokens int64) {
	app := resolveApp(title, referer)
	if app == "" || modelName == "" {
		return
	}
	if tokens < 0 {
		tokens = 0
	}

	mu.Lock()
	key := aggKey{app: app, model: modelName}
	c := hot[key]
	if c == nil {
		c = &counters{}
		hot[key] = c
	}
	c.requests++
	c.tokens += tokens
	mu.Unlock()
}

// Init starts the periodic flush loop.
func Init() {
	go flushLoop()
}
