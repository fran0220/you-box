package system_setting

import (
	"github.com/QuantumNous/new-api/setting/config"
)

// ThemeSettings is kept registered for backward compatibility with
// deployments that persisted a theme.frontend option while the classic
// frontend still existed. The classic frontend has been removed, so any
// stored value is normalized to "default".
type ThemeSettings struct {
	Frontend string `json:"frontend"`
}

var themeSettings = ThemeSettings{
	Frontend: "default",
}

func init() {
	config.GlobalConfig.Register("theme", &themeSettings)
}

func GetThemeSettings() *ThemeSettings {
	if themeSettings.Frontend != "default" {
		themeSettings.Frontend = "default"
	}
	return &themeSettings
}
