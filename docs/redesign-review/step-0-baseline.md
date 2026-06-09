# Step 0 — Redesign baseline record

Branch: `redesign/youbox-frontend-100`
Date: 2026-06-10

## Verification baseline

- `bun run typecheck` (web/default): **1 pre-existing error**
  - `src/components/ai-elements/code-block.tsx(30,30): error TS2307: Cannot find module 'hast' or its corresponding type declarations.`
  - Recorded as the pre-redesign baseline; to be resolved during the redesign steps so later gates can pass cleanly.
- Backend `go build`: OK (with dev-only stub `web/*/dist/index.html`, gitignored).

## Local review environment

- Backend: `/tmp/youbox-server` with `SQLITE_PATH=/tmp/youbox-dev/youbox.db`, port 3000, root user `root` initialized via `/api/setup`.
- Frontend: `bunx rsbuild dev --port 5173` in `web/default` (proxies `/api` to :3000).
- Browser review: `agent-browser` (Chromium), viewport 1440×900 desktop.

## Route inventory (from `web/default/src/routes`)

### Public / marketing
- `/` (Home), `/about/`, `/pricing/`, `/pricing/$modelId/`, `/rankings/`,
  `/privacy-policy`, `/user-agreement`, `/oauth/$provider`

### Auth
- `/sign-in`, `/sign-up`, `/register`, `/forgot-password`, `/reset`,
  `/user/reset`, `/otp`, `/oauth`

### Errors
- `/401`, `/403`, `/404`, `/500`, `/503`, `/_authenticated/errors/$error`,
  root `notFoundComponent` / `errorComponent`

### Setup
- `/setup/`

### Console (authenticated)
- `/dashboard/$section` (+ index redirect), `/keys/`, `/wallet/`, `/profile/`,
  `/playground/`, `/chat/$chatId`, `/chat2link`, `/usage-logs/$section` (+ index)

### Admin
- `/channels/`, `/users/`, `/redemption-codes/`, `/subscriptions/`,
  `/models/$section` (+ index)
- `/system-settings/{site,auth,billing,content,models,operations,security}/$section` (+ indexes)

### Compatibility redirects
- `/console/log` → `/usage-logs`, `/console/topup` → `/wallet?show_history=true`

## Before screenshots (`docs/redesign-review/before/`)

Public: home, about, pricing, rankings, sign-in, sign-up, forgot, privacy, notfound.
Console: dashboard, keys, wallet, profile, playground, usage-logs, channels,
users, redemptions, subscriptions, models-metadata, settings-site, settings-auth.
All desktop 1440×900.
