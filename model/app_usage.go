package model

import (
	"github.com/QuantumNous/new-api/common"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// AppUsage aggregates request/token volume attributed to a client application
// via the HTTP-Referer / X-Title headers (OpenRouter-style app attribution).
// It is an additive, fork-owned feature: counters are accumulated in-memory
// and flushed here with additive upserts, mirroring the perf-metrics package.
type AppUsage struct {
	Id           int    `json:"id" gorm:"primaryKey"`
	App          string `json:"app" gorm:"size:255;uniqueIndex:idx_app_usage_app_model,priority:1"`
	ModelName    string `json:"model_name" gorm:"column:model_name;size:128;uniqueIndex:idx_app_usage_app_model,priority:2"`
	RequestCount int64  `json:"request_count" gorm:"default:0"`
	TotalTokens  int64  `json:"total_tokens" gorm:"default:0"`
	UpdatedAt    int64  `json:"updated_at" gorm:"bigint;index"`
}

func (AppUsage) TableName() string {
	return "app_usage"
}

// UpsertAppUsage additively merges a batch of counters for an (app, model) pair.
func UpsertAppUsage(usage *AppUsage) error {
	if usage == nil || usage.RequestCount == 0 {
		return nil
	}
	usage.UpdatedAt = common.GetTimestamp()
	return DB.Clauses(clause.OnConflict{
		Columns: []clause.Column{{Name: "app"}, {Name: "model_name"}},
		DoUpdates: clause.Assignments(map[string]interface{}{
			"request_count": gorm.Expr("app_usage.request_count + ?", usage.RequestCount),
			"total_tokens":  gorm.Expr("app_usage.total_tokens + ?", usage.TotalTokens),
			"updated_at":    usage.UpdatedAt,
		}),
	}).Create(usage).Error
}

// AppRankingRow is a single row of the apps leaderboard.
type AppRankingRow struct {
	App          string `json:"app"`
	TotalTokens  int64  `json:"total_tokens"`
	RequestCount int64  `json:"request_count"`
}

func clampAppLimit(limit int) int {
	if limit <= 0 || limit > 100 {
		return 20
	}
	return limit
}

// GetTopApps returns the top apps across all models by token volume.
func GetTopApps(limit int) ([]AppRankingRow, error) {
	var rows []AppRankingRow
	err := DB.Model(&AppUsage{}).
		Select("app, SUM(total_tokens) as total_tokens, SUM(request_count) as request_count").
		Group("app").
		Order("total_tokens desc").
		Limit(clampAppLimit(limit)).
		Find(&rows).Error
	return rows, err
}

// GetTopAppsForModel returns the top apps for a specific model.
func GetTopAppsForModel(modelName string, limit int) ([]AppRankingRow, error) {
	var rows []AppRankingRow
	err := DB.Model(&AppUsage{}).
		Select("app, total_tokens, request_count").
		Where("model_name = ?", modelName).
		Order("total_tokens desc").
		Limit(clampAppLimit(limit)).
		Find(&rows).Error
	return rows, err
}
