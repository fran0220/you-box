package middleware

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/logger"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/require"
)

func TestRequestIDIsAvailableToRequestContextLogger(t *testing.T) {
	gin.SetMode(gin.TestMode)
	var output bytes.Buffer
	common.LogWriterMu.Lock()
	previousWriter := gin.DefaultWriter
	gin.DefaultWriter = &output
	common.LogWriterMu.Unlock()
	t.Cleanup(func() {
		common.LogWriterMu.Lock()
		gin.DefaultWriter = previousWriter
		common.LogWriterMu.Unlock()
	})

	router := gin.New()
	router.Use(RequestId())
	router.GET("/", func(c *gin.Context) {
		logger.LogInfo(c.Request.Context(), "request-id-test")
		c.Status(http.StatusNoContent)
	})

	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/", nil))

	requestID := recorder.Header().Get(common.RequestIdKey)
	require.NotEmpty(t, requestID)
	require.Contains(t, output.String(), requestID)
	require.False(t, strings.Contains(output.String(), "SYSTEM | request-id-test"))
}
