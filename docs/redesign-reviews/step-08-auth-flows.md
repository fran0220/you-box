# Step 8 review — auth flows

## Summary of changes

- AuthLayout rebuilt as the YouBox split shell (SCREENS.signIn/signUp):
  left form column (max-w 420px), right brand side panel — surface-card,
  hairline left border, brand glow, `// eyebrow`, display-font value prop,
  mono platform stats. Panel hides below lg leaving the single card.
  Dynamic system logo/name preserved; brand tile uses brand-subtle.
- Sign-in / sign-up / forgot-password / reset / OTP / OAuth callback
  headings now display-font 28px bold with tight tracking.
- Field-level errors confirmed (react-hook-form FormMessage on fields).
- OAuth buttons, password toggle, terms footer inherit Step 2 primitives.

## Verification

- `bun run typecheck` — pass.

## Browser review

- `/sign-in` (`screenshots/step-08/sign-in.png`): split layout, glass form fields, orange
  CTA, side panel stats.
- `/sign-up` (`screenshots/step-08/sign-up.png`), `/forgot-password` (`screenshots/step-08/forgot.png`).
- Mobile 375px (`screenshots/step-08/sign-in-mobile.png`): single-card fallback.
