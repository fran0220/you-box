package controller

import (
	"io"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/service"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

func mediaJSONError(c *gin.Context, status int, errType, message string) {
	c.JSON(status, gin.H{
		"error": gin.H{
			"message": message,
			"type":    errType,
		},
	})
}

// GetMediaContent serves durable media via 302 to a short-lived R2 presigned URL.
// Auth: Authorization bearer/session, OR ?exp=&sig= signed query (for <img>/<video>).
// ?stream=1 forces gateway proxy streaming (no redirect).
func GetMediaContent(c *gin.Context) {
	if !service.MediaStorageEnabled() {
		mediaJSONError(c, http.StatusServiceUnavailable, "server_error", "media storage is not enabled")
		return
	}
	publicId := strings.TrimSpace(c.Param("id"))
	if publicId == "" {
		mediaJSONError(c, http.StatusBadRequest, "invalid_request_error", "id is required")
		return
	}

	obj, err := model.GetActiveMediaObjectByPublicId(publicId)
	if err != nil || obj == nil {
		mediaJSONError(c, http.StatusNotFound, "invalid_request_error", "media not found")
		return
	}

	// Optional bearer/session (route has no aborting auth middleware so signed
	// query URLs work in <img>/<video> tags). Soft-fill c.Get("id") when present.
	trySoftAuthMedia(c)

	if !authorizeMediaAccess(c, obj) {
		mediaJSONError(c, http.StatusUnauthorized, "authentication_error", "unauthorized")
		return
	}

	stream := c.Query("stream") == "1" || c.Query("stream") == "true"
	if stream {
		if err := service.StreamMediaContent(c.Request.Context(), obj, c.Writer); err != nil {
			// Headers may already be written
			if !c.Writer.Written() {
				mediaJSONError(c, http.StatusBadGateway, "server_error", "failed to stream media")
			}
		}
		return
	}

	url, err := service.PresignMediaContent(c.Request.Context(), obj)
	if err != nil {
		// Fallback to stream if presign fails
		if err2 := service.StreamMediaContent(c.Request.Context(), obj, c.Writer); err2 != nil && !c.Writer.Written() {
			mediaJSONError(c, http.StatusBadGateway, "server_error", "failed to resolve media URL")
		}
		return
	}
	c.Redirect(http.StatusFound, url)
}

// GetMediaMeta returns media metadata for the owner/admin.
func GetMediaMeta(c *gin.Context) {
	if !service.MediaStorageEnabled() {
		mediaJSONError(c, http.StatusServiceUnavailable, "server_error", "media storage is not enabled")
		return
	}
	publicId := strings.TrimSpace(c.Param("id"))
	obj, err := model.GetMediaObjectByPublicId(publicId)
	if err != nil || obj == nil {
		mediaJSONError(c, http.StatusNotFound, "invalid_request_error", "media not found")
		return
	}
	userId := c.GetInt("id")
	role := c.GetInt("role")
	if obj.UserId != userId && role < common.RoleAdminUser {
		mediaJSONError(c, http.StatusForbidden, "permission_error", "forbidden")
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"id":         obj.PublicId,
		"kind":       obj.Kind,
		"mime_type":  obj.MimeType,
		"size_bytes": obj.SizeBytes,
		"status":     obj.Status,
		"task_id":    obj.TaskId,
		"url":        service.BuildMediaURL(obj.PublicId, 0),
		"created_at": obj.CreatedAt,
		"expires_at": obj.ExpiresAt,
	})
}

// UploadMedia accepts raw body or multipart file upload into R2.
func UploadMedia(c *gin.Context) {
	if !service.MediaStorageEnabled() {
		mediaJSONError(c, http.StatusServiceUnavailable, "server_error", "media storage is not enabled")
		return
	}
	userId := c.GetInt("id")
	if userId <= 0 {
		mediaJSONError(c, http.StatusUnauthorized, "authentication_error", "unauthorized")
		return
	}

	cfg := service.MediaR2().Config()
	used, err := model.SumUserUploadBytes(userId)
	if err == nil && cfg.UserUploadQuotaBytes() > 0 && used >= cfg.UserUploadQuotaBytes() {
		mediaJSONError(c, http.StatusForbidden, "quota_exceeded", "user upload quota exceeded")
		return
	}

	var (
		reader   io.Reader
		size     int64 = -1
		mimeType string
		filename string
	)

	ct := c.GetHeader("Content-Type")
	if strings.HasPrefix(ct, "multipart/form-data") {
		file, err := c.FormFile("file")
		if err != nil {
			mediaJSONError(c, http.StatusBadRequest, "invalid_request_error", "file field is required")
			return
		}
		f, err := file.Open()
		if err != nil {
			mediaJSONError(c, http.StatusBadRequest, "invalid_request_error", "failed to open upload")
			return
		}
		defer func() { _ = f.Close() }()
		reader = f
		size = file.Size
		filename = file.Filename
		mimeType = file.Header.Get("Content-Type")
	} else {
		reader = c.Request.Body
		size = c.Request.ContentLength
		mimeType = ct
	}
	if mimeType == "" || mimeType == "application/octet-stream" {
		if filename != "" {
			mimeType = mimeFromFilename(filename)
		}
		if mimeType == "" {
			mimeType = "application/octet-stream"
		}
	}

	maxBytes := cfg.UploadMaxBytes()
	obj, err := service.PersistFromReader(c.Request.Context(), userId, model.MediaKindUpload, mimeType, "", "", "", reader, size, maxBytes)
	if err != nil {
		mediaJSONError(c, http.StatusBadRequest, "invalid_request_error", err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":         obj.PublicId,
		"url":        service.BuildMediaURL(obj.PublicId, 24*time.Hour),
		"mime_type":  obj.MimeType,
		"size_bytes": obj.SizeBytes,
		"expires_at": obj.ExpiresAt,
		"kind":       obj.Kind,
	})
}

