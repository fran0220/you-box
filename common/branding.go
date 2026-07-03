package common

const (
	defaultOpenRouterReferer = "https://api.you-box.com"
	defaultOpenRouterTitle   = "AI Gateway"
	DefaultMetaDescription   = "Unified AI API gateway and admin dashboard."
)

var SystemName = "AI Gateway"

func OpenRouterReferer() string {
	return defaultOpenRouterReferer
}

func OpenRouterTitle() string {
	if SystemName != "" {
		return SystemName
	}
	return defaultOpenRouterTitle
}
