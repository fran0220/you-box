package router

import (
	"bytes"
	"embed"
	"html"
	"net/http"
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/controller"
	"github.com/QuantumNous/new-api/middleware"
	"github.com/gin-contrib/gzip"
	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
)

// ThemeAssets holds the embedded frontend assets.
type ThemeAssets struct {
	DefaultBuildFS   embed.FS
	DefaultIndexPage []byte
}

func indexBranding() (title string, description string, favicon string, themeColor string) {
	common.OptionMapRWMutex.RLock()
	defer common.OptionMapRWMutex.RUnlock()

	title = strings.TrimSpace(common.MetaTitle)
	if title == "" {
		title = strings.TrimSpace(common.SystemName)
	}
	if title == "" {
		title = "AI Gateway"
	}

	description = strings.TrimSpace(common.MetaDescription)
	if description == "" {
		description = common.DefaultMetaDescription
	}

	favicon = strings.TrimSpace(common.Favicon)
	if favicon == "" {
		favicon = strings.TrimSpace(common.Logo)
	}
	if favicon == "" {
		favicon = "/logo.png"
	}

	themeColor = strings.TrimSpace(common.BrandColor)
	if themeColor == "" {
		themeColor = "#fff"
	}

	return title, description, favicon, themeColor
}

func brandedIndexPage(indexPage []byte) []byte {
	title, description, favicon, themeColor := indexBranding()
	escapedTitle := html.EscapeString(title)
	escapedDescription := html.EscapeString(description)
	escapedFavicon := html.EscapeString(favicon)
	escapedThemeColor := html.EscapeString(themeColor)

	replacements := map[string]string{
		`<link rel="icon" type="image/png" href="/logo.png" />`: `<link rel="icon" href="` + escapedFavicon + `" />`,
		`<title>AI Gateway</title>`:                             `<title>` + escapedTitle + `</title>`,
		`<meta name="title" content="AI Gateway" />`:            `<meta name="title" content="` + escapedTitle + `" />`,
		`content="Unified AI API gateway and admin dashboard."`: `content="` + escapedDescription + `"`,
		`<meta property="og:title" content="AI Gateway" />`:     `<meta property="og:title" content="` + escapedTitle + `" />`,
		`<meta name="twitter:title" content="AI Gateway" />`:    `<meta name="twitter:title" content="` + escapedTitle + `" />`,
		`<meta name="theme-color" content="#fff" />`:            `<meta name="theme-color" content="` + escapedThemeColor + `" />`,
	}

	page := bytes.Clone(indexPage)
	for oldValue, newValue := range replacements {
		page = bytes.ReplaceAll(page, []byte(oldValue), []byte(newValue))
	}
	return page
}

func SetWebRouter(router *gin.Engine, assets ThemeAssets) {
	defaultFS := common.EmbedFolder(assets.DefaultBuildFS, "web/default/dist")

	router.Use(gzip.Gzip(gzip.DefaultCompression))
	router.Use(middleware.GlobalWebRateLimit())
	router.Use(middleware.Cache())
	router.Use(static.Serve("/", defaultFS))
	router.NoRoute(func(c *gin.Context) {
		c.Set(middleware.RouteTagKey, "web")
		if strings.HasPrefix(c.Request.RequestURI, "/v1") || strings.HasPrefix(c.Request.RequestURI, "/api") || strings.HasPrefix(c.Request.RequestURI, "/assets") {
			controller.RelayNotFound(c)
			return
		}
		c.Header("Cache-Control", "no-cache")
		c.Data(http.StatusOK, "text/html; charset=utf-8", brandedIndexPage(assets.DefaultIndexPage))
	})
}
