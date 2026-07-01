package controller

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/constant"
	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/service"

	"github.com/gin-gonic/gin"
)

type agentAuthorizeRequest struct {
	ClientId            string `json:"client_id"`
	DeviceId            string `json:"device_id"`
	DeviceLabel         string `json:"device_label"`
	State               string `json:"state"`
	CodeChallenge       string `json:"code_challenge"`
	CodeChallengeMethod string `json:"code_challenge_method"`
}

type agentExchangeRequest struct {
	Code         string `json:"code"`
	ClientId     string `json:"client_id"`
	DeviceId     string `json:"device_id"`
	DeviceLabel  string `json:"device_label"`
	State        string `json:"state"`
	CodeVerifier string `json:"code_verifier"`
	Platform     string `json:"platform"`
	AppVersion   string `json:"app_version"`
}

type agentRefreshRequest struct {
	RefreshToken string `json:"refresh_token"`
	ClientId     string `json:"client_id"`
	DeviceId     string `json:"device_id"`
	GrantId      int    `json:"grant_id"`
}

type agentLogoutRequest struct {
	DeviceId string `json:"device_id"`
}

func AgentAuthorize(c *gin.Context) {
	userId := c.GetInt("id")
	var req agentAuthorizeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ApiError(c, err)
		return
	}
	req.ClientId = strings.TrimSpace(req.ClientId)
	req.DeviceId = strings.TrimSpace(req.DeviceId)
	req.DeviceLabel = strings.TrimSpace(req.DeviceLabel)
	req.State = strings.TrimSpace(req.State)
	req.CodeChallenge = strings.TrimSpace(req.CodeChallenge)
	req.CodeChallengeMethod = strings.TrimSpace(req.CodeChallengeMethod)
	if req.ClientId != constant.AgentClientID || req.DeviceId == "" || req.DeviceLabel == "" || req.State == "" || req.CodeChallenge == "" {
		common.ApiErrorMsg(c, "invalid authorize request")
		return
	}
	code, err := service.CreateAgentAuthCode(service.AgentAuthCodePayload{
		UserId:              userId,
		ClientId:            req.ClientId,
		DeviceId:            req.DeviceId,
		DeviceLabel:         req.DeviceLabel,
		State:               req.State,
		CodeChallenge:       req.CodeChallenge,
		CodeChallengeMethod: req.CodeChallengeMethod,
	})
	if err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, gin.H{
		"code":         code,
		"redirect_uri": service.BuildAgentRedirectURI(code, req.State),
		"expires_in":   constant.AgentAuthCodeTTL,
	})
}

func AgentExchange(c *gin.Context) {
	var req agentExchangeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ApiError(c, err)
		return
	}
	req.Code = strings.TrimSpace(req.Code)
	req.ClientId = strings.TrimSpace(req.ClientId)
	req.DeviceId = strings.TrimSpace(req.DeviceId)
	req.DeviceLabel = strings.TrimSpace(req.DeviceLabel)
	req.State = strings.TrimSpace(req.State)
	req.CodeVerifier = strings.TrimSpace(req.CodeVerifier)
	if req.Code == "" || req.ClientId != constant.AgentClientID || req.DeviceId == "" || req.State == "" || req.CodeVerifier == "" {
		common.ApiErrorMsg(c, "invalid exchange request")
		return
	}
	payload, err := service.ConsumeAgentAuthCode(req.Code, req.ClientId, req.State, req.DeviceId, req.CodeVerifier)
	if err != nil {
		common.ApiErrorMsg(c, err.Error())
		return
	}
	deviceLabel := req.DeviceLabel
	if deviceLabel == "" {
		deviceLabel = payload.DeviceLabel
	}
	pair, err := service.IssueAgentTokens(payload.UserId, req.ClientId, req.DeviceId, deviceLabel, req.Platform, req.AppVersion)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, pair)
}

func AgentRefresh(c *gin.Context) {
	var req agentRefreshRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ApiError(c, err)
		return
	}
	req.RefreshToken = strings.TrimSpace(req.RefreshToken)
	req.ClientId = strings.TrimSpace(req.ClientId)
	req.DeviceId = strings.TrimSpace(req.DeviceId)
	if req.RefreshToken == "" || req.ClientId != constant.AgentClientID || req.DeviceId == "" || req.GrantId <= 0 {
		common.ApiErrorMsg(c, "invalid refresh request")
		return
	}
	pair, err := service.RefreshAgentTokens(req.RefreshToken, req.ClientId, req.DeviceId, req.GrantId)
	if err != nil {
		common.ApiErrorMsg(c, err.Error())
		return
	}
	common.ApiSuccess(c, pair)
}

func AgentLogout(c *gin.Context) {
	userId := c.GetInt("id")
	var req agentLogoutRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ApiError(c, err)
		return
	}
	req.DeviceId = strings.TrimSpace(req.DeviceId)
	if req.DeviceId == "" {
		common.ApiErrorMsg(c, "device_id required")
		return
	}
	if err := service.LogoutAgentDevice(userId, req.DeviceId); err != nil {
		common.ApiError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": ""})
}

func AgentJWKS(c *gin.Context) {
	jwks, err := service.AgentJWKS()
	if err != nil {
		common.ApiError(c, err)
		return
	}
	c.JSON(http.StatusOK, jwks)
}

func AgentIntrospect(c *gin.Context) {
	token := strings.TrimSpace(c.PostForm("token"))
	if token == "" {
		var body struct {
			Token string `json:"token"`
		}
		_ = c.ShouldBindJSON(&body)
		token = strings.TrimSpace(body.Token)
	}
	if token == "" {
		auth := strings.TrimSpace(c.GetHeader("Authorization"))
		token = strings.TrimPrefix(auth, "Bearer ")
	}
	resp, err := service.IntrospectAgentToken(token)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	c.JSON(http.StatusOK, resp)
}

func ListAgentDevices(c *gin.Context) {
	userId := c.GetInt("id")
	grants, err := model.ListUserAgentGrants(userId)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	items := make([]gin.H, 0, len(grants))
	for _, g := range grants {
		items = append(items, gin.H{
			"id":           g.Id,
			"device_id":    g.DeviceId,
			"device_label": model.AgentGrantDisplayName(&g),
			"platform":     g.Platform,
			"app_version":  g.AppVersion,
			"scopes":       g.Scopes,
			"last_used_at": g.LastUsedAt,
			"revoked_at":   g.RevokedAt,
			"active":       g.IsActive(),
			"created_at":   g.CreatedAt,
		})
	}
	common.ApiSuccess(c, items)
}

func RevokeAgentDevice(c *gin.Context) {
	userId := c.GetInt("id")
	id := c.Param("id")
	grantId := 0
	if _, err := fmt.Sscanf(id, "%d", &grantId); err != nil || grantId <= 0 {
		common.ApiErrorMsg(c, "invalid grant id")
		return
	}
	if err := model.RevokeUserAgentGrant(grantId, userId); err != nil {
		common.ApiError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": ""})
}
