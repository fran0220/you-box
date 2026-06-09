# Step 8 review — setup wizard + error pages

## Summary of changes

- New shared `ErrorPageShell` (features/errors/error-page-shell.tsx):
  centered brand glow, brand-subtle icon tile, 96px display-font code,
  display title, semantic description, action row, mono footnote.
- 401/403/404/500/503 refactored onto the shell with per-page icons
  (KeyRound/ShieldOff/Compass/ServerCrash/Wrench) and their original
  i18n copy and actions; GeneralError keeps `minimal` mode and the
  GitHub Issues feedback link (attribution preserved).
- Route-level error/notFound fallbacks render these same components.
- Setup wizard: ink canvas + brand glow header backdrop, display-font
  title and card title, mono step numbers; stepper states already
  brand-token driven.

## Verification

- `bun run typecheck` — pass.
- `bun run i18n:sync` — clean.

## Browser review

- `/404` (`step-8/404.png`): glow, icon tile, display code — per
  SCREENS.error404.
- `/500` (`step-8/500.png`), unknown route fallback
  (`step-8/route-notfound.png`).
- `/setup` not reachable (instance already initialized) — changes are
  class-level and typechecked; re-verify on a fresh DB if needed.
