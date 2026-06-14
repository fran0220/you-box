package controller

import (
	"strconv"
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"

	"github.com/gin-gonic/gin"
)

// maxUserPresets caps how many saved presets a single user may keep.
const maxUserPresets = 100

// presetRequest is the client payload for create/update. Only name and config
// are accepted; ownership and timestamps are server-controlled.
type presetRequest struct {
	Name   string `json:"name"`
	Config string `json:"config"`
}

func GetUserPresets(c *gin.Context) {
	userId := c.GetInt("id")
	presets, err := model.GetPresetsByUserId(userId)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, presets)
}

func CreatePreset(c *gin.Context) {
	userId := c.GetInt("id")

	var req presetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ApiError(c, err)
		return
	}
	req.Name = strings.TrimSpace(req.Name)
	if req.Name == "" {
		common.ApiErrorMsg(c, "preset name is required")
		return
	}
	if len(req.Name) > 128 {
		common.ApiErrorMsg(c, "preset name is too long")
		return
	}

	count, err := model.CountUserPresets(userId)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	if int(count) >= maxUserPresets {
		common.ApiErrorMsg(c, "preset limit reached")
		return
	}

	preset := model.Preset{
		UserId: userId,
		Name:   req.Name,
		Config: req.Config,
	}
	if err := preset.Insert(); err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, preset)
}

func UpdatePreset(c *gin.Context) {
	userId := c.GetInt("id")
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		common.ApiErrorMsg(c, "invalid preset id")
		return
	}

	var req presetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ApiError(c, err)
		return
	}
	req.Name = strings.TrimSpace(req.Name)
	if req.Name == "" {
		common.ApiErrorMsg(c, "preset name is required")
		return
	}
	if len(req.Name) > 128 {
		common.ApiErrorMsg(c, "preset name is too long")
		return
	}

	existing, err := model.GetPresetByIdAndUser(id, userId)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	existing.Name = req.Name
	existing.Config = req.Config
	if err := existing.Update(); err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, existing)
}

func DeletePreset(c *gin.Context) {
	userId := c.GetInt("id")
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		common.ApiErrorMsg(c, "invalid preset id")
		return
	}
	if err := model.DeletePresetByIdAndUser(id, userId); err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, nil)
}
