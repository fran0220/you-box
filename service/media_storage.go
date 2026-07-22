package service

import (
	"context"
	"crypto/subtle"
	"fmt"
	"io"
	"net/http"
	"path"
	"strconv"
	"strings"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/logger"
	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/pkg/r2"
	"github.com/QuantumNous/new-api/setting/system_setting"
)

var mediaR2 *r2.Client

// InitMediaStorage loads R2 config and initializes the global media client.
// When R2_ENABLED=false this is a no-op. When true and invalid, logs error and
// leaves storage disabled (never panics the process).
func InitMediaStorage() {
	cfg := r2.LoadConfig()
	if !cfg.Enabled {
		common.SysLog("media storage: R2 disabled (set R2_ENABLED=true to enable)")
		return
	}
	if err := cfg.Validate(); err != nil {
		common.SysError("media storage: invalid R2 config: " + err.Error())
		return
	}
	client, err := r2.NewClient(cfg)
	if err != nil {
		common.SysError("media storage: failed to create R2 client: " + err.Error())
		return
	}
	mediaR2 = client
	common.SysLog(fmt.Sprintf("media storage: R2 enabled bucket=%s endpoint=%s", cfg.Bucket, cfg.Endpoint))
	StartMediaPersistWorker()
	StartMediaJanitor()
}

// MediaStorageEnabled reports whether durable media storage is live.
func MediaStorageEnabled() bool {
	return mediaR2 != nil && mediaR2.Enabled()
}

// MediaR2 returns the global R2 client (may be nil / disabled).
func MediaR2() *r2.Client {
	return mediaR2
}

// MediaPublicIDLength is the unguessable public id length (hex chars).
const MediaPublicIDLength = 32

// BuildObjectKey constructs a partitioned R2 key.
func BuildObjectKey(kind string, userId int, publicId, ext string) string {
	now := time.Now().UTC()
	yyyy := now.Format("2006")
	mm := now.Format("01")
	ext = strings.TrimPrefix(strings.ToLower(ext), ".")
	if ext == "" {
		ext = "bin"
	}
	prefix := "gen/other"
	switch kind {
	case model.MediaKindGenVideo:
		prefix = "gen/video"
	case model.MediaKindGenImage:
		prefix = "gen/image"
	case model.MediaKindUpload:
		prefix = "upload"
	}
	return fmt.Sprintf("%s/%s/%s/u%d/%s.%s", prefix, yyyy, mm, userId, publicId, ext)
}

// BuildMediaURL returns a gateway URL for media content, optionally signed for
// embedding without Authorization headers (img/video tags).
func BuildMediaURL(publicId string, signedTTL time.Duration) string {
	base := strings.TrimRight(system_setting.ServerAddress, "/")
	if base == "" {
		base = "http://localhost:3000"
	}
	url := fmt.Sprintf("%s/v1/media/%s/content", base, publicId)
	if signedTTL > 0 {
		exp := time.Now().Add(signedTTL).Unix()
		sig := SignMediaAccess(publicId, exp)
		url = fmt.Sprintf("%s?exp=%d&sig=%s", url, exp, sig)
	}
	return url
}

// SignMediaAccess creates an HMAC signature for publicId+exp.
func SignMediaAccess(publicId string, exp int64) string {
	return common.GenerateHMAC(fmt.Sprintf("%s:%d", publicId, exp))
}

// VerifyMediaAccess checks exp+sig for a media public id.
func VerifyMediaAccess(publicId, sig string, exp int64) bool {
	if publicId == "" || sig == "" || exp <= 0 {
		return false
	}
	if time.Now().Unix() > exp {
		return false
	}
	want := SignMediaAccess(publicId, exp)
	return subtle.ConstantTimeCompare([]byte(want), []byte(sig)) == 1
}

