package model

import (
	"errors"
	"fmt"

	"github.com/QuantumNous/new-api/common"
	"gorm.io/gorm"
)

type UserAgentGrant struct {
	Id               int            `json:"id"`
	UserId           int            `json:"user_id" gorm:"index;uniqueIndex:idx_agent_user_client_device"`
	ClientId         string         `json:"client_id" gorm:"type:varchar(64);uniqueIndex:idx_agent_user_client_device"`
	DeviceId         string         `json:"device_id" gorm:"type:varchar(128);uniqueIndex:idx_agent_user_client_device"`
	DeviceLabel      string         `json:"device_label" gorm:"type:varchar(128)"`
	Platform         string         `json:"platform" gorm:"type:varchar(32);default:''"`
	AppVersion       string         `json:"app_version" gorm:"type:varchar(32);default:''"`
	RefreshTokenHash string         `json:"-" gorm:"type:varchar(128)"`
	RefreshExpiresAt int64          `json:"refresh_expires_at" gorm:"bigint;default:0"`
	Scopes           string         `json:"scopes" gorm:"type:varchar(128);default:'agent gateway'"`
	GatewayTokenId   int            `json:"gateway_token_id" gorm:"index;default:0"`
	LastUsedAt       int64          `json:"last_used_at" gorm:"bigint;default:0"`
	RevokedAt        int64          `json:"revoked_at" gorm:"bigint;default:0"`
	CreatedAt        int64          `json:"created_at" gorm:"bigint"`
	UpdatedAt        int64          `json:"updated_at" gorm:"bigint"`
	DeletedAt        gorm.DeletedAt `gorm:"index"`
}

func (g *UserAgentGrant) IsRevoked() bool {
	return g.RevokedAt > 0
}

func (g *UserAgentGrant) IsActive() bool {
	return !g.IsRevoked()
}

func (g *UserAgentGrant) IsRefreshExpired(now int64) bool {
	return g != nil && g.RefreshExpiresAt > 0 && g.RefreshExpiresAt < now
}

func GetUserAgentGrantById(id int, userId int) (*UserAgentGrant, error) {
	var grant UserAgentGrant
	err := DB.Where("id = ? AND user_id = ?", id, userId).First(&grant).Error
	if err != nil {
		return nil, err
	}
	return &grant, nil
}

func GetUserAgentGrantByDevice(userId int, clientId, deviceId string) (*UserAgentGrant, error) {
	var grant UserAgentGrant
	query := DB.Where("client_id = ? AND device_id = ?", clientId, deviceId)
	if userId > 0 {
		query = query.Where("user_id = ?", userId)
	}
	err := query.First(&grant).Error
	if err != nil {
		return nil, err
	}
	return &grant, nil
}

func GetUserAgentGrantForRefresh(id int, clientId, deviceId string) (*UserAgentGrant, error) {
	var grant UserAgentGrant
	err := DB.Where("id = ? AND client_id = ? AND device_id = ?", id, clientId, deviceId).First(&grant).Error
	if err != nil {
		return nil, err
	}
	return &grant, nil
}

func ListUserAgentGrants(userId int) ([]UserAgentGrant, error) {
	var grants []UserAgentGrant
	err := DB.Where("user_id = ?", userId).Order("id DESC").Find(&grants).Error
	return grants, err
}

func ListActiveUserAgentGrants(userId int) ([]UserAgentGrant, error) {
	var grants []UserAgentGrant
	err := DB.Where("user_id = ? AND revoked_at = 0", userId).Order("id DESC").Find(&grants).Error
	return grants, err
}

func (g *UserAgentGrant) Insert() error {
	now := common.GetTimestamp()
	g.CreatedAt = now
	g.UpdatedAt = now
	return DB.Create(g).Error
}

func (g *UserAgentGrant) Update() error {
	g.UpdatedAt = common.GetTimestamp()
	return DB.Save(g).Error
}

func RevokeUserAgentGrant(id int, userId int) error {
	grant, err := GetUserAgentGrantById(id, userId)
	if err != nil {
		return err
	}
	if grant.IsRevoked() {
		return nil
	}
	now := common.GetTimestamp()
	grant.RevokedAt = now
	grant.UpdatedAt = now
	if err := DB.Save(grant).Error; err != nil {
		return err
	}
	if grant.GatewayTokenId > 0 {
		if err := DisableTokenById(grant.GatewayTokenId, userId); err != nil {
			return err
		}
	}
	return nil
}

func RevokeUserAgentGrantByDevice(userId int, clientId, deviceId string) error {
	grant, err := GetUserAgentGrantByDevice(userId, clientId, deviceId)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil
		}
		return err
	}
	return RevokeUserAgentGrant(grant.Id, userId)
}

func DisableTokenById(tokenId int, userId int) error {
	token, err := GetTokenByIds(tokenId, userId)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil
		}
		return err
	}
	token.Status = common.TokenStatusDisabled
	return token.Update()
}

func TouchUserAgentGrantLastUsed(id int) error {
	return DB.Model(&UserAgentGrant{}).Where("id = ?", id).Updates(map[string]any{
		"last_used_at": common.GetTimestamp(),
		"updated_at":   common.GetTimestamp(),
	}).Error
}

func CountUserAgentGrants(userId int) (int64, error) {
	var count int64
	err := DB.Model(&UserAgentGrant{}).Where("user_id = ? AND revoked_at = 0", userId).Count(&count).Error
	return count, err
}

func UpsertUserAgentGrant(grant *UserAgentGrant) error {
	if grant == nil {
		return errors.New("grant is nil")
	}
	existing, err := GetUserAgentGrantByDevice(grant.UserId, grant.ClientId, grant.DeviceId)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return grant.Insert()
		}
		return err
	}
	existing.DeviceLabel = grant.DeviceLabel
	existing.Platform = grant.Platform
	existing.AppVersion = grant.AppVersion
	existing.RefreshTokenHash = grant.RefreshTokenHash
	existing.RefreshExpiresAt = grant.RefreshExpiresAt
	existing.Scopes = grant.Scopes
	if grant.GatewayTokenId > 0 {
		existing.GatewayTokenId = grant.GatewayTokenId
	}
	existing.RevokedAt = 0
	existing.LastUsedAt = common.GetTimestamp()
	return existing.Update()
}

func AgentGrantDisplayName(grant *UserAgentGrant) string {
	if grant == nil {
		return ""
	}
	if grant.DeviceLabel != "" {
		return grant.DeviceLabel
	}
	return fmt.Sprintf("Device %s", grant.DeviceId[:min(8, len(grant.DeviceId))])
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
