package service

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"crypto/x509"
	"encoding/base64"
	"encoding/pem"
	"errors"
	"fmt"
	"math/big"
	"net/url"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/constant"
	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/setting/system_setting"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

const agentAuthCodeKeyPrefix = "agent_auth_code:"
const agentJWTKeyID = "youbox-agent-1"

type AgentAuthCodePayload struct {
	UserId              int    `json:"user_id"`
	ClientId            string `json:"client_id"`
	DeviceId            string `json:"device_id"`
	DeviceLabel         string `json:"device_label"`
	State               string `json:"state"`
	CodeChallenge       string `json:"code_challenge"`
	CodeChallengeMethod string `json:"code_challenge_method"`
}

type AgentTokenPair struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	GatewayToken string `json:"gateway_token"`
	TokenType    string `json:"token_type"`
	ExpiresIn    int    `json:"expires_in"`
	GrantId      int    `json:"grant_id"`
}

type AgentAccessTokenClaims struct {
	UserId   int
	GrantId  int
	DeviceId string
}

type agentAuthCodeStore struct {
	mu    sync.Mutex
	items map[string]agentAuthCodeEntry
}

type agentAuthCodeEntry struct {
	payload   AgentAuthCodePayload
	expiresAt time.Time
}

var agentCodeStore = &agentAuthCodeStore{items: make(map[string]agentAuthCodeEntry)}

var (
	agentJWTPrivateKey *rsa.PrivateKey
	agentJWTPublicKey  *rsa.PublicKey
	agentJWTInitOnce   sync.Once
	agentJWTInitErr    error
)

func InitAgentAuthKeys() error {
	agentJWTInitOnce.Do(func() {
		agentJWTInitErr = loadOrGenerateAgentJWTKeys()
	})
	return agentJWTInitErr
}

func loadOrGenerateAgentJWTKeys() error {
	if pemData := strings.TrimSpace(os.Getenv("AGENT_JWT_PRIVATE_KEY_PEM")); pemData != "" {
		priv, err := parseRSAPrivateKeyPEM([]byte(pemData))
		if err != nil {
			return err
		}
		agentJWTPrivateKey = priv
		agentJWTPublicKey = &priv.PublicKey
		return nil
	}
	if os.Getenv("AGENT_JWT_ALLOW_EPHEMERAL") != "true" && !common.DebugEnabled {
		return errors.New("AGENT_JWT_PRIVATE_KEY_PEM is required (set AGENT_JWT_ALLOW_EPHEMERAL=true or DEBUG=true for local dev only)")
	}
	key, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		return err
	}
	agentJWTPrivateKey = key
	agentJWTPublicKey = &key.PublicKey
	common.SysLog("AGENT_JWT_PRIVATE_KEY_PEM not set; using ephemeral RSA key (dev only)")
	return nil
}

func parseRSAPrivateKeyPEM(data []byte) (*rsa.PrivateKey, error) {
	block, _ := pem.Decode(data)
	if block == nil {
		return nil, errors.New("invalid PEM block for agent JWT private key")
	}
	switch block.Type {
	case "RSA PRIVATE KEY":
		return x509.ParsePKCS1PrivateKey(block.Bytes)
	case "PRIVATE KEY":
		key, err := x509.ParsePKCS8PrivateKey(block.Bytes)
		if err != nil {
			return nil, err
		}
		priv, ok := key.(*rsa.PrivateKey)
		if !ok {
			return nil, errors.New("PEM is not an RSA private key")
		}
		return priv, nil
	default:
		return nil, fmt.Errorf("unsupported PEM type: %s", block.Type)
	}
}

func agentIssuer() string {
	addr := strings.TrimSpace(system_setting.ServerAddress)
	if addr == "" {
		return "https://api.you-box.com"
	}
	return strings.TrimRight(addr, "/")
}

func agentRefreshExpiresAt() int64 {
	return common.GetTimestamp() + int64(constant.AgentRefreshTokenTTL)
}

func validatePKCEChallenge(challenge, method string) error {
	if method != "S256" {
		return errors.New("unsupported code_challenge_method")
	}
	if len(challenge) < 43 || len(challenge) > 128 || !isPKCEString(challenge) {
		return errors.New("invalid code_challenge")
	}
	return nil
}

