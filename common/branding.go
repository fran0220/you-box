package common

import "github.com/QuantumNous/new-api/product"

const (
	defaultOpenRouterTitle = "Origin Gateway"
	DefaultMetaDescription = "Origin Gateway — unified AI API gateway, accounts, quota, and admin console for OriginGame."
)

// SystemName is the operator-facing brand string (emails, page title, OpenRouter title).
var SystemName = "Origin Gateway"

// OpenRouterReferer returns the public product origin for upstream HTTP-Referer.
// Driven by PRODUCT_ID (see product.Profile).
func OpenRouterReferer() string {
	if url := product.PublicBaseURL(); url != "" {
		return url
	}
	return "https://api.origingame.dev"
}

func OpenRouterTitle() string {
	if name := product.Current().DisplayName; name != "" {
		return name
	}
	if SystemName != "" {
		return SystemName
	}
	return defaultOpenRouterTitle
}
