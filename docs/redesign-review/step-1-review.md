# Step 1 review — YouBox tokens + global theme foundation

## Summary of changes

- `src/styles/theme.css`: rewritten around the YouBox token source
  (`youboxdesign/ds/tokens`). Raw orange/teal/ink ramps live in `:root`;
  semantic aliases map light (`:root`) and dark (`.dark`), dark being the
  brand's home theme. shadcn semantic names (`--primary`, `--card`, …) now
  resolve to YouBox values; added the YouBox brand layer (`--brand`,
  `--teal`, `--surface-*`, `--field-*`, `--code-*`, shadows, glows, motion
  tokens) with Tailwind bridges (`--color-brand`, `--font-display`, etc.).
- Radius scale fixed to YouBox values (xs 4 / sm 6 / md 10 / lg 14 / xl 20 /
  2xl 28).
- `src/styles/theme-presets.css`: legacy color presets, radius axis, and
  serif font axis frozen (removed); kept non-brand density scale and
  centered-content axes.
- Fonts: Space Grotesk (display), Hanken Grotesk (UI/body), JetBrains Mono
  (mono) via @fontsource-variable; removed Public Sans and Lora. Headings and
  dialog/card title slots default to the display face with tight tracking.
- Added `yb-eyebrow` utility (mono uppercase brand label).
- Default theme switched to dark (`theme-provider.tsx`).
- Fixed baseline typecheck error by adding `@types/hast`.

## Verification

- `bun run typecheck` — pass (baseline error resolved).
- `bun run build` — pass.

## Browser review

- `/` (`step-1/home.png`): near-black warm ink canvas, orange primary CTAs.
  Hero's old purple gradient headline remains — Step 5 scope (home feature).
- `/sign-in` (`step-1/sign-in.png`): dark canvas, orange submit, field
  surfaces correct.
- `/dashboard/overview` (`step-1/dashboard.png`): console renders without
  layout breakage; orange accents active.

## Known issues carried forward (by plan order)

- Old logo/brand visuals (multicolor mark) — Step 4/5.
- Home hero gradient text + old marketing sections — Step 5.
- Component-level visuals (buttons radius/press states, tables, tabs) — Steps 2–3.
