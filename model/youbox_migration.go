package model

func youBoxMigrationModels() []interface{} {
	return []interface{}{
		&Preset{},
		&Conversation{},
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
		{&Conversation{}, "Conversation"},
		{&AppUsage{}, "AppUsage"},
		{&UserAgentGrant{}, "UserAgentGrant"},
	}
}
