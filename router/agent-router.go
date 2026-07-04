package router

import (
	"github.com/QuantumNous/new-api/controller"
	"github.com/QuantumNous/new-api/middleware"

	"github.com/gin-gonic/gin"
)

func registerAgentRoutes(apiRouter *gin.RouterGroup) {
	agentRoute := apiRouter.Group("/agent")
	{
		authRoute := agentRoute.Group("/auth")
		{
			authRoute.GET("/jwks", controller.AgentJWKS)
			authRoute.POST("/exchange", middleware.CriticalRateLimit(), controller.AgentExchange)
			authRoute.POST("/refresh", middleware.CriticalRateLimit(), controller.AgentRefresh)
			authRoute.POST("/introspect", middleware.CriticalRateLimit(), controller.AgentIntrospect)

			authRoute.POST("/authorize", middleware.UserAuth(), controller.AgentAuthorize)
			authRoute.POST("/logout", middleware.AgentDesktopAuth(), controller.AgentLogout)
		}

		agentRoute.GET("/account", middleware.AgentDesktopAuth(), controller.AgentAccount)
		agentRoute.GET("/models", middleware.AgentDesktopAuth(), controller.AgentModels)
		agentRoute.GET("/desktop-config", middleware.AgentDesktopAuth(), controller.AgentDesktopConfig)
		agentRoute.GET("/policy", middleware.AgentDesktopAuth(), controller.AgentDesktopPolicy)
		agentRoute.POST("/audit", middleware.AgentDesktopAuth(), controller.AgentDesktopAudit)

		devicesRoute := agentRoute.Group("/devices")
		devicesRoute.Use(middleware.UserAuth())
		{
			devicesRoute.GET("", controller.ListAgentDevices)
			devicesRoute.DELETE("/:id", controller.RevokeAgentDevice)
		}
	}
}
