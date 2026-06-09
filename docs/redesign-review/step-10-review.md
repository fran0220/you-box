# Step 10 review — API keys + wallet

## Summary of changes

- Keys: enable/disable row action recolored to the success token; group
  combobox badges to teal/info subtle tokens; usage progress indicator to
  the success token. Table, drawer, dialogs, masked key display inherit the
  Step 2/3 primitives (field surfaces, dark scrim, brand focus ring).
- Wallet: stats card labels now mono 11px uppercase (values were already
  mono tabular); balance hero, top-up panel, affiliate panel on YouBox
  panels; amounts mono.

## Verification

- `bun run typecheck` — pass.

## Browser review

- `/keys` (`step-10/keys.png`) and create-key drawer
  (`step-10/keys-create.png`): dark panel sheet, brand-focused name field,
  orange unlimited-quota switch, quick-expiry chip buttons.
- `/wallet` (`step-10/wallet.png`): mono balance stats strip, add-funds
  panel with disabled-state notices, affiliate panel with mono link field.

## Known limitation

- Online top-up flows disabled in dev (no payment providers configured);
  visual states verified, transactional flows re-checked at Step 18.
