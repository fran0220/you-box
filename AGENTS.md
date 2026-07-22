# AGENTS.md — Project Conventions for Origin Gateway

## Overview

This is an AI API gateway/proxy built with Go. It aggregates 40+ upstream AI providers (OpenAI, Claude, Gemini, Azure, AWS Bedrock, etc.) behind a unified API, with user management, billing, rate limiting, and an admin dashboard.

This repository is **Origin Gateway** (API gateway + web console). Brand name: **Origin Gateway**. Image: `ghcr.io/fran0220/origin-gateway`. The legacy Core `electron/` desktop shell has been removed and must not be reintroduced.

**Production scope:** deployed **only on BWG** as Origin Gateway (`PRODUCT_ID=origingame`, `api.origingame.dev`).  
**Do not deploy this image to `youbox` / `you-box.com`.** That host is the **BoxAI** product stack (`fran0220/boxAI`). Dual-host “youbox + bwg both run this repo” is **retired**. `PRODUCT_ID=youbox` remains a **local/dev backend profile** only; the frontend Circuit skin is retired.

**Primary production consumer:** OriginGame platform monorepo (portal / play / Studio). That repo must **not** vendor this AGPL source; it integrates over HTTP only. Contract: `docs/origingame-contract.md`. Boundary: `docs/origingame-platform.md`.

## Tech Stack

- **Backend**: Go 1.22+, Gin web framework, GORM v2 ORM
- **Frontend**: React 19, TypeScript, Rsbuild, Base UI, Tailwind CSS
- **Databases**: SQLite, MySQL, PostgreSQL (all three must be supported)
- **Cache**: Redis (go-redis) + in-memory cache
- **Auth**: JWT, WebAuthn/Passkeys, OAuth (GitHub, Discord, OIDC, etc.)
- **Frontend package manager**: Bun (preferred over npm/yarn/pnpm)

## Architecture

Layered architecture: Router -> Controller -> Service -> Model

```
router/        — HTTP routing (API, relay, dashboard, web)
  router/youbox-router.go — product extension seam (gated routes)
controller/    — Request handlers
service/       — Business logic
model/         — Data models and DB access (GORM)
relay/         — AI API relay/proxy with provider adapters
  relay/channel/ — Provider-specific adapters (openai/, claude/, gemini/, aws/, etc.)
middleware/    — Auth, rate limiting, CORS, logging, distribution, RequireFeature
product/       — Runtime product profile (PRODUCT_ID, FeatureSet, public base URL)
setting/       — Configuration management (ratio, model, operation, system, performance)
common/        — Shared utilities (JSON, crypto, Redis, env, rate-limit, etc.)
dto/           — Data transfer objects (request/response structs)
constant/      — Constants (API types, channel types, context keys)
types/         — Type definitions (relay formats, file sources, errors)
i18n/          — Backend internationalization (go-i18n, en/zh)
oauth/         — OAuth provider implementations
pkg/           — Internal packages (cachex, ionet)
web/             — Frontend themes container
 web/default/   — Default frontend (React 19, Rsbuild, Base UI, Tailwind)
  web/default/src/products/ — OriginGame skin + runtime feature resolution
  web/default/src/i18n/ — Frontend internationalization (i18next, zh/en/fr/ru/ja/vi)
```

## Production Deployment

### Hosts (current)

| Role | SSH host | App directory | Compose service / container | Product (`PRODUCT_ID`) | Public domain | Host listen | Reverse proxy |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Only production host for this repo** | `bwg` | `/opt/origin-gateway` | `new-api` / `origin-gateway` | `origingame` | `https://api.origingame.dev/` | `127.0.0.1:9320` | Nginx → `127.0.0.1:9320` |

| Retired for this repo | Notes |
| --- | --- |
| `youbox` (`160.187.1.155`, `you-box.com`) | **Not this stack.** Site is **BoxAI**: `fran0220/boxAI`. |
| `jpdata` | Previously retired; do not redeploy here. |

Notes:

- Production deploys of **this** repository target **BWG only**.
- `bwg` is memory-constrained (~2GB). Prefer **pulling a prebuilt image** over building on the host.

### Image strategy

