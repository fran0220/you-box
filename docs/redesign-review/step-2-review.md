# Step 2 review — base UI primitives

## Summary of changes (src/components/ui)

- button: YouBox variants — primary hover→brand-hover, secondary surface-2 +
  strong border, ghost surface-hover, new `subtle` (brand-subtle/brand),
  destructive now filled danger; radius md (10px), semibold, 140ms ease-out,
  press scale 0.985.
- badge: mono 11px, radius-sm, subtle semantic fills; added
  success/warning/info variants; default is brand-subtle.
- card: hairline `ring-border`, radius-lg (14px).
- input/textarea/select trigger: field-bg surface, field-border, brand focus
  border + ring, radius-md.
- tabs: pill list on surface-2 with border, active tab = card + shadow-xs;
  line variant active underline is brand.
- table: header mono 11px uppercase on surface-2, row hover surface-hover,
  140ms transitions.
- kbd: mono 10px, surface-2, hairline border.
- skeleton: YouBox shimmer (skeleton-base/highlight, reduced-motion safe).
- progress: surface-3 track.
- alert: semantic subtle variants (brand/success/warning/info/destructive).
- theme.css: bridged border-strong/border-faint/divider tokens.

## Verification

- `bun run typecheck` — pass.

## Browser review

- `/channels` dark (`step-2/channels-dark.png`): mono uppercase table header
  on surface-2 strip, orange create CTA, hairline panels, empty state intact.
- `/profile` dark (`step-2/profile-dark.png`); `/profile` light
  (`step-2/channels-light.png`): warm off-white canvas, white cards, orange
  CTAs, pill tabs correct in both themes.
