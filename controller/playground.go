package controller

import (
	"errors"
	"fmt"

	"github.com/QuantumNous/new-api/middleware"
	"github.com/QuantumNous/new-api/model"
	relaycommon "github.com/QuantumNous/new-api/relay/common"
	"github.com/QuantumNous/new-api/types"

	"github.com/gin-gonic/gin"
)

func Playground(c *gin.Context) {
	playgroundRelay(c, types.RelayFormatOpenAI)
}

// PlaygroundEmbeddings proxies the playground console's embeddings requests
// through the relay using the current session (no API key in the browser).
func PlaygroundEmbeddings(c *gin.Context) {
	playgroundRelay(c, types.RelayFormatEmbedding)
}

// PlaygroundImages proxies image-generation requests for the playground console.
func PlaygroundImages(c *gin.Context) {
	playgroundRelay(c, types.RelayFormatOpenAIImage)
}

// PlaygroundRerank proxies rerank requests for the playground console.
func PlaygroundRerank(c *gin.Context) {
	playgroundRelay(c, types.RelayFormatRerank)
}

// playgroundRelay performs the shared playground proxy setup (session auth →
// temporary token in the requesting user's group) and dispatches to the relay
// with the given format.
func playgroundRelay(c *gin.Context, format types.RelayFormat) {
	var newAPIError *types.NewAPIError

	defer func() {
		if newAPIError != nil {
			c.JSON(newAPIError.StatusCode, gin.H{
				"error": newAPIError.ToOpenAIError(),
			})
		}
	}()

	useAccessToken := c.GetBool("use_access_token")
	if useAccessToken {
		newAPIError = types.NewError(errors.New("暂不支持使用 access token"), types.ErrorCodeAccessDenied, types.ErrOptionWithSkipRetry())
		return
	}

	relayInfo, err := relaycommon.GenRelayInfo(c, format, nil, nil)
	if err != nil {
		newAPIError = types.NewError(err, types.ErrorCodeInvalidRequest, types.ErrOptionWithSkipRetry())
		return
	}

	userId := c.GetInt("id")

	// Write user context to ensure acceptUnsetRatio is available
	userCache, err := model.GetUserCache(userId)
	if err != nil {
		newAPIError = types.NewError(err, types.ErrorCodeQueryDataError, types.ErrOptionWithSkipRetry())
		return
	}
	userCache.WriteContext(c)

	tempToken := &model.Token{
		UserId: userId,
		Name:   fmt.Sprintf("playground-%s", relayInfo.UsingGroup),
		Group:  relayInfo.UsingGroup,
	}
	_ = middleware.SetupContextForToken(c, tempToken)

	Relay(c, format)
}