```text
ghcr.io/fran0220/origin-gateway:<git-tag>   # preferred immutable
ghcr.io/fran0220/origin-gateway:main
ghcr.io/fran0220/you-box:<git-tag>          # legacy alias (same digest)
```

Optional image publish (not the current production deploy path): Buildkite —
`.buildkite/pipeline.yml`, setup `docs/buildkite.md`.

Ops: `docs/deploy.md`

Local/dev:

```text
origin-gateway:local                        # docker-compose.yml via GATEWAY_IMAGE
```

```bash
GATEWAY_IMAGE=ghcr.io/fran0220/origin-gateway:v0.1.17
# one-release fallback if host .env still uses old name:
# BOXAI_IMAGE=ghcr.io/fran0220/you-box:v0.1.17
```

### Build / publish (once per release)

```bash
git checkout main && git pull
docker buildx build   --platform linux/amd64   -t ghcr.io/fran0220/origin-gateway:v0.1.17   -t ghcr.io/fran0220/origin-gateway:main   -t ghcr.io/fran0220/you-box:v0.1.17   -t ghcr.io/fran0220/you-box:main   --push   .
```

### Deploy on BWG only

```bash
ssh bwg
cd /opt/origin-gateway
# edit .env: GATEWAY_IMAGE=… PRODUCT_ID=origingame NODE_NAME=bwg-origin-gateway-1
docker compose pull new-api
docker compose up -d new-api
curl -fsS http://127.0.0.1:9320/api/status | jq .data.product
# expect data.product.id == "origingame", display_name == "Origin Gateway"
```

Hard rules:

1. **Never** delete/recreate persistent volumes during routine deploys.
2. Keep BWG `SESSION_SECRET`, DB password, Redis password, and `NODE_NAME` stable.
3. Production `PRODUCT_ID=origingame` (repo default is already origingame).
4. Do **not** deploy this image to the BoxAI host.
5. Upstream `calciumion/new-api` images are **not** production images for this product.

### Local development

```bash
docker compose build new-api
docker compose up -d
# default image: origin-gateway:local  (override with GATEWAY_IMAGE)
# default PRODUCT_ID=origingame; youbox remains a local backend dev profile
```

Emergency rebuild: use a builder/CI machine with RAM — **not** BWG. Prefer registry pull.

## Internationalization (i18n)

### Backend (`i18n/`)
- Library: `nicksnyder/go-i18n/v2`
- Languages: en, zh

### Frontend (`web/default/src/i18n/`)
- Library: `i18next` + `react-i18next` + `i18next-browser-languagedetector`
- Languages: en (base), zh (fallback), fr, ru, ja, vi
- Translation files: `web/default/src/i18n/locales/{lang}.json` — flat JSON, keys are English source strings
- Usage: `useTranslation()` hook, call `t('English key')` in components
- CLI tools: `bun run i18n:sync` (from `web/default/`)

## Frontend Design Language — Amp × Arcade (single skin)

One shell, one component tree, **one design language**, shared with the parent
OriginGame monorepo. The retired YouBox "Circuit" demo skin has been removed;
non-`origingame` product ids resolve to the same Paper skin on the client.

### Shared shell rules

- **One shell**: marketing, docs, console, and admin share `AppShell` (document scroll, sticky header, footer). Public pages without sidebar; console mounts the sidebar slot; admin is a drill-in in the same shell.
- **Catalog pattern**: Model Plaza-style pages use search + facet dropdowns, URL-driven filters, window-virtualized results — no pagination.
- **Auth**: single centered narrow column with brand top-left — no split brand panels.
- **Primitives first**: `web/default/src/components/youbox/` (PageHeader, StatCard, ModelCard, EmptyState, Eyebrow, …).
- **Semantic tokens only**: names live in `styles/theme.css`; values map the mirrored `--og-*` tokens. Do not hardcode product colors in features.

### Origin Gateway — "Paper" / Amp × Arcade (`PRODUCT_ID=origingame`, `ui.skin=paper`)

Warm parchment arcade language, mirrored from OriginGame's token package:

