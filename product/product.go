package product

import (
	"os"
	"strings"
	"sync"
)

// Product identity for dual-host / multi-skin deployments.
// Selected at process start via PRODUCT_ID (runtime, single image).
const (
	IDYouBox     = "youbox"
	IDOriginGame = "origingame"
)

// FeatureKey is a stable capability flag shared by backend and frontend.
// Keep the set small; delete keys when products converge.
type FeatureKey string

const (
	FeatureAgentDesktop      FeatureKey = "agent_desktop"
	FeatureModelPlaza        FeatureKey = "model_plaza"
	FeatureRankings          FeatureKey = "rankings"
	FeaturePlaygroundPresets FeatureKey = "playground_presets"
	FeaturePublicMarketing   FeatureKey = "public_marketing"
	FeatureSubscriptions     FeatureKey = "subscriptions"
)

// FeatureSet is the product capability map. JSON keys match FeatureKey values.
type FeatureSet struct {
	AgentDesktop      bool `json:"agent_desktop"`
	ModelPlaza        bool `json:"model_plaza"`
	Rankings          bool `json:"rankings"`
	PlaygroundPresets bool `json:"playground_presets"`
	PublicMarketing   bool `json:"public_marketing"`
	Subscriptions     bool `json:"subscriptions"`
}

// Profile is the runtime product definition exposed via /api/status under "product".
type Profile struct {
	ID            string     `json:"id"`
	DisplayName   string     `json:"display_name"`
	PublicBaseURL string     `json:"public_base_url"`
	Features      FeatureSet `json:"features"`
}

var (
	mu      sync.RWMutex
	current Profile
)

func init() {
	// Safe default before Init(); production calls Init from common.InitEnv.
	current = profileFor(IDYouBox, "")
}

// Init loads PRODUCT_ID and optional PRODUCT_PUBLIC_BASE_URL from the environment.
// Unknown IDs fall back to youbox.
func Init() {
	id := strings.ToLower(strings.TrimSpace(os.Getenv("PRODUCT_ID")))
	if id == "" {
		id = IDYouBox
	}
	override := strings.TrimSpace(os.Getenv("PRODUCT_PUBLIC_BASE_URL"))
	p := profileFor(id, override)
	mu.Lock()
	current = p
	mu.Unlock()
}

// Current returns a copy of the active product profile.
func Current() Profile {
	mu.RLock()
	defer mu.RUnlock()
	return current
}

// ID returns the active product id.
func ID() string {
	return Current().ID
}

// Enabled reports whether a feature is on for the active product.
func Enabled(key FeatureKey) bool {
	f := Current().Features
	switch key {
	case FeatureAgentDesktop:
		return f.AgentDesktop
	case FeatureModelPlaza:
		return f.ModelPlaza
	case FeatureRankings:
		return f.Rankings
	case FeaturePlaygroundPresets:
		return f.PlaygroundPresets
	case FeaturePublicMarketing:
		return f.PublicMarketing
	case FeatureSubscriptions:
		return f.Subscriptions
	default:
		return false
	}
}

// PublicBaseURL returns the product public origin (no trailing slash).
func PublicBaseURL() string {
	return strings.TrimRight(Current().PublicBaseURL, "/")
}

// StatusPayload is nested under /api/status data.product (upstream-safe seam).
func StatusPayload() map[string]any {
	p := Current()
	return map[string]any{
		"id":              p.ID,
		"display_name":    p.DisplayName,
		"public_base_url": p.PublicBaseURL,
		"features":        p.Features,
	}
}

func profileFor(id, publicBaseURLOverride string) Profile {
	switch id {
	case IDOriginGame:
		p := Profile{
			ID:          IDOriginGame,
			DisplayName: "Origin Gateway",
			// Distinct public origin for OpenRouter referer / agent issuer fallback.
			PublicBaseURL: "https://api.origingame.dev",
			Features:      fullFeatures(),
		}
		if publicBaseURLOverride != "" {
			p.PublicBaseURL = strings.TrimRight(publicBaseURLOverride, "/")
		}
		return p
	default:
		// youbox and any unknown id
		p := Profile{
			ID:            IDYouBox,
			DisplayName:   "YouBox",
			PublicBaseURL: "https://you-box.com",
			Features:      fullFeatures(),
		}
		if id != IDYouBox && id != "" {
			// Preserve explicit unknown ids in logs via ID, but keep youbox defaults.
			// Callers should only set known PRODUCT_ID values.
			p.ID = IDYouBox
		}
		if publicBaseURLOverride != "" {
			p.PublicBaseURL = strings.TrimRight(publicBaseURLOverride, "/")
		}
		return p
	}
}

// fullFeatures is the Phase-0 default: both products expose the same capabilities
// so deploy is behavior-preserving. Turn keys off per product as divergence appears.
func fullFeatures() FeatureSet {
	return FeatureSet{
		AgentDesktop:      true,
		ModelPlaza:        true,
		Rankings:          true,
		PlaygroundPresets: true,
		PublicMarketing:   true,
		Subscriptions:     true,
	}
}
