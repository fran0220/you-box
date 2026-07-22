package controller

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/require"
)

func TestResetPasswordMalformedJSONPreservesPublicError(t *testing.T) {
	gin.SetMode(gin.TestMode)
	recorder := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(recorder)
	c.Request = httptest.NewRequest(http.MethodPost, "/api/user/reset", strings.NewReader("{"))

	ResetPassword(c)

	require.JSONEq(t, `{"success":false,"message":"无效的参数"}`, recorder.Body.String())
}
