package middleware

import (
	"net/http"
	"strings"

	"github.com/QuantumNous/new-api/service"

	"github.com/gin-gonic/gin"
)

func AgentDesktopAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		auth := strings.TrimSpace(c.GetHeader("Authorization"))
		if auth == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Authorization header required",
			})
			c.Abort()
			return
		}
		claims, err := service.ValidateAgentAccessTokenClaims(auth)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": err.Error(),
			})
			c.Abort()
			return
		}
		userId := claims.UserId
		c.Set("id", userId)
		c.Set("agent_user_id", userId)
		c.Set("agent_grant_id", claims.GrantId)
		c.Set("agent_device_id", claims.DeviceId)
		c.Next()
	}
}

func AgentDesktopAuthOrUserAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		auth := strings.TrimSpace(c.GetHeader("Authorization"))
		if strings.HasPrefix(auth, "Bearer ") {
			claims, err := service.ValidateAgentAccessTokenClaims(auth)
			if err == nil {
				userId := claims.UserId
				c.Set("id", userId)
				c.Set("agent_user_id", userId)
				c.Set("agent_grant_id", claims.GrantId)
				c.Set("agent_device_id", claims.DeviceId)
				c.Next()
				return
			}
		}
		UserAuth()(c)
	}
}
