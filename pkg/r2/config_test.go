package r2

import "testing"

func TestValidateForbiddenBuckets(t *testing.T) {
	cfg := Config{
		Enabled:         true,
		AccountID:       "abc",
		AccessKeyID:     "ak",
		SecretAccessKey: "sk",
		Bucket:          "origingame-assets-private-v1",
		Endpoint:        "https://abc.r2.cloudflarestorage.com",
	}
	if err := cfg.Validate(); err == nil {
		t.Fatal("expected forbidden catalog bucket to fail validation")
	}

	cfg.Bucket = "origingame-gateway-media"
	if err := cfg.Validate(); err != nil {
		t.Fatalf("expected gateway media bucket ok: %v", err)
	}
}

func TestValidateDisabled(t *testing.T) {
	cfg := Config{Enabled: false}
	if err := cfg.Validate(); err != nil {
		t.Fatalf("disabled config should validate: %v", err)
	}
}
