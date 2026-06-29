package model

func youBoxMigrationModels() []interface{} {
	return []interface{}{
		&Preset{},
		&AppUsage{},
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
	}
}
