package model

import (
	"github.com/QuantumNous/new-api/common"
)

// Preset is a user-owned, saved playground configuration (model + group +
// parameters + system prompt, etc). The concrete shape is owned by the
// frontend and stored opaquely in Config as a JSON string, so the backend
// stays additive and forward-compatible.
type Preset struct {
	Id          int    `json:"id" gorm:"primaryKey"`
	UserId      int    `json:"user_id" gorm:"index"`
	Name        string `json:"name" gorm:"type:varchar(128)"`
	Config      string `json:"config" gorm:"type:text"`
	CreatedTime int64  `json:"created_time" gorm:"bigint"`
	UpdatedTime int64  `json:"updated_time" gorm:"bigint"`
}

func (Preset) TableName() string {
	return "presets"
}

// GetPresetsByUserId returns all presets owned by a user, most-recently-updated
// first.
func GetPresetsByUserId(userId int) ([]*Preset, error) {
	var presets []*Preset
	err := DB.Where("user_id = ?", userId).
		Order("updated_time desc").
		Find(&presets).Error
	return presets, err
}

// GetPresetByIdAndUser fetches a single preset, scoped to its owner.
func GetPresetByIdAndUser(id int, userId int) (*Preset, error) {
	var preset Preset
	err := DB.Where("id = ? AND user_id = ?", id, userId).First(&preset).Error
	if err != nil {
		return nil, err
	}
	return &preset, nil
}

func CountUserPresets(userId int) (int64, error) {
	var count int64
	err := DB.Model(&Preset{}).Where("user_id = ?", userId).Count(&count).Error
	return count, err
}

func (preset *Preset) Insert() error {
	now := common.GetTimestamp()
	preset.CreatedTime = now
	preset.UpdatedTime = now
	return DB.Create(preset).Error
}

// Update persists name/config changes. Only the mutable columns are written so
// the owner and creation time cannot be overwritten by a client payload.
func (preset *Preset) Update() error {
	preset.UpdatedTime = common.GetTimestamp()
	return DB.Model(preset).
		Select("name", "config", "updated_time").
		Updates(preset).Error
}

// DeletePresetByIdAndUser removes a preset, scoped to its owner.
func DeletePresetByIdAndUser(id int, userId int) error {
	return DB.Where("id = ? AND user_id = ?", id, userId).Delete(&Preset{}).Error
}
