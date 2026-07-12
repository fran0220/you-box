package setting

import (
	"encoding/json"

	"github.com/QuantumNous/new-api/common"
)

// Chats holds admin-configured external chat deep links (empty by default).
// First-party product chat is the in-app Playground at /playground.
// Operators can still configure presets via the Chats option when needed.
var Chats = []map[string]string{}

func UpdateChatsByJsonString(jsonString string) error {
	Chats = make([]map[string]string, 0)
	return json.Unmarshal([]byte(jsonString), &Chats)
}

func Chats2JsonString() string {
	jsonBytes, err := json.Marshal(Chats)
	if err != nil {
		common.SysLog("error marshalling chats: " + err.Error())
		return "[]"
	}
	return string(jsonBytes)
}