| | Light | Warm dark |
| --- | --- | --- |
| Canvas (paper) | `#f4efe4` | `#1b160f` |
| Card / panel | `#faf6ec` / `#ece5d5` | `#201a13` / `#17130e` |
| Ink | `#1a1613` | `#ece5d3` |
| Accent / CTA | `#ffb100` (constant) | `#ffb100` (constant) |
| Brand text | `#a86a00` | `#ffc633` |

- **Type**: Archivo Black (display), Newsreader (serif), IBM Plex Mono (mono/eyebrow), system-ui body.
- **Radii**: 10px block / 6px control only. Separation via surface steps + gap, not structural borders or glow.
- **Tokens (SSOT)**: `origingame/packages/tokens/tokens.json`, mirrored **one-way** into `web/default/src/products/og-tokens.css` via `bun run tokens:sync` (verify `tokens:check`). Only values cross the boundary — no AGPL source vendoring in either direction.
- **Semantic mapping**: `web/default/src/styles/theme.css` maps `--og-*` (light + `html.dark` warm remap). Product seam: `web/default/src/products/product-tokens.css`.
- **Dark**: portal-parity warm remap; `ThemeSwitch` gated by `ui.darkMode`; `.paper` desk canvas gated by `ui.paperMarketing`.

## Local validation (CI parity)

From repo root:

- **Backend:** `go test ./... -count=1`
- **Frontend:** `cd web && bun install --frozen-lockfile` then `cd default && bun run typecheck && bun run lint && bun run test`
- **Pre-commit:** `bun install` at repo root (enables Husky + lint-staged for staged `*.go` and `web/default/**` files)

GitHub Actions workflow `.github/workflows/ci.yml` runs the same checks on pull requests to `main`.

## Rules

### Rule 1: JSON Package — Use `common/json.go`

All JSON marshal/unmarshal operations MUST use the wrapper functions in `common/json.go`:

- `common.Marshal(v any) ([]byte, error)`
- `common.Unmarshal(data []byte, v any) error`
- `common.UnmarshalJsonStr(data string, v any) error`
- `common.DecodeJson(reader io.Reader, v any) error`
- `common.GetJsonType(data json.RawMessage) string`

Do NOT directly import or call `encoding/json` in business code. These wrappers exist for consistency and future extensibility (e.g., swapping to a faster JSON library).

Note: `json.RawMessage`, `json.Number`, and other type definitions from `encoding/json` may still be referenced as types, but actual marshal/unmarshal calls must go through `common.*`.

### Rule 2: Database Compatibility — SQLite, MySQL >= 5.7.8, PostgreSQL >= 9.6

All database code MUST be fully compatible with all three databases simultaneously.

**Use GORM abstractions:**
- Prefer GORM methods (`Create`, `Find`, `Where`, `Updates`, etc.) over raw SQL.
- Let GORM handle primary key generation — do not use `AUTO_INCREMENT` or `SERIAL` directly.

**When raw SQL is unavoidable:**
- Column quoting differs: PostgreSQL uses `"column"`, MySQL/SQLite uses `` `column` ``.
- Use `commonGroupCol`, `commonKeyCol` variables from `model/main.go` for reserved-word columns like `group` and `key`.
- Boolean values differ: PostgreSQL uses `true`/`false`, MySQL/SQLite uses `1`/`0`. Use `commonTrueVal`/`commonFalseVal`.
- Use `common.UsingPostgreSQL`, `common.UsingSQLite`, `common.UsingMySQL` flags to branch DB-specific logic.

**Forbidden without cross-DB fallback:**
- MySQL-only functions (e.g., `GROUP_CONCAT` without PostgreSQL `STRING_AGG` equivalent)
- PostgreSQL-only operators (e.g., `@>`, `?`, `JSONB` operators)
- `ALTER COLUMN` in SQLite (unsupported — use column-add workaround)
- Database-specific column types without fallback — use `TEXT` instead of `JSONB` for JSON storage

**Migrations:**
- Ensure all migrations work on all three databases.
- For SQLite, use `ALTER TABLE ... ADD COLUMN` instead of `ALTER COLUMN` (see `model/main.go` for patterns).

### Rule 3: Frontend — Prefer Bun

Use `bun` as the preferred package manager and script runner for the frontend (`web/default/` directory):
- `bun install` for dependency installation
- `bun run dev` for development server
- `bun run build` for production build
- `bun run i18n:*` for i18n tooling