func validatePKCEVerifier(verifier string) error {
	if len(verifier) < 43 || len(verifier) > 128 || !isPKCEString(verifier) {
		return errors.New("invalid code_verifier")
	}
	return nil
}

func isPKCEString(value string) bool {
	for _, r := range value {
		if r >= 'a' && r <= 'z' || r >= 'A' && r <= 'Z' || r >= '0' && r <= '9' || r == '-' || r == '.' || r == '_' || r == '~' {
			continue
		}
		return false
	}
	return value != ""
}

func pkceS256(verifier string) string {
	sum := sha256.Sum256([]byte(verifier))
	return base64.RawURLEncoding.EncodeToString(sum[:])
}

func verifyPKCE(challenge, method, verifier string) error {
	if err := validatePKCEVerifier(verifier); err != nil {
		return err
	}
	if err := validatePKCEChallenge(challenge, method); err != nil {
		return err
	}
	if pkceS256(verifier) != challenge {
		return errors.New("code_verifier mismatch")
	}
	return nil
}

func CreateAgentAuthCode(payload AgentAuthCodePayload) (string, error) {
	payload.ClientId = strings.TrimSpace(payload.ClientId)
	payload.DeviceId = strings.TrimSpace(payload.DeviceId)
	payload.DeviceLabel = strings.TrimSpace(payload.DeviceLabel)
	payload.State = strings.TrimSpace(payload.State)
	payload.CodeChallenge = strings.TrimSpace(payload.CodeChallenge)
	payload.CodeChallengeMethod = strings.TrimSpace(payload.CodeChallengeMethod)
	if payload.UserId <= 0 || payload.ClientId == "" || payload.DeviceId == "" || payload.DeviceLabel == "" || payload.State == "" {
		return "", errors.New("invalid auth code payload")
	}
	if payload.ClientId != constant.AgentClientID {
		return "", errors.New("unsupported client_id")
	}
	if err := validatePKCEChallenge(payload.CodeChallenge, payload.CodeChallengeMethod); err != nil {
		return "", err
	}
	code, err := common.GenerateRandomCharsKey(48)
	if err != nil {
		return "", err
	}
	entry := agentAuthCodeEntry{
		payload:   payload,
		expiresAt: time.Now().Add(time.Duration(constant.AgentAuthCodeTTL) * time.Second),
	}
	key := agentAuthCodeKeyPrefix + code
	if common.RedisEnabled {
		raw, err := common.Marshal(entry.payload)
		if err != nil {
			return "", err
		}
		if err := common.RedisSet(key, string(raw), time.Duration(constant.AgentAuthCodeTTL)*time.Second); err != nil {
			return "", err
		}
		return code, nil
	}
	agentCodeStore.mu.Lock()
	defer agentCodeStore.mu.Unlock()
	agentCodeStore.purgeExpiredLocked()
	agentCodeStore.items[code] = entry
	return code, nil
}

func ConsumeAgentAuthCode(code, clientId, state, deviceId, codeVerifier string) (*AgentAuthCodePayload, error) {
	code = strings.TrimSpace(code)
	clientId = strings.TrimSpace(clientId)
	state = strings.TrimSpace(state)
	deviceId = strings.TrimSpace(deviceId)
	codeVerifier = strings.TrimSpace(codeVerifier)
	if code == "" {
		return nil, errors.New("empty auth code")
	}
	key := agentAuthCodeKeyPrefix + code
	if common.RedisEnabled {
		raw, err := common.RedisGet(key)
		if err != nil {
			return nil, errors.New("invalid or expired auth code")
		}
		_ = common.RedisDel(key)
		var payload AgentAuthCodePayload
		if err := common.Unmarshal([]byte(raw), &payload); err != nil {
			return nil, err
		}
		if payload.ClientId != clientId || payload.State != state || payload.DeviceId != deviceId {
			return nil, errors.New("auth code mismatch")
		}
		if err := verifyPKCE(payload.CodeChallenge, payload.CodeChallengeMethod, codeVerifier); err != nil {
			return nil, err
		}
		return &payload, nil
	}
	agentCodeStore.mu.Lock()
	defer agentCodeStore.mu.Unlock()
	entry, ok := agentCodeStore.items[code]
	if !ok || time.Now().After(entry.expiresAt) {
		delete(agentCodeStore.items, code)
		return nil, errors.New("invalid or expired auth code")
	}
	delete(agentCodeStore.items, code)
	if entry.payload.ClientId != clientId || entry.payload.State != state || entry.payload.DeviceId != deviceId {
		return nil, errors.New("auth code mismatch")
	}
	if err := verifyPKCE(entry.payload.CodeChallenge, entry.payload.CodeChallengeMethod, codeVerifier); err != nil {
		return nil, err
	}
	return &entry.payload, nil
}

