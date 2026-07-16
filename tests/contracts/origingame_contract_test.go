package contracts_test

import (
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"testing"

	"github.com/QuantumNous/new-api/product"
)

func repoRoot(t *testing.T) string {
	t.Helper()
	_, file, _, _ := runtime.Caller(0)
	return filepath.Join(filepath.Dir(file), "..", "..")
}

// TestOriginGameContractDocExists ensures the freeze-list doc is present and
// still names the critical consumer paths OriginGame depends on.
func TestOriginGameContractDocExists(t *testing.T) {
	path := filepath.Join(repoRoot(t), "docs", "origingame-contract.md")
	data, err := os.ReadFile(path)
	if err != nil {
		t.Fatalf("read contract doc: %v", err)
	}
	body := string(data)
	required := []string{
		"/api/user/login",
		"/api/user/self",
		"/api/token/",
		"/api/log/self",
		"/v1/models",
		"/v1/chat/completions",
		"/v1/sound-generation",
		"/v1/music",
		"/v1/embeddings",
		"grok-4.5",
		"subscriptions",
		"Origin Gateway",
	}
	for _, needle := range required {
		if !strings.Contains(body, needle) {
			t.Errorf("origingame-contract.md missing required mention: %q", needle)
		}
	}
}

// TestOriginGatewayFeatureFreeze documents product defaults used by OriginGame.
func TestOriginGatewayFeatureFreeze(t *testing.T) {
	t.Setenv("PRODUCT_ID", "origingame")
	t.Setenv("PRODUCT_PUBLIC_BASE_URL", "")
	product.Init()

	if product.ID() != product.IDOriginGame {
		t.Fatalf("id: got %q", product.ID())
	}
	if product.Current().DisplayName != "Origin Gateway" {
		t.Fatalf("display: %q", product.Current().DisplayName)
	}

	// Must stay on for portal billing
	if !product.Enabled(product.FeatureSubscriptions) {
		t.Fatal("subscriptions must be enabled for OriginGame portal")
	}

	// Retail / agent surfaces off by default
	off := []product.FeatureKey{
		product.FeatureAgentDesktop,
		product.FeatureRankings,
		product.FeaturePlaygroundPresets,
		product.FeaturePublicMarketing,
	}
	for _, key := range off {
		if product.Enabled(key) {
			t.Errorf("feature %s should be off for origingame", key)
		}
	}
}

func TestDefaultProductIsOriginGateway(t *testing.T) {
	t.Setenv("PRODUCT_ID", "")
	t.Setenv("PRODUCT_PUBLIC_BASE_URL", "")
	product.Init()
	if product.ID() != product.IDOriginGame {
		t.Fatalf("empty PRODUCT_ID should default to origingame, got %q", product.ID())
	}
	if product.PublicBaseURL() != "https://api.origingame.dev" {
		t.Fatalf("default public base: %q", product.PublicBaseURL())
	}
}
