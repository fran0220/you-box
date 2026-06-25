package model

import (
	"fmt"
	"sync"
	"time"

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

// Short-TTL in-memory cache for the public, unauthenticated /apps endpoint.
// Mirrors the rankings snapshot cache (service/rankings.go) so the SUM/GROUP BY
// aggregation runs at most once per TTL regardless of request volume.
const appRankingsCacheTTL = 30 * time.Second

type appRankingsCacheItem struct {
	expiresAt time.Time
	rows      []AppRankingRow
}

var (
	appRankingsCacheMu sync.Mutex
	appRankingsCache   = map[string]appRankingsCacheItem{}
)

func getCachedAppRankings(key string) ([]AppRankingRow, bool) {
	appRankingsCacheMu.Lock()
	defer appRankingsCacheMu.Unlock()
	if item, ok := appRankingsCache[key]; ok && time.Now().Before(item.expiresAt) {
		return item.rows, true
	}
	return nil, false
}

func setCachedAppRankings(key string, rows []AppRankingRow) {
	appRankingsCacheMu.Lock()
	defer appRankingsCacheMu.Unlock()
	appRankingsCache[key] = appRankingsCacheItem{
		expiresAt: time.Now().Add(appRankingsCacheTTL),
		rows:      rows,
	}
}

// GetTopApps returns the top apps across all models by token volume. Results
// are cached for a short TTL to protect the public endpoint from running the
// SUM/GROUP BY aggregation on every request.
func GetTopApps(limit int) ([]AppRankingRow, error) {
	limit = clampAppLimit(limit)
	cacheKey := fmt.Sprintf("all:%d", limit)
	if rows, ok := getCachedAppRankings(cacheKey); ok {
		return rows, nil
	}

	var rows []AppRankingRow
	err := DB.Model(&AppUsage{}).
		Select("app, SUM(total_tokens) as total_tokens, SUM(request_count) as request_count").
		Group("app").
		Order("total_tokens desc").
		Limit(limit).
		Find(&rows).Error
	if err != nil {
		return nil, err
	}
	setCachedAppRankings(cacheKey, rows)
	return rows, nil
}

// GetTopAppsForModel returns the top apps for a specific model. Results are
// cached for a short TTL, matching GetTopApps.
func GetTopAppsForModel(modelName string, limit int) ([]AppRankingRow, error) {
	limit = clampAppLimit(limit)
	cacheKey := fmt.Sprintf("model:%s:%d", modelName, limit)
	if rows, ok := getCachedAppRankings(cacheKey); ok {
		return rows, nil
	}

	var rows []AppRankingRow
	err := DB.Model(&AppUsage{}).
		Select("app, total_tokens, request_count").
		Where("model_name = ?", modelName).
		Order("total_tokens desc").
		Limit(limit).
		Find(&rows).Error
	if err != nil {
		return nil, err
	}
	setCachedAppRankings(cacheKey, rows)
	return rows, nil
}
