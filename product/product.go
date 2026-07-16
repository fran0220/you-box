package product

import (
	"os"
	"strings"
	"sync"
)

// Product identity for runtime skins / feature sets (single image).
// Production default is Origin Gateway (origingame). PRODUCT_ID=youbox remains
// a local/demo Circuit skin only — not a production host for this repo.
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
	current = profileFor(IDOriginGame, "")
}

// Init loads PRODUCT_ID and optional PRODUCT_PUBLIC_BASE_URL from the environment.
// Empty or unknown IDs fall back to origingame (Origin Gateway).
func Init() {
	id := strings.ToLower(strings.TrimSpace(os.Getenv("PRODUCT_ID")))
	if id == "" {
		id = IDOriginGame
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
	case IDYouBox:
		p := Profile{
			ID:            IDYouBox,
			DisplayName:   "YouBox",
			PublicBaseURL: "https://you-box.com",
			// Local/demo Circuit skin keeps full feature surface for redesign demos.
			Features: fullFeatures(),
		}
		if publicBaseURLOverride != "" {
			p.PublicBaseURL = strings.TrimRight(publicBaseURLOverride, "/")
		}
		return p
	default:
		// origingame and any unknown id → Origin Gateway production profile
		p := Profile{
			ID:          IDOriginGame,
			DisplayName: "Origin Gateway",
			// Distinct public origin for OpenRouter referer / agent issuer fallback.
			PublicBaseURL: "https://api.origingame.dev",
			Features:      originGatewayFeatures(),
		}
		if id != IDOriginGame && id != "" && id != IDYouBox {
			// Unknown ids: keep origingame defaults but preserve safe production id.
			p.ID = IDOriginGame
		}
		if publicBaseURLOverride != "" {
			p.PublicBaseURL = strings.TrimRight(publicBaseURLOverride, "/")
		}
		return p
	}
}

// fullFeatures: demo/youbox skin — all capability keys on.
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

// originGatewayFeatures: production Origin Gateway for OriginGame consumers.
// Retail / agent-desktop surfaces off; billing subscriptions stay on (portal).
func originGatewayFeatures() FeatureSet {
	return FeatureSet{
		AgentDesktop:      false,
		ModelPlaza:        false,
		Rankings:          false,
		PlaygroundPresets: false,
		PublicMarketing:   false,
		Subscriptions:     true,
	}
}
