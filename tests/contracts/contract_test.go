package contracts_test

import (
	"encoding/json"
	"os"
	"path/filepath"
	"runtime"
	"testing"
)

func contractPath(name string) string {
	_, file, _, _ := runtime.Caller(0)
	root := filepath.Join(filepath.Dir(file), "..", "..")
	return filepath.Join(root, "docs", "contracts", name)
}

func loadContract(t *testing.T, name string) map[string]any {
	t.Helper()
	data, err := os.ReadFile(contractPath(name))
	if err != nil {
		t.Fatalf("read contract %s: %v", name, err)
	}
	var doc map[string]any
	if err := json.Unmarshal(data, &doc); err != nil {
		t.Fatalf("parse contract %s: %v", name, err)
	}
	return doc
}

func TestAgentAuthContractExists(t *testing.T) {
	doc := loadContract(t, "agent-auth.json")
	if doc["title"] != "YouBox Agent Auth API" {
		t.Fatalf("unexpected title: %v", doc["title"])
	}
	defs, ok := doc["definitions"].(map[string]any)
	if !ok {
		t.Fatal("missing definitions")
	}
	for _, key := range []string{"AuthorizeRequest", "ExchangeRequest", "RefreshRequest", "TokenResponse", "JWKSResponse"} {
		if _, ok := defs[key]; !ok {
			t.Fatalf("missing definition %s", key)
		}
	}
}

func TestAgentModelsContractExists(t *testing.T) {
	doc := loadContract(t, "agent-models.json")
	required, ok := doc["required"].([]any)
	if !ok {
		t.Fatal("missing required array")
	}
	if len(required) < 3 {
		t.Fatalf("expected at least 3 required fields, got %d", len(required))
	}
}

func TestAgentServiceContractExists(t *testing.T) {
	doc := loadContract(t, "agent-service-v1.json")
	defs, ok := doc["definitions"].(map[string]any)
	if !ok {
		t.Fatal("missing definitions")
	}
	for _, key := range []string{"Policy", "Device", "Workspace", "Session", "AuditEvent"} {
		if _, ok := defs[key]; !ok {
			t.Fatalf("missing definition %s", key)
		}
	}
}
