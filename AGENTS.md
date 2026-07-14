# AGENTS.md — Project Conventions for new-api

## Overview

This is an AI API gateway/proxy built with Go. It aggregates 40+ upstream AI providers (OpenAI, Claude, Gemini, Azure, AWS Bedrock, etc.) behind a unified API, with user management, billing, rate limiting, and an admin dashboard.

This repository is **YouBox Core only** (API gateway + web console). The legacy Core `electron/` desktop shell has been removed and must not be reintroduced. This repo does not ship or document a desktop client.

**Production scope (2026-07 cutover):** this codebase is deployed **only on BWG** as Origin Gateway (`PRODUCT_ID=origingame`, `api.origingame.dev`).  
**Do not deploy this image to `youbox` / `you-box.com` anymore.** That host is now the **BoxAI** product stack (`fran0220/boxAI`, image `ghcr.io/fran0220/boxai`). Dual-host “youbox + bwg both run you-box” is **retired**. Runtime product skins may still include `youbox` for local/dev demos; production ops target is **BWG only**.

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
  web/default/src/products/ — runtime skins + features (youbox | origingame)
  web/default/src/i18n/ — Frontend internationalization (i18next, zh/en/fr/ru/ja/vi)
```

## Production Deployment

### Hosts (current)

| Role | SSH host | App directory | Compose service / container | Product (`PRODUCT_ID`) | Public domain | Host listen | Reverse proxy |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Only production host for this repo** | `bwg` | `/opt/origin-gateway` | `new-api` / `origin-gateway` | `origingame` | `https://api.origingame.dev/` | `127.0.0.1:9320` | Nginx → `127.0.0.1:9320` |

| Retired for this repo | Notes |
| --- | --- |
| `youbox` (`160.187.1.155`, `you-box.com`) | **No longer runs you-box.** Offlined 2026-07-15 → archive `/opt/you-box.offlined-*`, volume `you-box_pg_data` retained for recovery. Site is **BoxAI**: `/opt/boxAI`, image `ghcr.io/fran0220/boxai`, Nginx → `127.0.0.1:8080`. Ops for that host live in `fran0220/boxAI`. |
| `jpdata` | Previously retired; do not redeploy you-box there. |

Notes:

- Production deploys of **this** repository target **BWG only**.
- Do **not** deploy this product as the shared `api.xiaomao.chat` gateway unless the operator intentionally points that domain at this stack.
- `bwg` is memory-constrained (~2GB). Prefer **pulling a prebuilt image** over building frontend+Go on the host.

### Image strategy (registry, not host-local-only)

Publish immutable versioned images and deploy **BWG** from that image.

Recommended naming:

```text
ghcr.io/fran0220/you-box:<git-tag>     # immutable, e.g. v0.1.7
ghcr.io/fran0220/you-box:main          # optional floating tag for staging experiments
```

CI publish workflow: `.github/workflows/ghcr-publish.yml`  
Ops checklist: `docs/deploy-dual-host.md` (historical dual-host notes; **BWG-only** is the live path)

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
# build once on a capable host (prefer youbox or local CI, not bwg)
docker build -t boxai:v0.1.7 .
docker save boxai:v0.1.7 | gzip > boxai-v0.1.7.tar.gz
# copy archive to the other host, then:
docker load < boxai-v0.1.7.tar.gz
```

Still tag the loaded image with the same version string on both hosts and set `BOXAI_IMAGE` accordingly.

### Deploy on BWG only

```bash
ssh bwg
cd /opt/origin-gateway
# keep host-local docker-compose.yml + .env (container name origin-gateway, port 9320)
# edit .env: BOXAI_IMAGE=… PRODUCT_ID=origingame NODE_NAME=bwg-origin-gateway-1
docker compose pull new-api   # service key is still new-api in compose file
docker compose up -d new-api
docker compose ps
curl -fsS http://127.0.0.1:9320/api/status   # expect data.product.id == "origingame"
```

Hard rules:

1. **Never** delete/recreate persistent volumes (`data/`, postgres volume) during routine deploys.
2. Keep BWG `SESSION_SECRET`, DB password, Redis password, and `NODE_NAME` stable across rollouts.
3. Set `NODE_NAME=bwg-origin-gateway-1` (or similar) so logs/audit identify the node.
4. Production `PRODUCT_ID=origingame`. Optional: `PRODUCT_PUBLIC_BASE_URL=https://api.origingame.dev`.
5. Do **not** deploy this image to `youbox` — that host is BoxAI (`fran0220/boxAI`).
6. Upstream `calciumion/new-api` images are **not** production images for this product (missing frontend/extensions).

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
# on youbox (has more RAM) — last resort
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

## Frontend Design Languages (per product)

One shell and one component tree; **two skins** selected by `PRODUCT_ID` / `html[data-product]`.

### Shared shell rules (both products)

