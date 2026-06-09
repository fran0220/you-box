# Step 5 review — marketing home + public content pages

## Summary of changes

- Hero: removed blue/violet radial mesh + grid pattern in favor of the single
  YouBox brand glow; pill badge → `// eyebrow`; headline in display font with
  brand-orange payoff line (gradient text removed).
- Terminal demo: accent tones remapped to brand/teal/info/warning tokens
  (no more emerald/blue/violet hardcodes).
- Stats ticker: display-font numbers + mono uppercase labels.
- Features: eyebrow section label, brand/teal/semantic icon colors, mono
  number tiles, brand-subtle icon tiles.
- How it works: brand-subtle icon tiles, brand mono step number badges.
- CTA: brand-bordered panel with glow-soft, brand payoff line, secondary
  button (gradient mesh removed); hidden when authenticated (unchanged).
- Footer: display-font wordmark, mono uppercase column titles. All New API /
  QuantumNous attributions untouched (protected).
- Legal pages: eyebrow + display title + document surface panel.
- About + custom homepage Markdown: wrapped in YouBox document surface.

## Verification

- `bun run typecheck` — pass.
- `bun run i18n:sync` — clean (0 missing/untranslated across locales).

## Browser review

- `/` (`step-5/home.png`, `home-features.png`, `home-cta.png`): hero, stats,
  features, how-it-works, footer all on the YouBox system.
- `/about` (`step-5/about.png`), `/privacy-policy` (`step-5/privacy.png`).
