package router

import (
	"github.com/QuantumNous/new-api/controller"
	"github.com/QuantumNous/new-api/middleware"

	"github.com/gin-gonic/gin"
)

// SetMediaRouter registers durable R2 media endpoints (gateway-owned, not Asset Worker).
func SetMediaRouter(router *gin.Engine) {
	// Content may be authorized via signed query params (no Authorization header),
	// so auth is enforced inside the handler rather than middleware.
	public := router.Group("/v1")
	public.Use(middleware.RouteTag("relay"))
	{
		public.GET("/media/:id/content", controller.GetMediaContent)
	}

	authed := router.Group("/v1")
	authed.Use(middleware.RouteTag("relay"))
	authed.Use(middleware.TokenOrUserAuth())
	{
		authed.GET("/media/:id", controller.GetMediaMeta)
		authed.POST("/media/uploads", middleware.UploadRateLimit(), controller.UploadMedia)
		authed.DELETE("/media/:id", controller.DeleteMedia)
	}
}
