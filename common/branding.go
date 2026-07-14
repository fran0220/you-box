package common

import "github.com/QuantumNous/new-api/product"

const (
	defaultOpenRouterTitle = "AI Gateway"
	DefaultMetaDescription = "Unified AI API gateway and admin dashboard."
)

var SystemName = "AI Gateway"

// OpenRouterReferer returns the public product origin for upstream HTTP-Referer.
// Driven by PRODUCT_ID (see product.Profile), not a hardcoded you-box.com URL.
func OpenRouterReferer() string {
	if url := product.PublicBaseURL(); url != "" {
		return url
	}
	return "https://you-box.com"
}

func OpenRouterTitle() string {
	if SystemName != "" {
		return SystemName
	}
	return defaultOpenRouterTitle
}
