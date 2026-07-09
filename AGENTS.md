# AGENTS.md — Project Conventions for new-api

## Overview

This is an AI API gateway/proxy built with Go. It aggregates 40+ upstream AI providers (OpenAI, Claude, Gemini, Azure, AWS Bedrock, etc.) behind a unified API, with user management, billing, rate limiting, and an admin dashboard.

This repository is **YouBox Core only**. The legacy Core `electron/` desktop shell has been removed and must not be reintroduced. Agent desktop lives in the separate `youbox-agent-desktop` repository; see `docs/youbox-agent-desktop-integration-plan.md` and `docs/youbox-agent-upstream-sync.md`.

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
controller/    — Request handlers
service/       — Business logic
model/         — Data models and DB access (GORM)
relay/         — AI API relay/proxy with provider adapters
  relay/channel/ — Provider-specific adapters (openai/, claude/, gemini/, aws/, etc.)
middleware/    — Auth, rate limiting, CORS, logging, distribution
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
  web/default/src/i18n/ — Frontend internationalization (i18next, zh/en/fr/ru/ja/vi)
```

## Production Deployment

YouBox runs on **two production hosts**. They share the same application image lineage but keep **separate compose projects, databases, Redis, volumes, and secrets**. Never treat them as one cluster unless multi-node config (shared DB/Redis/`SESSION_SECRET`) is explicitly designed.

### Hosts

| Role | SSH host | App directory | Compose service / container | Public domain | Host listen | Reverse proxy |
| --- | --- | --- | --- | --- | --- | --- |
| Primary product API | `jpdata` | `/opt/you-box` | `new-api` / `new-api` | `https://api.you-box.com/` | `0.0.0.0:3000` | Nginx → `127.0.0.1:3000` |
| Secondary gateway | `bwg` | `/opt/origin-gateway` | `new-api` / `origin-gateway` | `https://api.origingame.dev/` | `127.0.0.1:9320` | Nginx → `127.0.0.1:9320` |

Notes:

- `jpdata` is the main YouBox product deployment (`api.you-box.com`).
- `bwg` runs the same YouBox/new-api codebase as a second deployment (`api.origingame.dev`). It is **not** the same DB as jpdata.
- Do **not** deploy this product as the shared `api.xiaomao.chat` gateway unless the operator intentionally points that domain at this stack.
- `bwg` is memory-constrained (~2GB). Prefer **pulling a prebuilt image** over building frontend+Go on the host.

### Image strategy (registry, not host-local-only)

Historical local tags such as `boxai:jpdata` may still exist on hosts. Going forward, publish immutable versioned images to a registry and deploy both hosts from that image.

Recommended naming:

```text
ghcr.io/fran0220/you-box:<git-tag>     # immutable, e.g. v0.1.7
ghcr.io/fran0220/you-box:main          # optional floating tag for staging experiments
```

CI publish workflow: `.github/workflows/ghcr-publish.yml`  
Dual-host checklist: `docs/deploy-dual-host.md`

Local/dev still uses:

```text
boxai:local                            # docker-compose.yml default via BOXAI_IMAGE
```

Compose selects the image with:

```bash
BOXAI_IMAGE=ghcr.io/fran0220/you-box:v0.1.7
```

(or host `.env` equivalent). Do not rebuild different images per host for the same release; both hosts should pull the **same digest**.

### Build / publish (once per release)

From a builder machine or CI (linux/amd64 is required for both current hosts):

```bash
# 1) freeze version
git checkout main
git pull
# set VERSION file / git tag, e.g. v0.1.7

# 2) build and push
docker buildx build \
  --platform linux/amd64 \
  -t ghcr.io/fran0220/you-box:v0.1.7 \
  -t ghcr.io/fran0220/you-box:main \
  --push \
  .
```

Until GHCR (or another private registry) credentials/workflows are wired, an interim fallback is:

