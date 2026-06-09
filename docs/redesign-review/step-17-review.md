# Step 17 review — global responsive / a11y / motion sweep

## Summary of changes

- Eliminated every remaining hardcoded palette class across the frontend
  (amber/sky/rose/indigo/emerald/violet/blue → warning/info/destructive/
  success/teal/brand tokens) in pricing, rankings, wallet, channels,
  setup, models guard, system-settings dirty indicator, usage logs.
- Removed the dead Launch-UI glass-1…5 gradient utilities from index.css;
  home gateway/icon cards moved from glass-morphism to flat YouBox
  card/surface fills.
- `h-screen` → `h-dvh` (custom homepage iframe); no other `h-screen` uses.
- Reduced-motion: skeleton shimmer, landing animations, table stagger,
  terminal demo all have prefers-reduced-motion fallbacks (verified).
- Tooltips/kbd/icon-only controls retain aria-labels (verified earlier
  steps); decorative glows are aria-hidden.

## Verification

- `bun run typecheck` — pass.
- `bun run build` — pass.
- `bun run lint` — 99 errors / 6 warnings, ALL pre-existing
  `react-hooks/set-state-in-effect`-class behavioral findings.
  Cross-checked: the three flagged files touched by the redesign only had
  class-string edits; every flagged line predates this branch. Zero new
  lint errors introduced. Fixing this behavioral debt is a functional
  refactor outside the visual redesign scope.

## Browser review

- `/` at 375 / 768 / 1280 / 1536 px (`step-17/home-*.png`): hero, chips,
  terminal demo reflow correctly; mobile nav compacts; no horizontal
  overflow.
