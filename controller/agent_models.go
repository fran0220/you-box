package controller

import (
	"strings"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/service"

	"github.com/gin-gonic/gin"
)

func AgentModels(c *gin.Context) {
	userId := c.GetInt("id")
	user, err := model.GetUserCache(userId)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	enabled := model.GetEnabledModels()
	groups := service.GetUserUsableGroups(user.Group)
	allowed := make(map[string]bool)
	for group := range groups {
		for _, m := range model.GetGroupEnabledModels(group) {
			allowed[m] = true
		}
	}

	items := make([]gin.H, 0, len(enabled))
	defaultModel := ""
	for _, modelId := range enabled {
		available := allowed[modelId]
		reason := any(nil)
		if !available {
			reason = "not available for your account"
		}
		if defaultModel == "" && available {
			defaultModel = modelId
		}
		items = append(items, gin.H{
			"id":           modelId,
			"name":         modelId,
			"capabilities": agentModelCapabilities(modelId),
			"available":    available,
			"reason":       reason,
		})
	}

	common.ApiSuccess(c, gin.H{
		"models":         items,
		"default_model":  defaultModel,
		"policy_version": time.Now().Format("2006-01-02"),
	})
}

func agentModelCapabilities(modelId string) []string {
	caps := []string{"chat", "tools"}
	lower := strings.ToLower(modelId)
	for _, hint := range []string{"vision", "gpt-4o", "gemini", "claude-3", "image"} {
		if strings.Contains(lower, hint) {
			caps = append(caps, "vision")
			break
		}
	}
	for _, hint := range []string{"o1", "o3", "reason", "think"} {
		if strings.Contains(lower, hint) {
			caps = append(caps, "reasoning")
			break
		}
	}
	return caps
}