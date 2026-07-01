package model

import (
	"testing"

	"github.com/QuantumNous/new-api/common"
)

func TestAgentGrantDisplayName(t *testing.T) {
	grant := &UserAgentGrant{DeviceLabel: "MacBook Pro", DeviceId: "device-12345678"}
	if got := AgentGrantDisplayName(grant); got != "MacBook Pro" {
		t.Fatalf("got %q", got)
	}
	grant.DeviceLabel = ""
	got := AgentGrantDisplayName(grant)
	if got == "" {
		t.Fatal("expected fallback name")
	}
}

func TestUserAgentGrantIsActive(t *testing.T) {
	g := &UserAgentGrant{RevokedAt: 0}
	if !g.IsActive() {
		t.Fatal("expected active")
	}
	g.RevokedAt = common.GetTimestamp()
	if g.IsActive() {
		t.Fatal("expected revoked")
	}
}

func TestUserAgentGrantRefreshExpiry(t *testing.T) {
	now := common.GetTimestamp()
	g := &UserAgentGrant{RefreshExpiresAt: now + 60}
	if g.IsRefreshExpired(now) {
		t.Fatal("expected refresh token to be active before expiry")
	}
	g.RefreshExpiresAt = now - 1
	if !g.IsRefreshExpired(now) {
		t.Fatal("expected refresh token to be expired")
	}
}
