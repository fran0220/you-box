package service

import (
	"fmt"
	"strings"
	"testing"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/constant"
	"github.com/QuantumNous/new-api/model"
)

func TestBuildAgentRedirectURI(t *testing.T) {
	uri := BuildAgentRedirectURI("abc123", "state-xyz")
	want := constant.AgentDeepLinkScheme + "?code=abc123&state=state-xyz"
	if uri != want {
		t.Fatalf("got %q want %q", uri, want)
	}
}

func TestBuildAgentRedirectURIEscapesParams(t *testing.T) {
	uri := BuildAgentRedirectURI("abc 123", "state+xyz")
	want := constant.AgentDeepLinkScheme + "?code=abc+123&state=state%2Bxyz"
	if uri != want {
		t.Fatalf("got %q want %q", uri, want)
	}
}

func TestConsumeAgentAuthCodeValidatesPKCE(t *testing.T) {
	common.RedisEnabled = false
	verifier := strings.Repeat("a", 43)
	challenge := pkceS256(verifier)
	payload := AgentAuthCodePayload{
		UserId:              1,
		ClientId:            constant.AgentClientID,
		DeviceId:            "device-pkce",
		DeviceLabel:         "MacBook",
		State:               "state-123456",
		CodeChallenge:       challenge,
		CodeChallengeMethod: "S256",
	}

	badCode, err := CreateAgentAuthCode(payload)
	if err != nil {
		t.Fatalf("create code: %v", err)
	}
	if _, err := ConsumeAgentAuthCode(badCode, constant.AgentClientID, payload.State, payload.DeviceId, strings.Repeat("b", 43)); err == nil {
		t.Fatal("expected code_verifier mismatch")
	}

	goodCode, err := CreateAgentAuthCode(payload)
	if err != nil {
		t.Fatalf("create code: %v", err)
	}
	consumed, err := ConsumeAgentAuthCode(goodCode, constant.AgentClientID, payload.State, payload.DeviceId, verifier)
	if err != nil {
		t.Fatalf("consume code: %v", err)
	}
	if consumed.DeviceId != payload.DeviceId {
		t.Fatalf("got device %q want %q", consumed.DeviceId, payload.DeviceId)
	}
}

func resetAgentAuthTables(t *testing.T) {
	t.Helper()
	cleanup := func() {
		model.DB.Exec("DELETE FROM user_agent_grants")
		model.DB.Exec("DELETE FROM tokens")
		model.DB.Exec("DELETE FROM users")
	}
	cleanup()
	t.Cleanup(cleanup)
}

func seedAgentAuthUser(t *testing.T, id int) {
	t.Helper()
	user := &model.User{Id: id, Username: fmt.Sprintf("agent-user-%d", id), AffCode: fmt.Sprintf("agent-aff-%d", id), Status: common.UserStatusEnabled, Quota: 1000000}
	if err := model.DB.Create(user).Error; err != nil {
		t.Fatalf("seed user: %v", err)
	}
}

func TestIssueAgentTokensAllowsSameDeviceForDifferentUsers(t *testing.T) {
	resetAgentAuthTables(t)
	t.Setenv("AGENT_JWT_ALLOW_EPHEMERAL", "true")
	seedAgentAuthUser(t, 101)
	seedAgentAuthUser(t, 202)

	first, err := IssueAgentTokens(101, constant.AgentClientID, "shared-device", "Shared Mac", "darwin", "1.0.0")
	if err != nil {
		t.Fatalf("issue first tokens: %v", err)
	}
	second, err := IssueAgentTokens(202, constant.AgentClientID, "shared-device", "Shared Mac", "darwin", "1.0.0")
	if err != nil {
		t.Fatalf("issue second tokens: %v", err)
	}
	if first.GrantId == second.GrantId {
		t.Fatalf("expected user-scoped grants, got same id %d", first.GrantId)
	}
}

func TestExpiredAgentRefreshRevokesGrantAndGatewayToken(t *testing.T) {
	resetAgentAuthTables(t)
	t.Setenv("AGENT_JWT_ALLOW_EPHEMERAL", "true")
	seedAgentAuthUser(t, 303)

	pair, err := IssueAgentTokens(303, constant.AgentClientID, "expiring-device", "Expiring Mac", "darwin", "1.0.0")
	if err != nil {
		t.Fatalf("issue tokens: %v", err)
	}
	grant, err := model.GetUserAgentGrantById(pair.GrantId, 303)
	if err != nil {
		t.Fatalf("load grant: %v", err)
	}
	grant.RefreshExpiresAt = common.GetTimestamp() - 1
	if err := grant.Update(); err != nil {
		t.Fatalf("expire grant: %v", err)
	}

	_, err = RefreshAgentTokens(pair.RefreshToken, constant.AgentClientID, "expiring-device", pair.GrantId)
	if err == nil || !strings.Contains(err.Error(), "expired") {
		t.Fatalf("expected refresh expiry, got %v", err)
	}
	reloaded, err := model.GetUserAgentGrantById(pair.GrantId, 303)
	if err != nil {
		t.Fatalf("reload grant: %v", err)
	}
	if !reloaded.IsRevoked() {
		t.Fatal("expected expired grant to be revoked")
	}
	token, err := model.GetTokenByIds(grant.GatewayTokenId, 303)
	if err != nil {
		t.Fatalf("load gateway token: %v", err)
	}
	if token.Status != common.TokenStatusDisabled {
		t.Fatalf("expected gateway token disabled, got status %d", token.Status)
	}
}

func TestAgentJWKS(t *testing.T) {
	t.Setenv("AGENT_JWT_ALLOW_EPHEMERAL", "true")
	if err := InitAgentAuthKeys(); err != nil {
		t.Fatalf("init keys: %v", err)
	}
	jwks, err := AgentJWKS()
	if err != nil {
		t.Fatalf("jwks: %v", err)
	}
	keys, ok := jwks["keys"].([]map[string]any)
	if !ok || len(keys) == 0 {
		t.Fatalf("expected keys in jwks")
	}
	if keys[0]["alg"] != "RS256" {
		t.Fatalf("unexpected alg: %v", keys[0]["alg"])
	}
}

func TestSignAgentAccessToken(t *testing.T) {
	t.Setenv("AGENT_JWT_ALLOW_EPHEMERAL", "true")
	if err := InitAgentAuthKeys(); err != nil {
		t.Fatalf("init keys: %v", err)
	}
	token, err := signAgentAccessToken(1, 42, "device-1")
	if err != nil {
		t.Fatalf("sign: %v", err)
	}
	if token == "" {
		t.Fatal("empty token")
	}
}