func (s *agentAuthCodeStore) purgeExpiredLocked() {
	now := time.Now()
	for k, v := range s.items {
		if now.After(v.expiresAt) {
			delete(s.items, k)
		}
	}
}

func BuildAgentRedirectURI(code, state string) string {
	values := url.Values{}
	values.Set("code", code)
	values.Set("state", state)
	return constant.AgentDeepLinkScheme + "?" + values.Encode()
}

func IssueAgentTokens(userId int, clientId, deviceId, deviceLabel, platform, appVersion string) (*AgentTokenPair, error) {
	if err := InitAgentAuthKeys(); err != nil {
		return nil, err
	}
	user, err := model.GetUserById(userId, false)
	if err != nil {
		return nil, err
	}
	if user.Status != common.UserStatusEnabled {
		return nil, errors.New("user is disabled")
	}

	refreshToken, err := common.GenerateRandomCharsKey(64)
	if err != nil {
		return nil, err
	}
	refreshHash, err := common.Password2Hash(refreshToken)
	if err != nil {
		return nil, err
	}

	refreshExpiresAt := agentRefreshExpiresAt()

	grant := &model.UserAgentGrant{
		UserId:           userId,
		ClientId:         clientId,
		DeviceId:         deviceId,
		DeviceLabel:      deviceLabel,
		Platform:         platform,
		AppVersion:       appVersion,
		RefreshTokenHash: refreshHash,
		RefreshExpiresAt: refreshExpiresAt,
		Scopes:           constant.AgentScope,
		LastUsedAt:       common.GetTimestamp(),
	}
	if err := model.UpsertUserAgentGrant(grant); err != nil {
		return nil, err
	}
	updated, err := model.GetUserAgentGrantByDevice(userId, clientId, deviceId)
	if err != nil {
		return nil, err
	}
	gatewayTokenId, gatewayKey, err := ensureAgentGatewayToken(userId, updated.Id, deviceId, refreshExpiresAt)
	if err != nil {
		return nil, err
	}
	if updated.GatewayTokenId != gatewayTokenId {
		updated.GatewayTokenId = gatewayTokenId
		if err := updated.Update(); err != nil {
			return nil, err
		}
	}

	accessToken, err := signAgentAccessToken(userId, updated.Id, deviceId)
	if err != nil {
		return nil, err
	}

	return &AgentTokenPair{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		GatewayToken: "sk-" + gatewayKey,
		TokenType:    "Bearer",
		ExpiresIn:    constant.AgentAccessTokenTTL,
		GrantId:      updated.Id,
	}, nil
}

func ensureAgentGatewayToken(userId int, grantId int, deviceId string, expiresAt int64) (int, string, error) {
	name := fmt.Sprintf("agent:%d:%s", grantId, deviceId)
	existing, err := model.GetAgentGatewayTokenByGrantId(userId, grantId)
	if err == nil && existing != nil && existing.Status == common.TokenStatusEnabled {
		if existing.ExpiredTime != expiresAt || existing.Name != name {
			existing.ExpiredTime = expiresAt
			existing.Name = name
			if err := existing.Update(); err != nil {
				return 0, "", err
			}
		}
		return existing.Id, existing.Key, nil
	}
	key, err := common.GenerateKey()
	if err != nil {
		return 0, "", err
	}
	token := model.Token{
		UserId:         userId,
		Name:           name,
		Key:            key,
		Source:         model.TokenSourceAgentDesktop,
		AgentGrantId:   grantId,
		CreatedTime:    common.GetTimestamp(),
		AccessedTime:   common.GetTimestamp(),
		ExpiredTime:    expiresAt,
		RemainQuota:    0,
		UnlimitedQuota: true,
		Status:         common.TokenStatusEnabled,
	}
	if err := token.Insert(); err != nil {
		return 0, "", err
	}
	return token.Id, key, nil
}

