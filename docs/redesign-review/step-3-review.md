# Step 3 review — overlays and interactive containers

## Summary of changes

- Unified overlay borders: `ring-foreground/10` → hairline `ring-border` in
  dialog, alert-dialog, popover, hover-card, dropdown-menu, context-menu,
  menubar, combobox, navigation-menu (select done in Step 2).
- Overlay scrims now use the YouBox `--overlay` token (deep warm ink @72%
  dark / 45% light) in dialog, alert-dialog, sheet, drawer.
- Sheet/Drawer panels moved from `bg-background` to `bg-card` (surface-card
  panel system).
- Tooltip is now a fixed dark panel (ink-800 + hairline ring) in both themes;
  kbd-inside-tooltip restyled to match.
- CommandMenu: field-styled search input (field-bg/field-border, radius-md),
  selected item uses surface-3.
- ConfigDrawer: removed the dead color-preset / font / radius pickers (axes
  frozen in Step 1); kept theme, density, sidebar, layout, content width,
  direction.
- Confirm dialog destructive action now renders the filled danger button
  (Step 2 button change).

## Verification

- `bun run typecheck` — pass.

## Browser review

- Command menu (`step-3/command-menu.png`): overlay scrim, dark panel,
  field-styled input, selected row highlight.
- Config drawer (`step-3/config-drawer.png`): pruned sections, orange checks.
- Notification popover (`step-3/notifications.png`): dark panel, pill tabs,
  empty state, brand action.
