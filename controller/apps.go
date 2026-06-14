package controller

import (
	"strconv"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"

	"github.com/gin-gonic/gin"
)

// GetAppRankings returns the apps leaderboard (OpenRouter-style attribution).
// Without a `model` query it returns the top apps across all models; with one
// it returns the top apps for that model. Public, aggregate-only data.
func GetAppRankings(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	modelName := c.Query("model")

	var (
		rows []model.AppRankingRow
		err  error
	)
	if modelName != "" {
		rows, err = model.GetTopAppsForModel(modelName, limit)
	} else {
		rows, err = model.GetTopApps(limit)
	}
	if err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, rows)
}