func signAgentAccessToken(userId, grantId int, deviceId string) (string, error) {
	now := time.Now()
	claims := jwt.MapClaims{
		"iss":       agentIssuer(),
		"aud":       constant.AgentAudience,
		"sub":       fmt.Sprintf("%d", userId),
		"scope":     constant.AgentScope,
		"grant_id":  grantId,
		"device_id": deviceId,
		"jti":       uuid.NewString(),
		"iat":       now.Unix(),
		"exp":       now.Add(time.Duration(constant.AgentAccessTokenTTL) * time.Second).Unix(),
	}
	tok := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)
	tok.Header["kid"] = agentJWTKeyID
	return tok.SignedString(agentJWTPrivateKey)
}

func RefreshAgentTokens(refreshToken, clientId, deviceId string, grantId int) (*AgentTokenPair, error) {
	refreshToken = strings.TrimSpace(refreshToken)
	if refreshToken == "" {
		return nil, errors.New("empty refresh token")
	}
	grant, userId, err := findGrantByRefreshToken(refreshToken, clientId, deviceId, grantId)
	if err != nil {
		return nil, err
	}
	user, err := model.GetUserById(userId, false)
	if err != nil {
		return nil, err
	}
	if user.Status != common.UserStatusEnabled {
		return nil, errors.New("user is disabled")
	}

	newRefresh, err := common.GenerateRandomCharsKey(64)
	if err != nil {
		return nil, err
	}
	newHash, err := common.Password2Hash(newRefresh)
	if err != nil {
		return nil, err
	}
	refreshExpiresAt := agentRefreshExpiresAt()
	gatewayTokenId, gatewayKey, err := ensureAgentGatewayToken(userId, grant.Id, deviceId, refreshExpiresAt)
	if err != nil {
		return nil, err
	}
	grant.RefreshTokenHash = newHash
	grant.RefreshExpiresAt = refreshExpiresAt
	grant.GatewayTokenId = gatewayTokenId
	grant.LastUsedAt = common.GetTimestamp()
	if err := grant.Update(); err != nil {
		return nil, err
	}

	accessToken, err := signAgentAccessToken(userId, grant.Id, deviceId)
	if err != nil {
		return nil, err
	}
	return &AgentTokenPair{
		AccessToken:  accessToken,
		RefreshToken: newRefresh,
		GatewayToken: "sk-" + gatewayKey,
		TokenType:    "Bearer",
		ExpiresIn:    constant.AgentAccessTokenTTL,
		GrantId:      grant.Id,
	}, nil
}

func findGrantByRefreshToken(refreshToken, clientId, deviceId string, grantId int) (*model.UserAgentGrant, int, error) {
	if grantId <= 0 {
		return nil, 0, errors.New("grant_id required")
	}
	grant, err := model.GetUserAgentGrantForRefresh(grantId, clientId, deviceId)
	if err != nil {
		return nil, 0, errors.New("invalid refresh token")
	}
	if grant.IsRevoked() {
		return nil, 0, errors.New("device authorization revoked")
	}
	if grant.IsRefreshExpired(common.GetTimestamp()) {
		_ = model.RevokeUserAgentGrant(grant.Id, grant.UserId)
		return nil, 0, errors.New("refresh token expired")
	}
	if !common.ValidatePasswordAndHash(refreshToken, grant.RefreshTokenHash) {
		return nil, 0, errors.New("invalid refresh token")
	}
	return grant, grant.UserId, nil
}

func ValidateAgentAccessToken(tokenString string) (int, error) {
	claims, err := ValidateAgentAccessTokenClaims(tokenString)
	if err != nil {
		return 0, err
	}
	return claims.UserId, nil
}

