package common

const (
	defaultOpenRouterReferer = "https://api.you-box.com"
	defaultOpenRouterTitle   = "BoxAI"
)

var SystemName = "BoxAI"

func OpenRouterReferer() string {
	return defaultOpenRouterReferer
}

func OpenRouterTitle() string {
	if SystemName != "" {
		return SystemName
	}
	return defaultOpenRouterTitle
}
