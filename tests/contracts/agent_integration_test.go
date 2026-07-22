package contracts_test

import (
	"testing"

	"github.com/QuantumNous/new-api/constant"
	"github.com/QuantumNous/new-api/service"
)

func TestAgentRedirectURIContract(t *testing.T) {
	uri := service.BuildAgentRedirectURI("testcode", "state12345678")
	if uri[:len(constant.AgentDeepLinkScheme)] != constant.AgentDeepLinkScheme {
		t.Fatalf("unexpected scheme in %q", uri)
	}
}

func TestAgentJWKSContractShape(t *testing.T) {
	t.Setenv("AGENT_JWT_ALLOW_EPHEMERAL", "true")
	if err := service.InitAgentAuthKeys(); err != nil {
		t.Fatalf("init: %v", err)
	}
	jwks, err := service.AgentJWKS()
	if err != nil {
		t.Fatalf("jwks: %v", err)
	}
	keys, ok := jwks["keys"].([]map[string]any)
	if !ok || len(keys) == 0 {
		t.Fatal("missing keys")
	}
	for _, field := range []string{"kty", "kid", "alg", "n", "e"} {
		if keys[0][field] == nil || keys[0][field] == "" {
			t.Fatalf("missing jwk field %s", field)
		}
	}
}
