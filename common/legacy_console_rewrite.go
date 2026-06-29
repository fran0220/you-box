package common

import "strings"

// legacyConsolePathRewrites maps classic-frontend /console/* prefixes to
// their default-theme equivalents. Order matters: more specific prefixes
// must come before shorter ones. /console/setting and /console/deployment
// are intentionally absent — their query parameters (tab, deployment_id)
// are remapped by dedicated redirect routes in the default frontend.
var legacyConsolePathRewrites = []struct {
	prefix      string
	replacement string
}{
	{"/console/topup", "/wallet"},
	{"/console/log", "/usage-logs"},
	{"/console/personal", "/profile"},
	{"/console/channel", "/channels"},
	{"/console/token", "/keys"},
	{"/console/redemption", "/redemption-codes"},
	{"/console/user", "/users"},
	{"/console/models", "/models"},
	{"/console/subscription", "/subscriptions"},
	{"/console/playground", "/playground"},
	{"/console/midjourney", "/usage-logs/drawing"},
	{"/console/task", "/usage-logs/task"},
	{"/console/chat", "/chat"},
}

// ThemeAwarePath rewrites legacy /console/* paths (used by the removed
// classic frontend) to their current equivalents. It only touches known
// prefixes so it is safe to call with arbitrary suffixes and query strings.
func ThemeAwarePath(suffix string) string {
	for _, rule := range legacyConsolePathRewrites {
		if strings.HasPrefix(suffix, rule.prefix) {
			return strings.Replace(suffix, rule.prefix, rule.replacement, 1)
		}
	}
	if suffix == "/console" || suffix == "/console/" || strings.HasPrefix(suffix, "/console?") {
		return strings.Replace(suffix, "/console", "/dashboard", 1)
	}
	return suffix
}
