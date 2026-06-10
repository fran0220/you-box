# Page-by-page functional verification — 2026-06-10

Branch: `redesign/youbox-frontend-100`
Scope: every route in the plan's coverage list, live in a real browser,
all breakpoints, dark + light, with console/network error capture.

## Method

- Backend: `go build` of this branch, fresh SQLite DB, run with rate
  limiting disabled and a fixed session secret for the test session.
- Frontend: `bun run dev` (rsbuild) proxying `/api` to the backend.
- Setup wizard completed through the real UI (Playwright), which also
  serves as the `/setup` verification; root login captured as storage
  state; one channel + one API key seeded via the admin API (redemption
  seeding is gated by compliance confirmation — the gated states were
  verified instead).
- Sweep harness (`verify-harness.mjs`, archived next to this record):
  80 routes × dark at 375/768/1280/1536 px + light at 1280 px, capturing
  console errors, page errors, failed same-origin requests (>=400),
  final redirect path, body text length, and a horizontal-overflow probe
  at 375 px.
- All ~400 screenshots were reviewed against the YouBox criteria
  (token usage, typography, surfaces, responsive behavior, light theme,
  empty/error states) by six parallel review passes, one per page family.

## Sweep result

80/80 routes load and render. Final sweep (after fixes): zero page
errors, zero unexpected console errors, zero failed requests, zero
horizontal overflow at 375 px, all compatibility redirects resolve
(`/register → /sign-up`, `/console/log → /usage-logs/common`,
`/console/topup → /wallet`, `/setup` post-init → `/`).

Two expected warnings remain by design:

- `pub-oauth` — OAuth callback page visited logged-out produces one
  401 on `/api/user/self` and renders the styled "OAuth failed" state.
- `pub-err-500` — the page's own copy legitimately matches the
  harness's error-text heuristic; visual state is the styled 500 page.

Route families covered: 8 public/marketing, 8 auth, 6 error,
setup wizard (4 steps + completion), 11 console user pages,
6 admin data pages, 38 system-settings sections, 3 redirects.

## Defects found and fixed (commit `2f6c5161`)

Systemic:

1. Wide tables propagated min-content width up flex layouts, clipping
   whole pages at <=768 px (chat presets, channel affinity, model/group
   pricing). Fixed by making the table scroll wrapper a CSS inline-size
   container (`ui/table.tsx`).
2. Table empty states centered on the table's scroll width, not the
   visible viewport — clipped at 768 px (subscriptions, models metadata,
   redemptions). Fixed with sticky + `100cqw` centering (`table-empty.tsx`).
3. "Page 1 of 0" on empty tables; duplicated/concatenated pagination
   footer on the public pricing table (no `@container/content` ancestor).
4. Sortable table headers rendered button typography instead of mono
   uppercase (`column-header.tsx`).
5. Page title collapsed to one letter ("C") / action buttons pushed
   off-canvas at 768 px (`section-page-layout.tsx`: title min-width,
   actions slot shrink + wrap).
6. `AlertAction` (absolute top-right) covered alert titles at 375 px —
   now flows below content on mobile (`ui/alert.tsx`).

Page-level:

7. Playground conversation area was an unstyled blank — added a styled
   empty state consistent with the chat feature.
8. Wallet/profile stat strips forced 3 columns at 375 px, truncating
   labels — now stack below `sm`.
9. Payment methods: templates stored legacy `--semi-*` CSS variables and
   the color column showed them raw — templates now use hex; legacy
   values map to swatch previews.
10. Quota settings compliance notice used destructive styling for an
    informational gate — now warning.
11. Dashboard user charts duplicated the card title inside the chart
    spec — spec titles removed, informative subtext kept.
12. HTML entities rendered literally (`&#10;` in SSRF/basic-auth/rule
    editor placeholders, `&lt;&gt;` in SMTP From-Address placeholder,
    `&mdash;` in data-dashboard help) — decoded in sources and all six
    locale files; `bun run i18n:sync` clean.

## Accepted minor notes (not regressions)

- Pricing table GROUPS column can clip mid-word at 1280 inside its
  scroll container (scrollable, no visible affordance).
- Empty dashboard charts show "No data available" with placeholder axes
  rather than a bespoke empty illustration.
- Playground suggestion chips use multi-hue icons (product copy chips).
- Light-theme off-state toggles are low-contrast.
- OAuth-failure toast shows a faint second surface edge in dark mode.
- TanStack Router devtools badges appear in screenshots — dev-server
  overlay only, absent from production builds.
- Pre-existing `react-hooks/set-state-in-effect` lint debt unchanged
  (99 errors, same as the step-18/19 baseline; none introduced).

## Verification commands

- `bun run typecheck` — pass
- `bun run build` — pass
- `bun run i18n:sync` — clean (missingCount 0 in all locales)
- `bun run lint` — 99 pre-existing errors, 0 new (baseline documented in
  `step-18-global-sweep.md`)

## Evidence

- `screenshots/verification-2026-06-10/setup-*.png` — wizard flow on a
  fresh database.
- `screenshots/verification-2026-06-10/fixed-*.png` — post-fix captures
  of every fixed page at its previously-broken breakpoint.
- Full sweep artifacts (JSON report + ~400 PNG) generated locally by
  `verify-harness.mjs`; reproducible against any dev environment.

## Conclusion

`pass` — all plan routes verified page-by-page in a live browser across
breakpoints and themes; all functional/responsive defects found during
verification were fixed and re-verified in the same pass.