- **One shell**: marketing, docs, console, and admin share `AppShell` (document scroll, sticky header, footer). Public pages without sidebar; console mounts the sidebar slot; admin is a drill-in in the same shell.
- **Catalog pattern**: Model Plaza-style pages use search + facet dropdowns, URL-driven filters, window-virtualized results — no pagination.
- **Auth**: single centered narrow column with brand top-left — no split brand panels.
- **Primitives first**: `web/default/src/components/youbox/` (PageHeader, StatCard, ModelCard, EmptyState, Eyebrow, …).
- **Semantic tokens only**: names live in `styles/theme.css`; product values in skins. Do not hardcode product colors in features.

### YouBox — "Circuit" (`PRODUCT_ID=youbox`, `ui.skin=circuit`)

Modern tech skin: cool slate neutrals, electric violet accent, **sans display** (~620 weight), layered elevation, **light + dark + system**.

| | Light | Dark |
| --- | --- | --- |
| Canvas | `#f6f8fa` | `#0b0e13` |
| Brand | `#4f46e5` | `#818cf8` |
| Display | Hanken Grotesk | same |
| Elevation | soft shadows | border + deep shadow |

- Skin file: `web/default/src/products/skins/youbox.css`
- No cream `.paper` class (`ui.paperMarketing=false`)
- Theme toggle in header (`ThemeSwitch`); `ThemeProvider` respects `ui.darkMode`
- Motion: violet/cyan hero washes; restrained CSS only

### Origin Gateway — "Paper" (`PRODUCT_ID=origingame`, `ui.skin=paper`)

Editorial Amp-style paper (unchanged baseline `:root`): cream marketing `.paper`, green-tinted ink, indigo accent, Instrument Serif display, **light-only**, flat hairlines.

- Teal accent overrides: `web/default/src/products/product-tokens.css`
- `ui.darkMode=false` — dark utilities scoped so Paper cannot activate dark mode

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

### Rule 8: Multi-product profile — Core + runtime skin

This monorepo ships **one core** and **two runtime products** selected by env (not separate repos or full frontend trees).

| Product | `PRODUCT_ID` | Host | Public default |
| --- | --- | --- | --- |
| YouBox | `youbox` | `youbox` | `https://you-box.com` |
| Origin Gateway | `origingame` | `bwg` | `https://api.origingame.dev` |

**Source of truth**

| Layer | Path | Responsibility |
| --- | --- | --- |
| Backend profile | `product/` | `PRODUCT_ID`, `FeatureSet`, `PublicBaseURL`, `/api/status` → `data.product` |
| Extension seam | `router/youbox-router.go`, `service/youbox_runtime.go` | Product-only routes / init; gate with `product.Enabled` / `middleware.RequireFeature` |
| Frontend profile | `web/default/src/products/` | Defaults, `useFeature` / `useProduct`, DOM `data-product`, token CSS |
| Design tokens | `web/default/src/products/product-tokens.css` | Per-product CSS variable overrides only |

**Day-to-day development**

| Change type | Where to work | Extra steps |
| --- | --- | --- |
| Both products (shared) | `features/*`, `controller/`, `service/`, `relay/`, shared components | None — one PR, one image |
| Design / brand only | `product-tokens.css`, optional copy defaults | No business forks |
| A-only or B-only capability | Shared code + one `FeatureSet` key; gate FE with `useFeature` / `productHasFeature`; gate BE on **seams** with `product.Enabled` or `RequireFeature` | Keep keys ≤ ~15; delete when products converge |
| Whole product-only domain (later) | New package under a product module pattern; private tables `og_*` / product-prefixed | Do **not** alter core table semantics |

**Hard red lines (maintenance explosion)**

1. **No dual git repos / no second full frontend** (`web/origingame` clone of `web/default`) while both remain AI-gateway products.
2. **No `if productID == …` inside** `controller/`, `service/` (except thin product helpers), `relay/`, or shared `components/` / `features/*` business logic. Conditionals live in `product/`, seams, middleware, or `web/default/src/products/`.
3. **No silent semantic fork** of the same API path per product. Different behavior → feature gate, new path, or config — not two meanings for one route.
4. **No product-specific migrations on core tables.** Product-private data → prefixed tables + product-scoped migrate later.
5. **No divergent image digests per host** for routine releases. Same tag/digest; `PRODUCT_ID` selects profile. (Dual image tags only if a later phase consciously requires them.)
6. **Upstream Calcium-Ion sync** touches core only; do not put product skins into merge conflict surfaces. Preserve seams (`registerYouBoxRoutes`, YouBox runtime init).

**Env**

```bash
PRODUCT_ID=youbox|origingame          # required per host in production
PRODUCT_PUBLIC_BASE_URL=https://…     # optional override (OpenRouter referer, issuer fallback)
```

**Status contract:** `GET /api/status` includes nested `data.product` `{ id, display_name, public_base_url, features }`. Frontend applies skin from this payload. Prefer the nested key when extending so upstream flat status merges stay clean.

**Details:** `docs/product-profile.md`, dual-host deploy: `docs/deploy-dual-host.md`.
