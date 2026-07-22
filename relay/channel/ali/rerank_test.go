package ali

import (
	"errors"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	relaycommon "github.com/QuantumNous/new-api/relay/common"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/require"
)

type failingResponseWriter struct {
	gin.ResponseWriter
}

func (w *failingResponseWriter) Write([]byte) (int, error) {
	return 0, errors.New("client disconnected")
}

func TestRerankHandlerKeepsUsageAfterDownstreamWriteFailure(t *testing.T) {
	gin.SetMode(gin.TestMode)
	recorder := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(recorder)
	c.Request = httptest.NewRequest(http.MethodPost, "/v1/rerank", nil)
	c.Writer = &failingResponseWriter{ResponseWriter: c.Writer}
	resp := &http.Response{
		StatusCode: http.StatusOK,
		Body: io.NopCloser(strings.NewReader(
			`{"output":{"results":[]},"usage":{"total_tokens":37}}`,
		)),
	}

	relayErr, usage := RerankHandler(c, resp, &relaycommon.RelayInfo{})

	require.Nil(t, relayErr)
	require.NotNil(t, usage)
	require.Equal(t, 37, usage.TotalTokens)
}
