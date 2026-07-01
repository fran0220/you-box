package model

func youBoxMigrationModels() []interface{} {
	return []interface{}{
		&Preset{},
		&AppUsage{},
		&UserAgentGrant{},
	}
}

func youBoxMigrationSpecs() []struct {
	model interface{}
	name  string
} {
	return []struct {
		model interface{}
		name  string
	}{
		{&Preset{}, "Preset"},
		{&AppUsage{}, "AppUsage"},
		{&UserAgentGrant{}, "UserAgentGrant"},
	}
}
