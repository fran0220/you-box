package model

import (
	"errors"
	"time"

	"gorm.io/gorm"
)

// Media object kinds stored in R2 by the gateway (not Asset Worker catalog).
const (
	MediaKindGenVideo = "gen_video"
	MediaKindGenImage = "gen_image"
	MediaKindUpload   = "upload"
)

// Media object lifecycle statuses.
const (
	MediaStatusPending = "pending"
	MediaStatusActive  = "active"
	MediaStatusDeleted = "deleted"
)

// MediaObject is durable metadata for gateway-owned R2 media.
// Object bytes live in R2; this table is ownership + routing only.
type MediaObject struct {
	Id        int    `json:"id" gorm:"primaryKey"`
	PublicId  string `json:"public_id" gorm:"type:varchar(64);uniqueIndex;not null"`
	UserId    int    `json:"user_id" gorm:"index;not null"`
	TaskId    string `json:"task_id" gorm:"type:varchar(100);index;default:''"`
	Kind      string `json:"kind" gorm:"type:varchar(16);not null"`
	ObjectKey string `json:"object_key" gorm:"type:varchar(255);not null"`
	MimeType  string `json:"mime_type" gorm:"type:varchar(64);default:''"`
	SizeBytes int64  `json:"size_bytes" gorm:"default:0"`
	Status    string `json:"status" gorm:"type:varchar(16);index;default:'pending'"`
	SourceURL string `json:"source_url,omitempty" gorm:"type:varchar(512);default:''"` // original provider URL (truncated)
	CreatedAt int64  `json:"created_at" gorm:"bigint"`
	ExpiresAt int64  `json:"expires_at" gorm:"index;default:0"` // unix seconds; 0 = no expiry
	UpdatedAt int64  `json:"updated_at" gorm:"bigint"`
}

func (MediaObject) TableName() string {
	return "media_objects"
}

// CreateMediaObject inserts a new media row.
func CreateMediaObject(obj *MediaObject) error {
	if obj == nil {
		return errors.New("media object is nil")
	}
	now := time.Now().Unix()
	if obj.CreatedAt == 0 {
		obj.CreatedAt = now
	}
	obj.UpdatedAt = now
	if obj.Status == "" {
		obj.Status = MediaStatusPending
	}
	return DB.Create(obj).Error
}

// GetMediaObjectByPublicId loads an object by public id (any status).
func GetMediaObjectByPublicId(publicId string) (*MediaObject, error) {
	var obj MediaObject
	err := DB.Where("public_id = ?", publicId).First(&obj).Error
	if err != nil {
		return nil, err
	}
	return &obj, nil
}

// GetActiveMediaObjectByPublicId loads an active, non-expired object.
func GetActiveMediaObjectByPublicId(publicId string) (*MediaObject, error) {
	obj, err := GetMediaObjectByPublicId(publicId)
	if err != nil {
		return nil, err
	}
	if obj.Status != MediaStatusActive {
		return nil, gorm.ErrRecordNotFound
	}
	if obj.ExpiresAt > 0 && obj.ExpiresAt < time.Now().Unix() {
		return nil, gorm.ErrRecordNotFound
	}
	return obj, nil
}

// GetActiveMediaObjectByTaskId finds the latest active media for a task.
func GetActiveMediaObjectByTaskId(taskId string) (*MediaObject, error) {
	if taskId == "" {
		return nil, gorm.ErrRecordNotFound
	}
	var obj MediaObject
	now := time.Now().Unix()
	err := DB.Where("task_id = ? AND status = ?", taskId, MediaStatusActive).
		Where("expires_at = 0 OR expires_at >= ?", now).
		Order("id desc").
		First(&obj).Error
	if err != nil {
		return nil, err
	}
	return &obj, nil
}

// UpdateMediaObjectFields updates selected columns and refreshed_at.
func UpdateMediaObjectFields(id int, fields map[string]any) error {
	if len(fields) == 0 {
		return nil
	}
	fields["updated_at"] = time.Now().Unix()
	return DB.Model(&MediaObject{}).Where("id = ?", id).Updates(fields).Error
}

// SoftDeleteMediaObject marks the row deleted.
func SoftDeleteMediaObject(id int) error {
	return UpdateMediaObjectFields(id, map[string]any{"status": MediaStatusDeleted})
}

// SumUserUploadBytes returns total active upload bytes for a user.
func SumUserUploadBytes(userId int) (int64, error) {
	var sum int64
	err := DB.Model(&MediaObject{}).
		Where("user_id = ? AND kind = ? AND status = ?", userId, MediaKindUpload, MediaStatusActive).
		Select("COALESCE(SUM(size_bytes), 0)").
		Scan(&sum).Error
	return sum, err
}

// ListExpiredMediaObjects returns active rows past expires_at (for janitor).
func ListExpiredMediaObjects(limit int) ([]MediaObject, error) {
	if limit <= 0 {
		limit = 100
	}
	var rows []MediaObject
	now := time.Now().Unix()
	err := DB.Where("status = ? AND expires_at > 0 AND expires_at < ?", MediaStatusActive, now).
		Order("expires_at asc").
		Limit(limit).
		Find(&rows).Error
	return rows, err
}
