# BoxAI Web (default frontend)

The default frontend for the BoxAI AI API gateway. It is a single-page React
application that serves the public marketing/catalog surfaces (home, Model
Plaza, rankings, apps, API docs, about, legal) and the authenticated console
(dashboard, keys, channels, usage logs, wallet, chat, playground, settings,
and more) from one unified app shell.

## Overview

- **Framework**: React 19 + TypeScript
- **Bundler / dev server**: Rsbuild (Rspack), config in `rsbuild.config.ts`
- **UI**: YouBox monochrome design system (tokens in `src/styles/theme.css`),
  reskinned `src/components/ui/*` primitives, high-level `src/components/youbox/*`
  compositions, Base UI + Tailwind CSS v4, `cn()` for class merging
- **Routing**: TanStack Router (file-based routes under `src/routes`, search
  params validated with Zod)
- **Data**: TanStack Query + axios (`@/lib/api`), Zustand for client state
- **i18n**: i18next + react-i18next + browser language detector
- **Package manager**: Bun

Feature code lives under `src/features/<feature>/` (home, pricing, rankings,
apps, api-docs, about, legal, auth, wallet, chat, dashboard, keys, channels,
usage-logs, playground, system-settings, etc.). Shared components live under
`src/components/`, shared utilities under `src/lib/`, stores under
`src/stores/`.

## Layout Architecture

All routed pages render through a single shell, `AppShell`
(`src/components/layout/components/app-shell.tsx`), which has two variants:

- **`public`**: stacked column with the public `Header` (brand, top nav,
  language switcher, theme switch, auth buttons), the page content, and the
  shared `Footer`.
- **`app`**: authenticated console layout with the app `Header` (search,
  quota pill, notifications, config drawer, profile), a collapsible
  `AppSidebar`, and a scroll-managed `SidebarInset`. No footer by default.

Content is wrapped by `AppShellContent`
(`app-shell-content.tsx`), which supports three modes:

- **`standard`** (default): centered `max-w-7xl` `<main>` with section padding
  (`mx-auto w-full max-w-7xl px-4 py-6 md:px-6`), used by marketing/docs-style
  pages.
- **`fluid`**: full-width `Main` column. Authenticated section pages compose
  `SectionPageLayout` (`section-page-layout.tsx`) inside this mode, which
  provides a sticky title/actions/breadcrumb header, a scrollable content
  region, and a slot-based page footer.
- **`bare`**: full-viewport-height container with no padding, used by the home
  sections, chat, and playground.

The standardized `max-w-7xl` content box and the shared `Footer` (also
`max-w-7xl`) are aligned so public pages share a single content width.

The app header height is published as the `--app-header-height` CSS variable,
which downstream layouts use for sticky offsets and viewport-height math (for
example the sidebar inset height and the Model Plaza sticky control strip and
sidebar).

Two surfaces use their own dedicated shells instead of `AppShell`:

- **`AuthLayout`** (`src/features/auth/auth-layout.tsx`): split sign-in layout
  with a form column and a brand side panel.
- **`ErrorPageShell`** (`src/features/errors/error-page-shell.tsx`): centered
  brand-glow canvas for error/forbidden/maintenance/not-found pages.

## Model Plaza (`/pricing`)

The Model Plaza is the public model catalog, implemented in
`src/features/pricing`. It renders inside `AppShell variant="public"`.

- **Real data only**: the catalog is loaded from the backend `GET /api/pricing`
  endpoint (`src/features/pricing/api.ts`). There is no mock/fixture data.
- **Filters**: vendor (provider) and model-type filters, plus groups,
  categories, endpoint types, quota types, and a prompt-price range whose
  ceiling adapts to the live catalog. Filters are exposed both in the sidebar
  and the toolbar, which share one facet contract.
- **URL-synced state**: search, sort, providers, modelTypes, groups,
  categories, endpointTypes, quotaTypes, price range, token unit
  (`M`/`K`), view mode (`list` / `card` / `table`), and recharge-price toggle
  are validated and round-tripped through the route search params (see
  `src/routes/pricing/index.tsx`).
- **Views**: dense virtualized list (default), card grid, and table.
- **Sticky control strip**: the search + toolbar + active-filter pills sit in a
  strip pinned just below the header via
  `top-[var(--app-header-height,3rem)]`.
- **Detail and compare routes**: `/pricing/$modelId`
  (`src/routes/pricing/$modelId`) for a single model, and `/pricing/compare`
  (`src/routes/pricing/compare.tsx`) for side-by-side comparison.

## Development

Run all commands from `web/default/`.

```bash
bun install        # install dependencies
bun run dev        # start the Rsbuild dev server
bun run build      # production build to dist/
bun run typecheck  # tsc -b
bun run lint       # eslint .
bun run test       # vitest run --passWithNoTests
bun run knip       # unused files/deps audit (cleanup gate)
```

In development, `/design-lab` is an acceptance gallery for UI primitives and
YouBox compositions (`import.meta.env.DEV` only). Theme is class-based
(`.dark` default) via `src/context/theme-provider.tsx` (not `next-themes`).
User-adjustable layout prefs are density and content width only
(`theme-presets.css`).

`bun run dev` starts the Rsbuild dev server, which proxies backend paths
(`/api`, `/api/*`, `/mj`, `/mj/*`, `/pg`, `/pg/*`) to the Go backend. The
target defaults to the production API at `https://api.you-box.com` for
frontend-only debugging. Override with `VITE_REACT_APP_SERVER_URL`, for example
`VITE_REACT_APP_SERVER_URL=http://localhost:3000 bun run dev`, when testing a
local backend (see `rsbuild.config.ts`).

## Internationalization

Translations use i18next + react-i18next. Locale files live in
`src/i18n/locales/` as flat JSON keyed by English source strings, covering
`en` (base), `zh`, `fr`, `ru`, `ja`, and `vi`. In components, call
`t('English key')` from the `useTranslation()` hook.

```bash
bun run i18n:sync  # sync/normalize locale files (scripts/sync-i18n.mjs)
```
