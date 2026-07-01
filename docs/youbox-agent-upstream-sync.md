# YouBox Agent Upstream Sync

## Repository layout

- YouBox Core: `https://github.com/fran0220/you-box` (`/Users/fan/you-box`)
- YouBox Agent Desktop fork: `https://github.com/fran0220/youbox-agent-desktop` (`/Users/fan/youbox-agent-desktop`)
- YouBox Agent Service: `https://github.com/fran0220/youbox-agent-service` (`/Users/fan/youbox-agent-service`, private)

Do not commit `youbox-agent-desktop/` or `youbox-agent-service/` as ordinary directories inside YouBox Core. They are independent repositories. Core may keep API contracts and planning docs under `docs/`.

## YouBox Core (`you-box`)

- Upstream: `Calcium-Ion/new-api`
- Strategy: backend-only merge via `syncing-upstream-backend` skill
- Agent identity code stays in:
  - `router/agent-router.go`
  - `controller/agent_*.go`
  - `model/user_agent_grant.go`
  - `service/agent_auth.go`
- Do not merge upstream `web/` defaults
- Current Agent scope in Core is limited to auth/account/models/contracts and the small device-management UI. Do not add Agent workspace/session/audit/sync tables here.

## YouBox Agent Desktop (`youbox-agent-desktop`)

- Origin: `fran0220/youbox-agent-desktop`
- Upstream: `craft-ai-agents/craft-agents-oss`
- Local integration branch: `youbox-integration`
- Local upstream mirror branch: `main-upstream`

```bash
cd /Users/fan/youbox-agent-desktop
git fetch upstream
git checkout main-upstream && git merge upstream/main
git checkout youbox-integration && git merge main-upstream
```

Keep upstream push disabled. Keep YouBox product patches as isolated as possible, preferably behind YouBox-specific adapters/gates, so upstream merges remain reviewable.

Current YouBox patch areas:

- app identity/config/deep-link: `apps/electron/package.json`, `electron-builder.yml`, main/deep-link/window state/config-dir paths
- YouBox auth and secure storage: `packages/shared/src/auth/youbox-agent.ts`, credential manager/types/storage helpers
- onboarding/settings product path: YouBox-only sign-in and managed gateway connection
- server/runtime guardrails: `packages/server-core/src/handlers/rpc/llm-connections.ts`, `packages/shared/src/agent/backend/factory.ts`, `packages/server-core/src/sessions/SessionManager.ts`
- runtime/provider boundary: YouBox is the only product provider; Pi-compatible code remains an internal adapter behind `youbox-gateway`, not a user-visible provider.

After every upstream merge, re-run:

```bash
cd /Users/fan/youbox-agent-desktop
bun install --frozen-lockfile
bun run typecheck:shared
(cd packages/server-core && bun run typecheck)
(cd apps/electron && bun run typecheck)
rg -n "ChatGPT|GitHub Copilot|Anthropic API|Claude Pro|BYOK|custom endpoint|Custom Endpoint|signInChatGPT|signInGitHub|signInClaude|ApiKeyInput|OAuthConnect" \
  apps/electron/src/renderer/components/onboarding \
  apps/electron/src/renderer/pages/settings \
  apps/electron/src/renderer/hooks/useOnboarding.ts \
  packages/server-core/src/handlers/rpc/llm-connections.ts \
  packages/shared/src/agent/backend/factory.ts \
  -g '*.ts' -g '*.tsx'
```

The final `rg` command should return no product-path matches.

## YouBox Agent Service (`youbox-agent-service`)

- Origin: `fran0220/youbox-agent-service`
- DB ownership: independent Agent DB only
- Core link: `youbox_user_id` plus signed Agent JWT claims (`grant_id`, `device_id`, scopes)

```bash
cd /Users/fan/youbox-agent-service
bun test
bun run typecheck
```

## Contract tests

Run from repo root:

```bash
go test ./tests/contracts/...
```

Covers auth, models, and agent-service schema contracts.

## Current verification baseline

- Core: `go test ./model ./service ./controller ./router ./tests/contracts/...`
- Core Web: `cd web/default && bun run typecheck`
- Agent Service: `bun test && bun run typecheck`
- Agent Desktop: `bun install --frozen-lockfile`, `bun run typecheck:shared`, `(cd packages/server-core && bun run typecheck)`, `(cd apps/electron && bun run typecheck)`
