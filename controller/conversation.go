package controller

import (
	"strconv"
	"strings"
	"unicode/utf8"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"

	"github.com/gin-gonic/gin"
)

// maxUserConversations caps cloud-saved playground threads per user.
const maxUserConversations = 200

// maxConversationMessagesBytes rejects extremely large payloads (base64
// images in history can grow fast). ~4 MiB of JSON is a practical ceiling
// for a single conversation document.
const maxConversationMessagesBytes = 4 * 1024 * 1024

type conversationRequest struct {
	Title    string `json:"title"`
	Messages string `json:"messages"`
	Config   string `json:"config"`
}

func GetUserConversations(c *gin.Context) {
	userId := c.GetInt("id")
	items, err := model.GetConversationsByUserId(userId)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, items)
}

func GetConversation(c *gin.Context) {
	userId := c.GetInt("id")
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		common.ApiErrorMsg(c, "invalid conversation id")
		return
	}
	conv, err := model.GetConversationByIdAndUser(id, userId)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, conv)
}

func CreateConversation(c *gin.Context) {
	userId := c.GetInt("id")

	var req conversationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ApiError(c, err)
		return
	}

	title := normalizeConversationTitle(req.Title)
	if errMsg := validateConversationPayload(req.Messages); errMsg != "" {
		common.ApiErrorMsg(c, errMsg)
		return
	}

	count, err := model.CountUserConversations(userId)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	if int(count) >= maxUserConversations {
		common.ApiErrorMsg(c, "conversation limit reached")
		return
	}

	if req.Messages == "" {
		req.Messages = "[]"
	}

	conv := model.Conversation{
		UserId:   userId,
		Title:    title,
		Messages: req.Messages,
		Config:   req.Config,
	}
	if err := conv.Insert(); err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, conv)
}

func UpdateConversation(c *gin.Context) {
	userId := c.GetInt("id")
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		common.ApiErrorMsg(c, "invalid conversation id")
		return
	}

	var req conversationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ApiError(c, err)
		return
	}

	if errMsg := validateConversationPayload(req.Messages); errMsg != "" {
		common.ApiErrorMsg(c, errMsg)
		return
	}

	existing, err := model.GetConversationByIdAndUser(id, userId)
	if err != nil {
		common.ApiError(c, err)
		return
	}

	title := normalizeConversationTitle(req.Title)
	if title != "" {
		existing.Title = title
	}
	if req.Messages != "" {
		existing.Messages = req.Messages
	}
	// Allow clearing config with empty string by always writing when bound.
	existing.Config = req.Config

	if err := existing.Update(); err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, existing)
}

func DeleteConversation(c *gin.Context) {
	userId := c.GetInt("id")
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		common.ApiErrorMsg(c, "invalid conversation id")
		return
	}
	if err := model.DeleteConversationByIdAndUser(id, userId); err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, nil)
}

func normalizeConversationTitle(title string) string {
	title = strings.TrimSpace(title)
	if title == "" {
		return "New chat"
	}
	if utf8.RuneCountInString(title) > 256 {
		runes := []rune(title)
		title = string(runes[:256])
	}
	return title
}

func validateConversationPayload(messages string) string {
	if len(messages) > maxConversationMessagesBytes {
		return "conversation messages payload is too large"
	}
	return ""
}