// PersistFromReader uploads a stream and creates an active MediaObject row.
func PersistFromReader(ctx context.Context, userId int, kind, mimeType, ext, taskId, sourceURL string, body io.Reader, size int64, maxBytes int64) (*model.MediaObject, error) {
	if !MediaStorageEnabled() {
		return nil, fmt.Errorf("media storage is not enabled")
	}
	if maxBytes <= 0 {
		maxBytes = mediaR2.Config().MaxObjectBytes()
	}
	publicId := common.GetRandomString(MediaPublicIDLength)
	if publicId == "" {
		return nil, fmt.Errorf("failed to generate media public id")
	}
	if ext == "" {
		ext = extFromMime(mimeType)
	}
	key := BuildObjectKey(kind, userId, publicId, ext)

	limited := io.LimitReader(body, maxBytes+1)
	// Buffer through Tee to count bytes if size unknown — for known size just put.
	// Use counting reader for safety.
	cr := &countingReader{r: limited}
	if err := mediaR2.PutObject(ctx, key, mimeType, cr, -1); err != nil {
		return nil, err
	}
	if cr.n > maxBytes {
		_ = mediaR2.DeleteObject(ctx, key)
		return nil, fmt.Errorf("object exceeds max size %d bytes", maxBytes)
	}
	written := cr.n
	if size > 0 && written == 0 {
		written = size
	}

	expiresAt := int64(0)
	cfg := mediaR2.Config()
	ttlDays := cfg.GenTTLDays
	if kind == model.MediaKindUpload {
		ttlDays = cfg.UploadTTLDays
	}
	if ttlDays > 0 {
		expiresAt = time.Now().Add(time.Duration(ttlDays) * 24 * time.Hour).Unix()
	}

	obj := &model.MediaObject{
		PublicId:  publicId,
		UserId:    userId,
		TaskId:    taskId,
		Kind:      kind,
		ObjectKey: key,
		MimeType:  mimeType,
		SizeBytes: written,
		Status:    model.MediaStatusActive,
		SourceURL: truncateString(sourceURL, 500),
		ExpiresAt: expiresAt,
	}
	if err := model.CreateMediaObject(obj); err != nil {
		_ = mediaR2.DeleteObject(ctx, key)
		return nil, err
	}
	return obj, nil
}

// PersistFromURL downloads a URL (SSRF-protected) and stores it in R2.
func PersistFromURL(ctx context.Context, userId int, kind, taskId, sourceURL, preferredMime string) (*model.MediaObject, error) {
	if !MediaStorageEnabled() {
		return nil, fmt.Errorf("media storage is not enabled")
	}
	sourceURL = strings.TrimSpace(sourceURL)
	if sourceURL == "" {
		return nil, fmt.Errorf("empty source url")
	}
	if strings.HasPrefix(sourceURL, "data:") {
		return nil, fmt.Errorf("data URLs are not supported for R2 persist")
	}

	// Relative gateway proxy paths are resolved by caller; here we only accept absolute URLs.
	if !strings.HasPrefix(sourceURL, "http://") && !strings.HasPrefix(sourceURL, "https://") {
		return nil, fmt.Errorf("unsupported source url scheme")
	}

	resp, err := DoDownloadRequest(sourceURL, "media_persist")
	if err != nil {
		return nil, err
	}
	defer func() { _ = resp.Body.Close() }()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("download status %d", resp.StatusCode)
	}

	mimeType := preferredMime
	if mimeType == "" {
		mimeType = resp.Header.Get("Content-Type")
	}
	if idx := strings.Index(mimeType, ";"); idx >= 0 {
		mimeType = strings.TrimSpace(mimeType[:idx])
	}
	if mimeType == "" {
		mimeType = "application/octet-stream"
	}
	ext := extFromMime(mimeType)
	maxBytes := mediaR2.Config().MaxObjectBytes()
	return PersistFromReader(ctx, userId, kind, mimeType, ext, taskId, sourceURL, resp.Body, resp.ContentLength, maxBytes)
}

// PresignMediaContent returns a short-lived R2 URL for an active object.
func PresignMediaContent(ctx context.Context, obj *model.MediaObject) (string, error) {
	if !MediaStorageEnabled() {
		return "", fmt.Errorf("media storage is not enabled")
	}
	if obj == nil {
		return "", fmt.Errorf("media object is nil")
	}
	ttl := time.Duration(mediaR2.Config().PresignTTLSeconds) * time.Second
	return mediaR2.PresignGetURL(ctx, obj.ObjectKey, ttl)
}

