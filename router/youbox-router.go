package router

import (
	"github.com/QuantumNous/new-api/controller"
	"github.com/QuantumNous/new-api/middleware"

	"github.com/gin-gonic/gin"
)

func registerYouBoxRoutes(apiRouter *gin.RouterGroup) {
	registerAgentRoutes(apiRouter)

	apiRouter.GET("/apps", middleware.HeaderNavModuleAuth("rankings"), controller.GetAppRankings)

	// Playground presets (saved model + parameter configurations), scoped
	// to the requesting user.
	presetRoute := apiRouter.Group("/preset")
	presetRoute.Use(middleware.UserAuth())
	{
		presetRoute.GET("/", controller.GetUserPresets)
		presetRoute.POST("/", controller.CreatePreset)
		presetRoute.PUT("/:id", controller.UpdatePreset)
		presetRoute.DELETE("/:id", controller.DeletePreset)
	}

	// Playground conversation history (multi-session chat threads).
	conversationRoute := apiRouter.Group("/conversation")
	conversationRoute.Use(middleware.UserAuth())
	{
		conversationRoute.GET("/", controller.GetUserConversations)
		conversationRoute.GET("/:id", controller.GetConversation)
		conversationRoute.POST("/", controller.CreateConversation)
		conversationRoute.PUT("/:id", controller.UpdateConversation)
		conversationRoute.DELETE("/:id", controller.DeleteConversation)
	}
}
