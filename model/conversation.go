package model

import (
	"github.com/QuantumNous/new-api/common"
)

// Conversation is a user-owned playground chat session. Messages and optional
// snapshot config are stored as opaque JSON text so the frontend can evolve
// the message shape without backend schema churn. Compatible with SQLite /
// MySQL / PostgreSQL via TEXT columns (no DB-native JSON operators).
type Conversation struct {
	Id     int    `json:"id" gorm:"primaryKey"`
	UserId int    `json:"user_id" gorm:"index"`
	Title  string `json:"title" gorm:"type:varchar(256)"`
	// Messages is a JSON array of playground Message objects.
	Messages string `json:"messages" gorm:"type:text"`
	// Config is optional JSON of PlaygroundConfig (+ parameter flags).
	Config      string `json:"config" gorm:"type:text"`
	CreatedTime int64  `json:"created_time" gorm:"bigint"`
	UpdatedTime int64  `json:"updated_time" gorm:"bigint"`
}

func (Conversation) TableName() string {
	return "conversations"
}

// ConversationListItem is the lightweight row for the conversation rail
// (no full message payload).
type ConversationListItem struct {
	Id          int    `json:"id"`
	Title       string `json:"title"`
	CreatedTime int64  `json:"created_time"`
	UpdatedTime int64  `json:"updated_time"`
}

func GetConversationsByUserId(userId int) ([]ConversationListItem, error) {
	var items []ConversationListItem
	err := DB.Model(&Conversation{}).
		Select("id", "title", "created_time", "updated_time").
		Where("user_id = ?", userId).
		Order("updated_time desc").
		Find(&items).Error
	return items, err
}

func GetConversationByIdAndUser(id int, userId int) (*Conversation, error) {
	var conv Conversation
	err := DB.Where("id = ? AND user_id = ?", id, userId).First(&conv).Error
	if err != nil {
		return nil, err
	}
	return &conv, nil
}

func CountUserConversations(userId int) (int64, error) {
	var count int64
	err := DB.Model(&Conversation{}).Where("user_id = ?", userId).Count(&count).Error
	return count, err
}

func (conv *Conversation) Insert() error {
	now := common.GetTimestamp()
	conv.CreatedTime = now
	conv.UpdatedTime = now
	return DB.Create(conv).Error
}

// Update persists title/messages/config. Ownership and created_time are
// not client-writable.
func (conv *Conversation) Update() error {
	conv.UpdatedTime = common.GetTimestamp()
	return DB.Model(conv).
		Select("title", "messages", "config", "updated_time").
		Updates(conv).Error
}

func DeleteConversationByIdAndUser(id int, userId int) error {
	return DB.Where("id = ? AND user_id = ?", id, userId).Delete(&Conversation{}).Error
}
