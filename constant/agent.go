package constant

const (
	AgentClientID        = "youbox-agent"
	AgentAudience        = "youbox-agent"
	AgentScope           = "agent gateway"
	AgentAuthCodeTTL     = 300 // seconds
	AgentAccessTokenTTL  = 900 // 15 minutes
	AgentRefreshTokenTTL = 60 * 60 * 24 * 30 // 30 days
	AgentDeepLinkScheme  = "youbox-agent://auth"
)