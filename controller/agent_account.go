package controller

import (
	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"

	"github.com/gin-gonic/gin"
)

func AgentAccount(c *gin.Context) {
	userId := c.GetInt("id")
	user, err := model.GetUserById(userId, false)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	activeSubscriptions, err := model.GetAllActiveUserSubscriptions(userId)
	if err != nil {
		activeSubscriptions = []model.SubscriptionSummary{}
	}
	subscriptionSummary := gin.H{
		"active_count": len(activeSubscriptions),
	}
	if len(activeSubscriptions) > 0 && activeSubscriptions[0].Subscription != nil {
		sub := activeSubscriptions[0].Subscription
		subscriptionSummary["status"] = sub.Status
		subscriptionSummary["end_time"] = sub.EndTime
		subscriptionSummary["amount_total"] = sub.AmountTotal
		subscriptionSummary["amount_used"] = sub.AmountUsed
	}
	common.ApiSuccess(c, gin.H{
		"id":                   user.Id,
		"display_name":         user.DisplayName,
		"username":             user.Username,
		"email":                user.Email,
		"status":               user.Status,
		"quota":                user.Quota,
		"used_quota":           user.UsedQuota,
		"group":                user.Group,
		"subscription_summary": subscriptionSummary,
	})
}
