# Step 5 review — app shell and navigation

## Summary of changes

- Header (console): sticky glass bar — `bg-background/80 backdrop-blur-md`
  with hairline bottom border (YB.navApp).
- AppHeader: added the YouBox credit pill (mono balance, teal status dot,
  pill radius, surface-2) linking to /wallet; hidden below md.
- TopNav links: padded nav__link style — rounded-sm, hover surface-hover,
  active surface-2 + text-foreground.
- SystemBrand (inline): brand-subtle logo tile + display-font bold wordmark
  with tight tracking; dynamic system logo/name preserved.
- PublicHeader: replaced the floating-island scroll morph with the YouBox
  full-width sticky glass marketing nav (hairline border, max-w-7xl inner,
  active link pill, scroll shadow); wordmark in display font.
- SectionPageLayout: page title now display font with -0.025em tracking.
- Sidebar: verified token-driven (ink-900 panel, ink-800 active) — no
  structural change needed.

## Verification

- `bun run typecheck` — pass.
- `bun run build` — pass.

## Browser review

- `/dashboard/overview` desktop (`screenshots/step-05/dashboard.png`): glass header,
  credit pill `$200` with teal dot, sidebar panels correct.
- `/system-settings/site/identity` (`screenshots/step-05/settings-site.png`).
- `/` (`screenshots/step-05/public-home-nav.png`): sticky glass marketing nav, active pill.
- Mobile 375px (`screenshots/step-05/public-home-mobile.png`, `dashboard-mobile.png`):
  compact header, no overflow; nav drawer trigger present.
