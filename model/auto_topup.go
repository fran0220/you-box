package model

import (
	"github.com/QuantumNous/new-api/common"
)

// GetEnabledUsersAfter returns enabled users with id greater than afterId,
// ordered by id (keyset pagination). Used by the auto top-up scan, which parses
// each user's JSON settings in-process (settings are not SQL-filterable across
// the three supported databases).
func GetEnabledUsersAfter(afterId int, limit int) ([]*User, error) {
	if limit <= 0 {
		limit = 200
	}
	var users []*User
	err := DB.Where("id > ? AND status = ?", afterId, common.UserStatusEnabled).
		Order("id asc").
		Limit(limit).
		Find(&users).Error
	return users, err
}
