# Step 16 review — system settings (all groups)

## Summary of changes

- Info callouts in payment/waffo integration sections: blue hardcodes →
  info-subtle panels with mono inline code on surface-2.
- Announcements type indicator dot → info token.
- API info color options (purple/indigo/violet…) left as data values —
  they map through StatusBadge variants which resolve to chart tokens.
- Settings shell verified per SCREENS.settings: left rail tree nav, page
  actions (reset / brand save), panel sections, field surfaces, switches,
  JSON editors — all inherited from Steps 1–4 primitives.
- Billing expression system untouched (no changes to pkg/billingexpr
  surface; per project rule it must be read before modifying that UI).

## Verification

- `bun run typecheck` — pass.
- `bun run i18n:sync` — clean.

## Browser review (screenshots/step-16/)

- site (identity), auth (registration), billing (quota — danger-subtle
  compliance alert, orange switch, brand save), content (announcements),
  models (routing), operations (redis), security (rate limiting — rail,
  group rate cards, JSON mode toggle): all on the YouBox shell.