// DeleteMedia soft-deletes metadata and best-effort deletes the R2 object.
func DeleteMedia(c *gin.Context) {
	if !service.MediaStorageEnabled() {
		mediaJSONError(c, http.StatusServiceUnavailable, "server_error", "media storage is not enabled")
		return
	}
	publicId := strings.TrimSpace(c.Param("id"))
	obj, err := model.GetMediaObjectByPublicId(publicId)
	if err != nil || obj == nil {
		mediaJSONError(c, http.StatusNotFound, "invalid_request_error", "media not found")
		return
	}
	userId := c.GetInt("id")
	role := c.GetInt("role")
	if obj.UserId != userId && role < common.RoleAdminUser {
		mediaJSONError(c, http.StatusForbidden, "permission_error", "forbidden")
		return
	}
	if client := service.MediaR2(); client != nil && client.Enabled() {
		_ = client.DeleteObject(c.Request.Context(), obj.ObjectKey)
	}
	_ = model.SoftDeleteMediaObject(obj.Id)
	c.JSON(http.StatusOK, gin.H{"success": true})
}

func authorizeMediaAccess(c *gin.Context, obj *model.MediaObject) bool {
	// Signed query auth (no session required)
	expStr := c.Query("exp")
	sig := c.Query("sig")
	if expStr != "" && sig != "" {
		exp, err := strconv.ParseInt(expStr, 10, 64)
		if err == nil && service.VerifyMediaAccess(obj.PublicId, sig, exp) {
			return true
		}
	}

	// Session / token auth set by middleware or trySoftAuthMedia
	userId := c.GetInt("id")
	if userId <= 0 {
		return false
	}
	role := c.GetInt("role")
	if role >= common.RoleAdminUser {
		return true
	}
	return obj.UserId == userId
}

// trySoftAuthMedia populates user id from session or API token without aborting.
func trySoftAuthMedia(c *gin.Context) {
	if c.GetInt("id") > 0 {
		return
	}
	// Session (dashboard)
	session := sessions.Default(c)
	if id := session.Get("id"); id != nil {
		if status, ok := session.Get("status").(int); ok && status == common.UserStatusEnabled {
			c.Set("id", id)
			if role, ok := session.Get("role").(int); ok {
				c.Set("role", role)
			}
			return
		}
	}
	key := c.Request.Header.Get("Authorization")
	if strings.HasPrefix(key, "Bearer ") || strings.HasPrefix(key, "bearer ") {
		key = strings.TrimSpace(key[7:])
	}
	key = strings.TrimPrefix(key, "sk-")
	if key == "" {
		return
	}
	parts := strings.Split(key, "-")
	key = parts[0]
	token, err := model.ValidateUserToken(key)
	if err != nil || token == nil {
		return
	}
	c.Set("id", token.UserId)
	c.Set("token_id", token.Id)
	c.Set("token_key", token.Key)
}

func mimeFromFilename(name string) string {
	lower := strings.ToLower(name)
	switch {
	case strings.HasSuffix(lower, ".jpg"), strings.HasSuffix(lower, ".jpeg"):
		return "image/jpeg"
	case strings.HasSuffix(lower, ".png"):
		return "image/png"
	case strings.HasSuffix(lower, ".webp"):
		return "image/webp"
	case strings.HasSuffix(lower, ".gif"):
		return "image/gif"
	case strings.HasSuffix(lower, ".mp4"):
		return "video/mp4"
	case strings.HasSuffix(lower, ".webm"):
		return "video/webm"
	default:
		return ""
	}
}
