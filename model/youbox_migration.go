package model

func youBoxMigrationModels() []interface{} {
	return []interface{}{
		&Preset{},
		&Conversation{},
		&AppUsage{},
		&UserAgentGrant{},
		&MediaObject{},
	}
}
