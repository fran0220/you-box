# Step 19 review — 100% route acceptance + cleanup

## Summary

- Walked every route in the plan's coverage list with the browser
  (45 screenshots in `docs/redesign-reviews/screenshots/step-19/`): public/marketing,
  auth (logged-out), errors, console, admin, all seven system-settings
  groups, and compatibility redirects.
- Mid-sweep finding: backend web rate limiting (429) invalidated the
  session and several protected captures landed on /sign-in — re-ran the
  protected segment with rate limits disabled in the dev backend and
  verified every page logged-in.
- Completed the final acceptance matrix
  (`final-acceptance-matrix.md`) — all routes `pass`; data-dependent
  variants marked `pass*` with rationale.
- Cleanup: removed unused `theme-quick-switcher.tsx` (no imports);
  earlier steps already removed dead preset pickers and glass utilities.
  The theme-customization provider remains as a frozen no-op for cookie
  compatibility (CSS axes removed in Step 1).

## Final gates

- `bun run typecheck` — pass
- `bun run lint` — 0 new errors (99 pre-existing react-hooks behavioral
  findings documented in step-17)
- `bun run i18n:sync` — clean
- `bun run build` — pass
