package middleware

import (
	"fmt"
	"net/http"

	"github.com/QuantumNous/new-api/product"

	"github.com/gin-gonic/gin"
)

// RequireFeature aborts with 403 when the active product does not enable key.
// Use only on product seams (e.g. router/youbox-router.go), not inside core controllers.
func RequireFeature(key product.FeatureKey) gin.HandlerFunc {
	return func(c *gin.Context) {
		if !product.Enabled(key) {
			c.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"message": fmt.Sprintf("feature %s is disabled for this product", key),
			})
			c.Abort()
			return
		}
		c.Next()
	}
}
