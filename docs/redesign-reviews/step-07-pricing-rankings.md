# Step 7 review — pricing, model details, rankings

## Summary of changes

- /pricing: blue/violet mesh replaced by single brand glow; header now
  `// model-count` eyebrow + display-font title; model count surfaced in the
  eyebrow per the YouBox numbers convention.
- ModelCard: YouBox mcard hover behavior — hairline border to brand-border,
  glow-brand shadow, -2px lift (motion-safe), surface-card fill; warning
  text token instead of amber hardcode.
- Model details: capability tiles hover teal; dynamic pricing breakdown
  badges → info/teal subtle tokens.
- /rankings: brand glow backdrop, display-font title, period tabs underline
  in brand orange, pulse section success token.
- Filter chips/pills, toolbar toggles, tables all inherit Step 2 primitives.

## Verification

- `bun run typecheck` — pass.
- `bun run i18n:sync` — clean.

## Browser review

- `/pricing?view=card` (`screenshots/step-07/pricing-card.png`), `/pricing?view=table`
  (`screenshots/step-07/pricing-table.png`): header, sidebar filters, toolbar, empty
  states correct (no models seeded in dev DB).
- `/rankings` (`screenshots/step-07/rankings.png`): brand underline tabs, panel sections,
  mono unit labels, empty data states correct.

## Known limitation

- Dev DB has no seeded models/usage, so populated model cards, provider
  tables, and ranking rows will be re-verified in the Step 18 acceptance
  pass with seeded data.
