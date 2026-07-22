# CLAUDE.md — Project Conventions for Origin Gateway

## Overview

This is an AI API gateway/proxy built with Go. It aggregates 40+ upstream AI providers behind a unified API, with user management, billing, rate limiting, and an admin dashboard.

**Product:** **Origin Gateway** — production only on BWG (`PRODUCT_ID=origingame`, `https://api.origingame.dev`). Primary consumer / parent is the OriginGame monorepo (HTTP only; do not vendor AGPL source there). The frontend ships a single design language (OriginGame **Amp × Arcade**), with tokens mirrored one-way from `origingame/packages/tokens`. See root `AGENTS.md` Rule 8 and `docs/product-profile.md`. Do not fork the repo or duplicate `web/default`.

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
  router/youbox-router.go — product extension seam (feature-gated)
controller/    — Request handlers
service/       — Business logic
model/         — Data models and DB access (GORM)
relay/         — AI API relay/proxy with provider adapters
  relay/channel/ — Provider-specific adapters
middleware/    — Auth, rate limiting, CORS, logging, distribution, RequireFeature
product/       — Runtime product profile (PRODUCT_ID, features, public base URL)
setting/       — Configuration management
common/        — Shared utilities
dto/           — Data transfer objects
constant/      — Constants
types/         — Type definitions
i18n/          — Backend internationalization (go-i18n, en/zh)
oauth/         — OAuth provider implementations
pkg/           — Internal packages (cachex, ionet, appusage)
web/default/   — Frontend (React 19, Rsbuild)
  web/default/src/products/ — OriginGame skin + runtime feature resolution
```

## Product profile (summary)

- Env: `PRODUCT_ID=origingame` (default) | `youbox` (local backend dev profile), optional `PRODUCT_PUBLIC_BASE_URL`
- Status: nested `data.product` on `GET /api/status`
- FE: `useFeature` / `useProduct` from `@/products`; tokens via `html[data-product]`
- Gate product-only APIs on seams only; shared bugfixes stay in core
- Frozen OriginGame HTTP surface: `docs/origingame-contract.md`
- Full rules: root `AGENTS.md` Rule 8

## Internationalization (i18n)

### Backend (`i18n/`)
- Library: `nicksnyder/go-i18n/v2`
- Languages: en, zh

### Frontend (`web/default/src/i18n/`)
- Library: `i18next` + `react-i18next` + `i18next-browser-languagedetector`
- Languages: en (base), zh (fallback), fr, ru, ja, vi
- Usage: `useTranslation()` hook, call `t('English key')` in components
- CLI tools: `bun run i18n:sync` (from `web/default/`)

## Frontend Design Language — Amp × Arcade (single skin)

- **Origin Gateway Paper** (`PRODUCT_ID=origingame`): warm parchment (`#f4efe4`), Archivo Black display, Newsreader serif, IBM Plex Mono, arcade-yellow `#ffb100` CTA, 10/6px radii, light + warm dark
- Tokens mirrored one-way from `origingame/packages/tokens/tokens.json` → `web/default/src/products/og-tokens.css` (`bun run tokens:sync` / `tokens:check`); semantic map in `styles/theme.css`. Values only, no AGPL source vendoring.
- Retired: YouBox "Circuit" demo skin (deleted). Non-`origingame` ids resolve to Paper.
- Shared: one `AppShell`, semantic tokens, `components/youbox/*` primitives
- Full rules: root `AGENTS.md` design language + Rule 8

## Rules

### Rule 1: JSON Package — Use `common/json.go`

All JSON marshal/unmarshal operations MUST use the wrapper functions in `common/json.go`. Do NOT directly import or call `encoding/json` in business code.

### Rule 2: Database Compatibility — SQLite, MySQL >= 5.7.8, PostgreSQL >= 9.6

All database code MUST be fully compatible with all three databases simultaneously. Prefer GORM; use `commonGroupCol` / `commonKeyCol` / DB flags when raw SQL is unavoidable.

### Rule 3: Frontend — Prefer Bun

Use `bun` for `web/default/` install, dev, build, and i18n tooling.

### Rule 4: New Channel StreamOptions Support

When implementing a new channel: confirm StreamOptions support; if supported, add to `streamSupportedChannels`.

### Rule 6: Upstream Relay Request DTOs — Preserve Explicit Zero Values

Optional scalar fields on relay request DTOs MUST use pointer types with `omitempty`.

### Rule 7: Billing Expression System — Read `pkg/billingexpr/expr.md`

When working on tiered/dynamic billing, read `pkg/billingexpr/expr.md` first.
