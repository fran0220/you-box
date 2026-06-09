# Step 17 review — profile + personal settings

## Summary of changes

- Check-in calendar: streak chip and check-in day dots → teal tokens.
- Passkey security notice icon → warning token.
- Telegram bind dialog icon tile → info-subtle/info tokens.
- Account card, profile forms, 2FA/passkey cards, language preferences,
  pill tabs, ProfileDropdown (avatar, role, menu, danger sign-out) all
  inherit the YouBox primitives.

## Verification

- `bun run typecheck` — pass.

## Browser review

- `/profile` desktop (`screenshots/step-17/profile.png`) and mobile
  (`screenshots/step-17/profile-mobile.png`).
- Profile dropdown (`screenshots/step-17/profile-dropdown.png`): dark panel, hairline
  ring, danger sign-out item, credit pill in header.