### Rule 4: New Channel StreamOptions Support

When implementing a new channel:
- Confirm whether the provider supports `StreamOptions`.
- If supported, add the channel to `streamSupportedChannels`.



### Rule 6: Upstream Relay Request DTOs — Preserve Explicit Zero Values

For request structs that are parsed from client JSON and then re-marshaled to upstream providers (especially relay/convert paths):

- Optional scalar fields MUST use pointer types with `omitempty` (e.g. `*int`, `*uint`, `*float64`, `*bool`), not non-pointer scalars.
- Semantics MUST be:
  - field absent in client JSON => `nil` => omitted on marshal;
  - field explicitly set to zero/false => non-`nil` pointer => must still be sent upstream.
- Avoid using non-pointer scalars with `omitempty` for optional request parameters, because zero values (`0`, `0.0`, `false`) will be silently dropped during marshal.

### Rule 7: Billing Expression System — Read `pkg/billingexpr/expr.md`

When working on tiered/dynamic billing (expression-based pricing), you MUST read `pkg/billingexpr/expr.md` first. It documents the design philosophy, expression language (variables, functions, examples), full system architecture (editor → storage → pre-consume → settlement → log display), token normalization rules (`p`/`c` auto-exclusion), quota conversion, and expression versioning. All code changes to the billing expression system must follow the patterns described in that document.

### Rule 8: Product profile — Origin Gateway + backend dev profile

This monorepo ships **one core**, **one production product**, and one frontend skin. The legacy `youbox` id remains only as a local backend dev profile.

| Profile | `PRODUCT_ID` | Production? | Public default |
| --- | --- | --- | --- |
| **Origin Gateway** | `origingame` (default) | **Yes — BWG only** | `https://api.origingame.dev` |
| Legacy YouBox dev profile | `youbox` | No — local/dev only | (override) |

`origingame` FeatureSet turns off retail/agent surfaces (`agent_desktop`, `rankings`, `playground_presets`, `public_marketing`, `model_plaza`) and keeps **`subscriptions` true** for OriginGame portal billing.

**Source of truth**

| Layer | Path | Responsibility |
| --- | --- | --- |
| Backend profile | `product/` | `PRODUCT_ID`, `FeatureSet`, `PublicBaseURL`, `/api/status` → `data.product` |
| Extension seam | `router/youbox-router.go`, `service/youbox_runtime.go` | Feature-gated routes / init |
| Frontend profile | `web/default/src/products/` | Defaults, `useFeature` / `useProduct`, DOM `data-product` |
| Design tokens | `web/default/src/products/og-tokens.css` (mirror) → `web/default/src/styles/theme.css` (semantic map) | Amp × Arcade values from `origingame/packages/tokens`; sync via `bun run tokens:sync` |
| Consumer contract | `docs/origingame-contract.md` | Frozen OriginGame HTTP surface |

**Hard red lines**

1. **No dual git repos / no second full frontend** for skins.
2. **No `if productID == …` inside** `controller/`, `service/` (except thin product helpers), `relay/`, or shared business features. Conditionals live in `product/`, seams, middleware, or `web/default/src/products/`.
3. **No silent semantic fork** of the same API path per product.
4. **No product-specific migrations on core tables.**
5. **No divergent digests for the same release** — same image; `PRODUCT_ID` selects profile. Dual registry names (`origin-gateway` + legacy `you-box`) may share one digest during migration.
6. **Upstream Calcium-Ion sync** touches core only; preserve seams (`registerYouBoxRoutes`, YouBox runtime init).
7. **Do not break** the OriginGame freeze list in `docs/origingame-contract.md` without coordinated checks.

**Env**

```bash
PRODUCT_ID=origingame                 # default; youbox is a backend-only local dev profile
PRODUCT_PUBLIC_BASE_URL=https://…     # optional override (OpenRouter referer, issuer fallback)
GATEWAY_IMAGE=ghcr.io/fran0220/origin-gateway:<tag>
```

**Status contract:** `GET /api/status` includes nested `data.product` `{ id, display_name, public_base_url, features }`.

**Details:** `docs/product-profile.md`, deploy: `docs/deploy.md`.