// StreamMediaContent proxies object bytes through the gateway (fallback).
func StreamMediaContent(ctx context.Context, obj *model.MediaObject, w http.ResponseWriter) error {
	if !MediaStorageEnabled() {
		return fmt.Errorf("media storage is not enabled")
	}
	body, ct, size, err := mediaR2.GetObject(ctx, obj.ObjectKey)
	if err != nil {
		return err
	}
	defer func() { _ = body.Close() }()
	if ct != "" {
		w.Header().Set("Content-Type", ct)
	} else if obj.MimeType != "" {
		w.Header().Set("Content-Type", obj.MimeType)
	}
	if size > 0 {
		w.Header().Set("Content-Length", strconv.FormatInt(size, 10))
	}
	w.Header().Set("Cache-Control", "private, max-age=300")
	w.WriteHeader(http.StatusOK)
	_, err = io.Copy(w, body)
	return err
}

// TryPersistTaskVideoResult enqueues durable persist for a successful video task.
// Never fails the task path; best-effort only.
func TryPersistTaskVideoResult(task *model.Task, sourceURL string) {
	if !MediaStorageEnabled() || task == nil {
		return
	}
	sourceURL = strings.TrimSpace(sourceURL)
	if sourceURL == "" || strings.HasPrefix(sourceURL, "data:") {
		return
	}
	// Already persisted?
	if existing, err := model.GetActiveMediaObjectByTaskId(task.TaskID); err == nil && existing != nil {
		task.PrivateData.ResultURL = BuildMediaURL(existing.PublicId, 0)
		return
	}
	EnqueueMediaPersist(MediaPersistJob{
		UserId:    task.UserId,
		TaskId:    task.TaskID,
		Kind:      model.MediaKindGenVideo,
		SourceURL: sourceURL,
		MimeType:  "video/mp4",
	})
}

// AttachMediaURLIfReady rewrites task ResultURL when media already exists.
func AttachMediaURLIfReady(task *model.Task) bool {
	if task == nil || !MediaStorageEnabled() {
		return false
	}
	obj, err := model.GetActiveMediaObjectByTaskId(task.TaskID)
	if err != nil || obj == nil {
		return false
	}
	task.PrivateData.ResultURL = BuildMediaURL(obj.PublicId, 0)
	return true
}

type countingReader struct {
	r io.Reader
	n int64
}

func (c *countingReader) Read(p []byte) (int, error) {
	n, err := c.r.Read(p)
	c.n += int64(n)
	return n, err
}

func extFromMime(mime string) string {
	mime = strings.ToLower(strings.TrimSpace(mime))
	switch {
	case strings.Contains(mime, "jpeg"), strings.Contains(mime, "jpg"):
		return "jpg"
	case strings.Contains(mime, "png"):
		return "png"
	case strings.Contains(mime, "webp"):
		return "webp"
	case strings.Contains(mime, "gif"):
		return "gif"
	case strings.Contains(mime, "mp4"):
		return "mp4"
	case strings.Contains(mime, "webm"):
		return "webm"
	case strings.Contains(mime, "quicktime"), strings.Contains(mime, "mov"):
		return "mov"
	default:
		// try last path segment style
		if i := strings.LastIndex(mime, "/"); i >= 0 && i+1 < len(mime) {
			return path.Base(mime[i+1:])
		}
		return "bin"
	}
}

func truncateString(s string, max int) string {
	if max <= 0 || len(s) <= max {
		return s
	}
	return s[:max]
}

// LogMediaPersistError is a tiny helper for worker/controller logs.
func LogMediaPersistError(ctx context.Context, msg string, err error) {
	if err == nil {
		return
	}
	if ctx != nil {
		logger.LogError(ctx, msg+": "+err.Error())
		return
	}
	common.SysError(msg + ": " + err.Error())
}
