# Step 12 review — usage logs, notifications, performance

## Summary of changes

- Usage logs stat chips (Usage / RPM / TPM) accents → brand / teal / info
  tokens (were sky / rose / slate hardcodes).
- Log row tints: refund → info-subtle, error → danger-subtle (table and
  mobile cards); stream/success column chips → teal-subtle.
- Details dialog: success/error value colors → success/destructive tokens;
  local/cloud icons → info/teal.
- NotificationPopover verified token-driven in Step 3 (dark panel, pill
  tabs, semantic icon tiles).
- performance-metrics components audited: no off-brand colors; panels and
  numbers inherit primitives.

## Verification

- `bun run typecheck` — pass.

## Browser review

- `/usage-logs/common` (`step-12/common.png`): filter bar field surfaces,
  brand search button, mono uppercase table header, tokenized stat chips,
  empty state.
- `/usage-logs/drawing` (`step-12/drawing.png`), `/usage-logs/task`
  (`step-12/task.png`).
