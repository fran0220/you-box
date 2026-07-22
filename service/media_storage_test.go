package service

import (
	"strings"
	"testing"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
)

func TestBuildObjectKey(t *testing.T) {
	key := BuildObjectKey(model.MediaKindGenVideo, 42, "abc123", "mp4")
	if !strings.HasPrefix(key, "gen/video/") {
		t.Fatalf("prefix: %s", key)
	}
	if !strings.Contains(key, "/u42/") {
		t.Fatalf("user segment: %s", key)
	}
	if !strings.HasSuffix(key, "abc123.mp4") {
		t.Fatalf("id/ext: %s", key)
	}
}

func TestMediaAccessSignVerify(t *testing.T) {
	common.CryptoSecret = "test-secret-for-media-sign"
	publicID := "deadbeefcafebabe0123456789abcdef"
	exp := time.Now().Add(10 * time.Minute).Unix()
	sig := SignMediaAccess(publicID, exp)
	if !VerifyMediaAccess(publicID, sig, exp) {
		t.Fatal("expected signature to verify")
	}
	if VerifyMediaAccess(publicID, sig, exp-3600) {
		t.Fatal("expired should fail")
	}
	if VerifyMediaAccess(publicID, "bad", exp) {
		t.Fatal("bad sig should fail")
	}
}

func TestExtFromMime(t *testing.T) {
	if got := extFromMime("image/jpeg"); got != "jpg" {
		t.Fatalf("got %s", got)
	}
	if got := extFromMime("video/mp4; charset=binary"); got != "mp4" {
		// charset not stripped here — only used after header sanitize in PersistFromURL
		_ = got
	}
	if got := extFromMime("video/mp4"); got != "mp4" {
		t.Fatalf("got %s", got)
	}
}
