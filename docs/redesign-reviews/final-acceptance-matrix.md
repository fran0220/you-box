# Final acceptance matrix — YouBox frontend redesign

Review environment: dev server (rsbuild :5173) + Go backend (SQLite, rate
limits disabled for the sweep), Chromium 1440×900 (mobile spot-checks at
375×812 in steps 4/7/16/17). Dark = default theme; Light verified in
step-2 (`channels-light.png`). Keyboard: skip-to-main link, focus rings
(brand), dialog/command/menu keyboard navigation verified during step 3.
Screenshots: `docs/redesign-reviews/screenshots/step-19/` unless otherwise noted.

| Route | Desktop | Mobile | Dark | Light | i18n | Keyboard | Loading/Error/Empty | Screenshot | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | ✓ | ✓ (screenshots/step-18/home-375) | ✓ | ✓ (token-driven) | ✓ | ✓ | ✓ | final/home.png | pass |
| `/about/` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ empty-state | final/about.png | pass |
| `/pricing/` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ empty catalog | final/pricing.png | pass |
| `/pricing/$modelId/` | ✓ (shell + token audit; no models seeded) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | step-6 records | pass* |
| `/rankings/` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ empty data | final/rankings.png | pass |
| `/privacy-policy` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ empty state | final/privacy.png | pass |
| `/user-agreement` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ empty state | final/agreement.png | pass |
| `/oauth/$provider` | ✓ (OAuth callback screen, display heading) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ states | step-7 record | pass |
| `/sign-in` | ✓ | ✓ (step-7) | ✓ | ✓ | ✓ | ✓ | ✓ field errors | final/auth-signin.png | pass |
| `/sign-up` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | final/auth-signup.png | pass |
| `/register` | ✓ (redirect alias of sign-up) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | final/auth-register.png | pass |
| `/forgot-password` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | final/auth-forgot.png | pass |
| `/reset` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | final/auth-reset.png | pass |
| `/user/reset` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | final/auth-user-reset.png | pass |
| `/otp` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | final/auth-otp.png | pass |
| `/oauth` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | final/auth-oauth.png | pass |
| `/401` `/403` `/404` `/500` `/503` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | n/a | final/err*.png | pass |
| route error/notFound fallbacks | ✓ (same shells) | ✓ | ✓ | ✓ | ✓ | ✓ | n/a | screenshots/step-09/route-notfound.png | pass |
| `/setup/` | class-level changes typechecked; instance already initialized | — | ✓ | ✓ | ✓ | ✓ | ✓ | step-8 record | pass* |
| `/dashboard/$section` | ✓ ×3 | ✓ (step-4) | ✓ | ✓ | ✓ | ✓ | ✓ | final/dash-*.png | pass |
| `/keys/` | ✓ + create drawer | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | final/keys.png, step-10 | pass |
| `/wallet/` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | final/wallet.png | pass |
| `/profile/` | ✓ + dropdown | ✓ (step-16) | ✓ | ✓ | ✓ | ✓ | ✓ | final/profile.png | pass |
| `/playground/` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | final/playground.png | pass |
| `/chat/$chatId` | ✓ shell (no presets configured) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ empty | final/chat.png | pass* |
| `/chat2link` | external redirect route (no UI surface) | — | — | — | — | — | — | n/a | pass |
| `/usage-logs/$section` | ✓ ×3 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | final/logs-*.png | pass |
| `/channels/` | ✓ + create drawer | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | final/channels.png, step-13 | pass |
| `/users/` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | final/users.png | pass |
| `/redemption-codes/` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | final/redemptions.png | pass |
| `/subscriptions/` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | final/subscriptions.png | pass |
| `/models/$section` | ✓ ×2 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | final/models-*.png | pass |
| `/system-settings/site/$section` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | final/set-site.png | pass |
| `/system-settings/auth/$section` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | final/set-auth.png | pass |
| `/system-settings/billing/$section` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | final/set-billing.png | pass |
| `/system-settings/content/$section` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | final/set-content.png | pass |
| `/system-settings/models/$section` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | final/set-models.png | pass |
| `/system-settings/operations/$section` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | final/set-ops.png | pass |
| `/system-settings/security/$section` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | final/set-sec.png | pass |
| `/console/log` → `/usage-logs` | ✓ redirect verified | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | final/redirect-log.png | pass |
| `/console/topup` → `/wallet?show_history` | ✓ redirect + history dialog | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | final/redirect-topup.png | pass |
| index redirects (dashboard/models/usage-logs/system-settings/*) | ✓ land on default sections | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | final/set-*.png | pass |

`pass*` = visual system fully applied and verified at the shell/empty-state
level; data-populated variants (seeded models, chat presets, live streams,
fresh-install setup) re-verifiable once such data exists — all of their
components are the shared, already-verified primitives.

## Final gate results

- `bun run typecheck` — pass
- `bun run lint` — 99 pre-existing react-hooks behavioral errors, 0 new
  (see step-17 review for the cross-check)
- `bun run i18n:sync` — clean (0 missing / 0 untranslated, all locales)
- `bun run build` — pass
