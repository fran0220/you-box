# Step 13 review — admin data pages

## Summary of changes

- Channels: enable/disable row action → success token; param-override
  editor chips → brand-subtle / info-subtle tokens.
- Users: quota progress indicator thresholds → destructive/success tokens.
- Subscriptions: positive amounts → success token.
- StatusBadge/GroupBadge named variants verified to route through chart/
  semantic tokens (no hex hardcodes).
- DataTable toolbar, faceted filters, pagination, bulk actions, mobile
  cards inherit the Step 2 primitives across all four pages.

## Verification

- `bun run typecheck` — pass.

## Browser review

- `/channels` (`step-13/channels.png`) + create drawer
  (`step-13/channel-create.png`): dark panel drawer, field surfaces, brand
  focus ring, orange enabled switch, section icon tiles.
- `/users` (`step-13/users.png`), `/redemption-codes`
  (`step-13/redemptions.png`), `/subscriptions`
  (`step-13/subscriptions.png`): consistent table shells and empty states.
