package router

import (
	"github.com/QuantumNous/new-api/controller"
	"github.com/QuantumNous/new-api/middleware"

	"github.com/gin-gonic/gin"
)

func registerYouBoxRoutes(apiRouter *gin.RouterGroup) {
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
}