```bash
# build once on a capable host (prefer jpdata or local CI, not bwg)
docker build -t boxai:v0.1.7 .
docker save boxai:v0.1.7 | gzip > boxai-v0.1.7.tar.gz
# copy archive to the other host, then:
docker load < boxai-v0.1.7.tar.gz
```

Still tag the loaded image with the same version string on both hosts and set `BOXAI_IMAGE` accordingly.

### Deploy on each host (same image, separate data)

For **jpdata**:

```bash
ssh jpdata
cd /opt/you-box
git fetch && git checkout <release-commit-or-tag>   # keep compose/env in sync
# edit .env: BOXAI_IMAGE=ghcr.io/fran0220/you-box:v0.1.7
docker compose pull new-api   # or docker pull $BOXAI_IMAGE
docker compose up -d new-api
# do NOT recreate postgres/redis volumes
docker compose ps
curl -fsS http://127.0.0.1:3000/api/status
```

For **bwg**:

```bash
ssh bwg
cd /opt/origin-gateway
# keep host-local docker-compose.yml + .env (container name origin-gateway, port 9320)
# edit .env: BOXAI_IMAGE=ghcr.io/fran0220/you-box:v0.1.7
docker compose pull new-api   # service key is still new-api in compose file
docker compose up -d new-api
docker compose ps
curl -fsS http://127.0.0.1:9320/api/status
```

Hard rules:

1. **Never** delete/recreate persistent volumes (`data/`, postgres volume) during routine deploys.
2. Keep each host’s `SESSION_SECRET`, DB password, Redis password, and `NODE_NAME` distinct unless deliberately running a shared multi-node cluster.
3. Set `NODE_NAME` per host (examples: `jpdata-youbox-1`, `bwg-origin-gateway-1`) so logs/audit can tell nodes apart.
4. Roll out **jpdata first** for product changes; roll out **bwg** after smoke checks, unless the release is bwg-specific.
5. Upstream `calciumion/new-api` images are **not** production images for YouBox (missing YouBox frontend/extensions).

### Local development

```bash
# repo root
docker compose build new-api
docker compose up -d
# default image: boxai:local  (override with BOXAI_IMAGE)
```

### Temporary host-local rebuild (emergency only)

If the registry is unavailable:

```bash
# on jpdata (has more RAM) — last resort
cd /opt/you-box
docker compose build new-api
docker compose up -d new-api
```

Avoid routine builds on `bwg`.

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

## Frontend Design Language — "Paper" (Amp-style)

The default web theme (`web/default/`) follows a restrained, editorial design language inspired by Amp's paper aesthetic. All new or reworked UI must follow it:

- **One shell**: marketing site, docs, user console, and admin share a single `AppShell` (document-level scroll, sticky header, footer). Public pages render without a sidebar; authenticated console pages mount the sidebar slot; admin is a drill-in view inside the same shell. Never build a page that feels like a second site.
- **Paper surface**: a light, warm "paper" background is the default. Content sits directly on the page; avoid heavy cards, drop shadows, and gradients. Use hairline borders and dividers (`border-border/70`) to delimit content.
- **Typography carries hierarchy**: serif display face (`font-display`, normal weight) for headings; mono uppercase micro-labels (`yb-eyebrow`) for eyebrows, section labels, and metadata; sans for body. Numeric data uses `tabular-nums`.
- **Restraint over decoration**: color is reserved for brand accents and state. Animation is CSS-only, slow, and subtle (drifting washes, fade-up in view) — never attention-grabbing motion.
- **Editorial layout**: generous whitespace, left-aligned content, constrained prose measures, hairline-grid lists (provider wall, modality rows) over card walls where possible.
- **Catalog pattern**: list/grid pages (e.g., Model Plaza) use a search input plus one facet dropdown per major dimension, URL-driven filters, and window-virtualized results — no pagination.
- **Auth pages**: a single centered narrow column on paper with the brand top-left — no split/two-column brand panels.
- **Reusable primitives first**: prefer `web/default/src/components/youbox/` (PageHeader, Panel, Metric, SettingRow, EmptyState, Eyebrow) over bespoke markup.

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
