package router

import (
	"github.com/QuantumNous/new-api/controller"
	"github.com/QuantumNous/new-api/middleware"
	"github.com/QuantumNous/new-api/product"

	"github.com/gin-gonic/gin"
)

// registerYouBoxRoutes is the product extension seam for routes that are not
// part of upstream Calcium-Ion/new-api. Gate with product.Feature* so Origin
// Gateway can disable retail/agent capabilities without forking core controllers.
func registerYouBoxRoutes(apiRouter *gin.RouterGroup) {
	if product.Enabled(product.FeatureAgentDesktop) {
		registerAgentRoutes(apiRouter)
	}

	if product.Enabled(product.FeatureRankings) {
		apiRouter.GET("/apps", middleware.HeaderNavModuleAuth("rankings"), controller.GetAppRankings)
	}

	// Playground presets (saved model + parameter configurations), scoped
	// to the requesting user.
	if product.Enabled(product.FeaturePlaygroundPresets) {
		presetRoute := apiRouter.Group("/preset")
		presetRoute.Use(middleware.UserAuth(), middleware.RequireFeature(product.FeaturePlaygroundPresets))
		{
			presetRoute.GET("/", controller.GetUserPresets)
			presetRoute.POST("/", controller.CreatePreset)
			presetRoute.PUT("/:id", controller.UpdatePreset)
			presetRoute.DELETE("/:id", controller.DeletePreset)
		}

		// Playground conversation history (multi-session chat threads).
		conversationRoute := apiRouter.Group("/conversation")
		conversationRoute.Use(middleware.UserAuth(), middleware.RequireFeature(product.FeaturePlaygroundPresets))
		{
			conversationRoute.GET("/", controller.GetUserConversations)
			conversationRoute.GET("/:id", controller.GetConversation)
			conversationRoute.POST("/", controller.CreateConversation)
			conversationRoute.PUT("/:id", controller.UpdateConversation)
			conversationRoute.DELETE("/:id", controller.DeleteConversation)
		}
	}
}
