package r2

import (
	"fmt"
	"os"
	"strings"

	"github.com/QuantumNous/new-api/common"
)

// Config holds Cloudflare R2 (S3-compatible) settings for gateway media storage.
// This is intentionally separate from OriginGame Asset Worker catalog buckets.
type Config struct {
	Enabled           bool
	AccountID         string
	AccessKeyID       string
	SecretAccessKey   string
	Bucket            string
	Endpoint          string // derived if empty: https://{account}.r2.cloudflarestorage.com
	MaxObjectMB       int
	UploadMaxMB       int
	UserUploadQuotaMB int
	GenTTLDays        int
	UploadTTLDays     int
	PersistImages     bool
	PresignTTLSeconds int
}

// ForbiddenBucketFragments refuse startup if configured bucket looks like the
// Asset Worker catalog plane (immutable game assets).
var ForbiddenBucketFragments = []string{
	"origingame-assets",
	"assets-private",
	"assets-renditions",
	"assets-search",
	"renditions-v1",
	"search-v1",
}

// LoadConfig reads R2_* environment variables.
func LoadConfig() Config {
	cfg := Config{
		Enabled:           common.GetEnvOrDefaultBool("R2_ENABLED", false),
		AccountID:         strings.TrimSpace(os.Getenv("R2_ACCOUNT_ID")),
		AccessKeyID:       strings.TrimSpace(os.Getenv("R2_ACCESS_KEY_ID")),
		SecretAccessKey:   strings.TrimSpace(os.Getenv("R2_SECRET_ACCESS_KEY")),
		Bucket:            strings.TrimSpace(common.GetEnvOrDefaultString("R2_BUCKET", "origingame-gateway-media")),
		Endpoint:          strings.TrimSpace(os.Getenv("R2_ENDPOINT")),
		MaxObjectMB:       common.GetEnvOrDefault("R2_MAX_OBJECT_MB", 512),
		UploadMaxMB:       common.GetEnvOrDefault("R2_UPLOAD_MAX_MB", 25),
		UserUploadQuotaMB: common.GetEnvOrDefault("R2_USER_UPLOAD_QUOTA_MB", 500),
		GenTTLDays:        common.GetEnvOrDefault("R2_GEN_TTL_DAYS", 90),
		UploadTTLDays:     common.GetEnvOrDefault("R2_UPLOAD_TTL_DAYS", 7),
		PersistImages:     common.GetEnvOrDefaultBool("R2_PERSIST_IMAGES", false),
		PresignTTLSeconds: common.GetEnvOrDefault("R2_PRESIGN_TTL_SECONDS", 900),
	}
	if cfg.Endpoint == "" && cfg.AccountID != "" {
		cfg.Endpoint = fmt.Sprintf("https://%s.r2.cloudflarestorage.com", cfg.AccountID)
	}
	if cfg.PresignTTLSeconds <= 0 {
		cfg.PresignTTLSeconds = 900
	}
	if cfg.MaxObjectMB <= 0 {
		cfg.MaxObjectMB = 512
	}
	if cfg.UploadMaxMB <= 0 {
		cfg.UploadMaxMB = 25
	}
	return cfg
}

// Validate returns an error if enabled config is incomplete or targets a forbidden bucket.
func (c Config) Validate() error {
	if !c.Enabled {
		return nil
	}
	if c.AccountID == "" {
		return fmt.Errorf("R2_ACCOUNT_ID is required when R2_ENABLED=true")
	}
	if c.AccessKeyID == "" || c.SecretAccessKey == "" {
		return fmt.Errorf("R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY are required when R2_ENABLED=true")
	}
	if c.Bucket == "" {
		return fmt.Errorf("R2_BUCKET is required when R2_ENABLED=true")
	}
	if c.Endpoint == "" {
		return fmt.Errorf("R2_ENDPOINT could not be derived; set R2_ENDPOINT or R2_ACCOUNT_ID")
	}
	lower := strings.ToLower(c.Bucket)
	for _, frag := range ForbiddenBucketFragments {
		if strings.Contains(lower, frag) {
			return fmt.Errorf("R2_BUCKET %q looks like OriginGame Asset Worker catalog storage (%q); refuse to use it — set a dedicated gateway media bucket", c.Bucket, frag)
		}
	}
	return nil
}

// MaxObjectBytes returns the hard put limit for generated media.
func (c Config) MaxObjectBytes() int64 {
	return int64(c.MaxObjectMB) * 1024 * 1024
}

// UploadMaxBytes returns the hard put limit for user uploads.
func (c Config) UploadMaxBytes() int64 {
	return int64(c.UploadMaxMB) * 1024 * 1024
}

// UserUploadQuotaBytes returns the soft lifetime quota for user uploads.
func (c Config) UserUploadQuotaBytes() int64 {
	return int64(c.UserUploadQuotaMB) * 1024 * 1024
}