func ValidateAgentAccessTokenClaims(tokenString string) (*AgentAccessTokenClaims, error) {
	if err := InitAgentAuthKeys(); err != nil {
		return nil, err
	}
	tokenString = strings.TrimPrefix(strings.TrimSpace(tokenString), "Bearer ")
	parsed, err := jwt.Parse(tokenString, func(t *jwt.Token) (any, error) {
		if t.Method.Alg() != jwt.SigningMethodRS256.Alg() {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return agentJWTPublicKey, nil
	}, jwt.WithAudience(constant.AgentAudience), jwt.WithIssuer(agentIssuer()))
	if err != nil || !parsed.Valid {
		return nil, errors.New("invalid access token")
	}
	claims, ok := parsed.Claims.(jwt.MapClaims)
	if !ok {
		return nil, errors.New("invalid token claims")
	}
	sub, _ := claims["sub"].(string)
	userId := 0
	fmt.Sscanf(sub, "%d", &userId)
	if userId <= 0 {
		return nil, errors.New("invalid token subject")
	}
	user, err := model.GetUserById(userId, false)
	if err != nil {
		return nil, err
	}
	if user.Status != common.UserStatusEnabled {
		return nil, errors.New("user is disabled")
	}
	grantId := intClaim(claims["grant_id"])
	deviceId, _ := claims["device_id"].(string)
	if grantId > 0 {
		grant, err := model.GetUserAgentGrantById(grantId, userId)
		if err != nil {
			return nil, errors.New("device authorization revoked")
		}
		if err := validateAgentGrantUsable(grant); err != nil {
			return nil, err
		}
	} else if deviceId != "" {
		grant, err := model.GetUserAgentGrantByDevice(userId, constant.AgentClientID, deviceId)
		if err != nil {
			return nil, errors.New("device authorization revoked")
		}
		if err := validateAgentGrantUsable(grant); err != nil {
			return nil, err
		}
		grantId = grant.Id
	}
	return &AgentAccessTokenClaims{UserId: userId, GrantId: grantId, DeviceId: deviceId}, nil
}

func validateAgentGrantUsable(grant *model.UserAgentGrant) error {
	if grant == nil || grant.IsRevoked() {
		return errors.New("device authorization revoked")
	}
	if grant.IsRefreshExpired(common.GetTimestamp()) {
		_ = model.RevokeUserAgentGrant(grant.Id, grant.UserId)
		return errors.New("device authorization expired")
	}
	return nil
}

func intClaim(v any) int {
	switch n := v.(type) {
	case float64:
		return int(n)
	case int:
		return n
	case int64:
		return int(n)
	case string:
		var i int
		fmt.Sscanf(n, "%d", &i)
		return i
	default:
		return 0
	}
}

func IntrospectAgentToken(tokenString string) (map[string]any, error) {
	userId, err := ValidateAgentAccessToken(tokenString)
	active := err == nil
	resp := map[string]any{
		"active": active,
		"scope":  constant.AgentScope,
	}
	if !active {
		return resp, nil
	}
	user, err := model.GetUserById(userId, false)
	if err != nil {
		resp["active"] = false
		return resp, nil
	}
	resp["sub"] = fmt.Sprintf("%d", userId)
	resp["status"] = user.Status
	return resp, nil
}

func AgentJWKS() (map[string]any, error) {
	if err := InitAgentAuthKeys(); err != nil {
		return nil, err
	}
	n := base64.RawURLEncoding.EncodeToString(agentJWTPublicKey.N.Bytes())
	e := base64.RawURLEncoding.EncodeToString(big.NewInt(int64(agentJWTPublicKey.E)).Bytes())
	return map[string]any{
		"keys": []map[string]any{
			{
				"kty": "RSA",
				"kid": agentJWTKeyID,
				"use": "sig",
				"alg": "RS256",
				"n":   n,
				"e":   e,
			},
		},
	}, nil
}

func LogoutAgentDevice(userId int, deviceId string) error {
	return model.RevokeUserAgentGrantByDevice(userId, constant.AgentClientID, deviceId)
}
