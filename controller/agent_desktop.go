package controller

import (
	"errors"
	"fmt"
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/setting/system_setting"

	"github.com/gin-gonic/gin"
)

type agentAuditRequest struct {
	Action       string `json:"action"`
	ResourceType string `json:"resource_type"`
	ResourceId   string `json:"resource_id"`
}

func AgentDesktopConfig(c *gin.Context) {
	userId := c.GetInt("id")
	gatewayToken, err := agentGatewayTokenForContext(c)
	if err != nil {
		common.ApiErrorMsg(c, err.Error())
		return
	}
	modelsPayload, err := buildAgentModelsPayload(userId)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	models, primaryModel := desktopModelsFromAgentModels(modelsPayload)
	if primaryModel == "" || len(models) == 0 {
		common.ApiErrorMsg(c, "no desktop models available for this account")
		return
	}

	common.ApiSuccess(c, gin.H{
		"llm_proxy_url":      agentDesktopProxyBaseURL(c),
		"llm_proxy_key":      gatewayToken,
		"primary_model":      primaryModel,
		"primary_provider":   "you-box",
		"models":             models,
		"embedding_base_url": agentDesktopProxyBaseURL(c),
		"embedding_api_key":  gatewayToken,
	})
}

func AgentDesktopPolicy(c *gin.Context) {
	userId := c.GetInt("id")
	user, err := model.GetUserCache(userId)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	role := strings.TrimSpace(user.Group)
	if role == "" {
		role = "default"
	}
	allowed := user.Status == common.UserStatusEnabled
	common.ApiSuccess(c, gin.H{
		"role": role,
		"flags": gin.H{
			"allow_bash":          allowed,
			"allow_file_write":    allowed,
			"allow_mcp":           allowed,
			"allow_api_mutations": allowed,
		},
		"workspace_trust_default":           true,
		"workspace_trusted":                 true,
		"require_high_risk_confirmation":    true,
		"require_admin_escalation_approval": true,
		"policy_version":                    "youbox-agent-v1",
		"workspace_slug":                    strings.TrimSpace(c.Query("workspace_slug")),
	})
}

func AgentDesktopAudit(c *gin.Context) {
	userId := c.GetInt("id")
	var req agentAuditRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ApiError(c, err)
		return
	}
	req.Action = strings.TrimSpace(req.Action)
	req.ResourceType = strings.TrimSpace(req.ResourceType)
	req.ResourceId = strings.TrimSpace(req.ResourceId)
	if req.Action == "" || req.ResourceType == "" {
		common.ApiErrorMsg(c, "action and resource_type are required")
		return
	}
	if len(req.ResourceId) > 2048 {
		req.ResourceId = req.ResourceId[:2048]
	}
	model.RecordLog(userId, model.LogTypeSystem, fmt.Sprintf(
		"desktop agent audit action=%s resource_type=%s resource_id=%s grant_id=%d device_id=%s",
		req.Action,
		req.ResourceType,
		req.ResourceId,
		c.GetInt("agent_grant_id"),
		strings.TrimSpace(c.GetString("agent_device_id")),
	))
	common.ApiSuccess(c, gin.H{"ok": true})
}

func agentGatewayTokenForContext(c *gin.Context) (string, error) {
	userId := c.GetInt("id")
	grantId := c.GetInt("agent_grant_id")
	if userId <= 0 || grantId <= 0 {
		return "", errors.New("agent grant not found")
	}
	token, err := model.GetAgentGatewayTokenByGrantId(userId, grantId)
	if err != nil {
		return "", err
	}
	if token.Status != common.TokenStatusEnabled {
		return "", errors.New("agent gateway token is disabled")
	}
	key := strings.TrimSpace(token.Key)
	if key == "" {
		return "", errors.New("agent gateway token is empty")
	}
	if strings.HasPrefix(key, "sk-") {
		return key, nil
	}
	return "sk-" + key, nil
}

func agentDesktopProxyBaseURL(c *gin.Context) string {
	if addr := strings.TrimRight(strings.TrimSpace(system_setting.ServerAddress), "/"); addr != "" {
		return addr
	}
	proto := strings.TrimSpace(c.GetHeader("X-Forwarded-Proto"))
	if proto == "" {
		proto = "http"
	}
	host := c.Request.Host
	if host == "" {
		host = "127.0.0.1"
	}
	return proto + "://" + host
}

func desktopModelsFromAgentModels(payload gin.H) ([]gin.H, string) {
	raw, _ := payload["models"].([]gin.H)
	defaultModel, _ := payload["default_model"].(string)
	models := make([]gin.H, 0, len(raw))
	primary := strings.TrimSpace(defaultModel)
	for _, item := range raw {
		available, _ := item["available"].(bool)
		if !available {
			continue
		}
		id, _ := item["id"].(string)
		id = strings.TrimSpace(id)
		if id == "" {
			continue
		}
		label, _ := item["name"].(string)
		if strings.TrimSpace(label) == "" {
			label = id
		}
		models = append(models, gin.H{
			"id":       id,
			"provider": "you-box",
			"label":    label,
		})
		if primary == "" {
			primary = id
		}
	}
	return models, primary
}
