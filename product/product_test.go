package product

import (
	"os"
	"testing"
)

func TestInitDefaultYouBox(t *testing.T) {
	t.Setenv("PRODUCT_ID", "")
	t.Setenv("PRODUCT_PUBLIC_BASE_URL", "")
	Init()
	p := Current()
	if p.ID != IDYouBox {
		t.Fatalf("id: got %q want %q", p.ID, IDYouBox)
	}
	if p.PublicBaseURL != "https://you-box.com" {
		t.Fatalf("public base: got %q", p.PublicBaseURL)
	}
	if !Enabled(FeatureAgentDesktop) {
		t.Fatal("agent_desktop should be enabled by default")
	}
}

func TestInitOriginGame(t *testing.T) {
	t.Setenv("PRODUCT_ID", "origingame")
	t.Setenv("PRODUCT_PUBLIC_BASE_URL", "")
	Init()
	p := Current()
	if p.ID != IDOriginGame {
		t.Fatalf("id: got %q want %q", p.ID, IDOriginGame)
	}
	if p.PublicBaseURL != "https://api.origingame.dev" {
		t.Fatalf("public base: got %q", p.PublicBaseURL)
	}
	if p.DisplayName != "Origin Gateway" {
		t.Fatalf("display name: got %q", p.DisplayName)
	}
}

func TestPublicBaseURLOverride(t *testing.T) {
	t.Setenv("PRODUCT_ID", "youbox")
	t.Setenv("PRODUCT_PUBLIC_BASE_URL", "https://example.test/")
	Init()
	if PublicBaseURL() != "https://example.test" {
		t.Fatalf("override: got %q", PublicBaseURL())
	}
}

func TestUnknownIDFallsBackToYouBox(t *testing.T) {
	t.Setenv("PRODUCT_ID", "not-a-product")
	t.Setenv("PRODUCT_PUBLIC_BASE_URL", "")
	Init()
	if Current().ID != IDYouBox {
		t.Fatalf("unknown id should fall back to youbox, got %q", Current().ID)
	}
}

func TestStatusPayloadShape(t *testing.T) {
	t.Setenv("PRODUCT_ID", "origingame")
	Init()
	payload := StatusPayload()
	if payload["id"] != IDOriginGame {
		t.Fatalf("payload id: %v", payload["id"])
	}
	features, ok := payload["features"].(FeatureSet)
	if !ok {
		t.Fatalf("features type: %T", payload["features"])
	}
	if !features.ModelPlaza {
		t.Fatal("expected model_plaza true")
	}
}

func TestEnabledUnknownKey(t *testing.T) {
	t.Setenv("PRODUCT_ID", "youbox")
	Init()
	if Enabled(FeatureKey("nope")) {
		t.Fatal("unknown feature must be false")
	}
}

// Ensure t.Setenv isolation does not leak PRODUCT_ID into other packages' process
// when tests run in parallel elsewhere — restore empty after package tests.
func TestMain(m *testing.M) {
	code := m.Run()
	_ = os.Unsetenv("PRODUCT_ID")
	_ = os.Unsetenv("PRODUCT_PUBLIC_BASE_URL")
	Init()
	os.Exit(code)
}
