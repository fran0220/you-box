# Frontend Audit — Design Conformance & Functional Completeness

**Scope:** Every page/feature in `web/default/src/features`.
**Method:** 16-cluster parallel read-only audit (one auditor per feature area) → 78 raw findings → adversarial verification of the critical/high *functional* findings (2 verified real, 0 false positives).
**Audit pass:** `redesign/youbox-frontend-100`.

This document is the system of record for the audit. Every finding is listed with a status:

- **Fixed** — corrected in this audit cycle (verified by `tsc --noEmit`, `eslint`, `bun run build`, and dist-CSS grep).
- **Deferred** — real but intentionally not fixed now; rationale + suggested follow-up given.
- **By design** — flagged by a heuristic but correct as-is; kept deliberately.

| Status | Count |
| --- | --- |
| Fixed | 33 |
| Deferred / By design | 45 |
| **Total** | **78** |

> Two clusters independently reported the same `faq-section.tsx:435` and `announcements-section.tsx:628` strings, so the raw total of 78 includes 2 duplicate entries (noted in §D).

---

## Confirmed functional bugs (adversarially verified) — both Fixed

These were the only critical/high **functional** findings; both passed an independent skeptic verifier and both are now fixed.

| File:line | Issue | Fix |
| --- | --- | --- |
| `pricing/hooks/use-filters.ts:84` | Filter/sort/view state was held in local `useState` and never written back to the URL → all filters lost on refresh or navigation. | Refactored to **URL-as-source-of-truth**: removed local state; every value derives from `useSearch`, and `updateFilters` does `navigate({ replace: true, search })`. Route schema already declares all params. |
| `users/components/users-mutate-drawer.tsx:133` | Password length check ran on **update without a password change** — empty password hit `0 < 8` and blocked the submit even though the field is optional. | Guarded: only validate length when a password is actually entered (`if (!isUpdate && data.password) { … }`). |

---

## Fixed in this cycle

### Brand-glow tokenization (design)
All hardcoded `rgba(0,144,255,…)` brand glows replaced with theme tokens. Inline radial-gradients → `color-mix(in oklch, var(--brand) N%, transparent)` (preserves per-glow opacity); arbitrary Tailwind gradients → `from-brand/N` / `to-brand/N`.

| Finding | File:line | Was | Now |
| --- | --- | --- | --- |
| hero glow | `home/components/sections/hero.tsx:93` | `rgba(0,144,255,0.16)` inline | `color-mix(… var(--brand) 16% …)` |
| cta glow | `home/components/sections/cta.tsx:46` | `rgba(0,144,255,0.16)` inline | `color-mix(… 16% …)` |
| auth glow | `auth/auth-layout.tsx:87` | `rgba(0,144,255,0.16)` inline | `color-mix(… 16% …)` |
| setup glow | `setup/setup-wizard.tsx:87` | `rgba(0,144,255,0.14)` inline | `color-mix(… 14% …)` |
| rankings glow | `rankings/index.tsx:65` | `rgba(0,144,255,0.14)` inline | `color-mix(… 14% …)` |
| pricing glow | `pricing/index.tsx:211` | `rgba(0,144,255,0.14)` inline | `color-mix(… 14% …)` |
| errors glow | `errors/error-page-shell.tsx:50` | `rgba(0,144,255,0.12)` inline | `color-mix(… 12% …)` |
| icon-card | `home/components/icon-card.tsx:41` | `from-[rgba(…,0.12)]` | `from-brand/12` |
| gateway-card | `home/components/gateway-card.tsx:41` | `from-[rgba(…,0.25)]` | `from-brand/25` |
| connection-line | `home/components/connection-line.tsx:31` | `from-[rgba(…,0.6)] to-[rgba(…,0.2)]` (both directions) | `from-brand/60 to-brand/20` / `from-brand/20 to-brand/60` |
| terminal bg | `home/components/hero-terminal-demo.tsx:210` | `dark:bg-[#0b0f17]/95` | `dark:bg-background/95` |
| layout glow *(beyond audit scope — feature-scoped audit missed `src/components/layout`)* | `components/layout/components/glow.tsx:52` | `from-[rgba(0,144,255,0.6)] to-[rgba(0,144,255,0)]` | `from-brand/60 to-transparent` |

### Duration tokenization (design)
Off-scale `duration-*` values mapped to motion tokens (`instant`=80ms, `fast`=140ms, `base`=220ms, `slow`=400ms). The eslint `no-restricted-syntax` rule forbids arbitrary `duration-[…]`; these were bare off-scale steps.

| File:line(s) | Was → Now |
| --- | --- |
| `home/components/sections/hero.tsx:68,138,184` | `200,200,300` → `fast,fast,base` |
| `home/components/hero-terminal-demo.tsx:255,264` | `200,200` → `fast,fast` |
| `home/components/icon-card.tsx:37,41` | `500,500` → `slow,slow` |
| `home/components/gateway-card.tsx:36,61` | `500,300` → `slow,base` |
| `home/components/sections/features.tsx:55,203` | `300,300` → `base,base` |
| `home/components/stat-item.tsx:40` | `300` → `base` |
| `home/components/feature-item.tsx:33` | `300` → `base` |
| `home/components/sections/cta.tsx:66` | `200` → `fast` |
| `keys/components/api-key-group-combobox.tsx:141,163` | `150 / 75,100` → `fast / instant,fast` |
| `usage-logs/components/logs-filter-toolbar.tsx:227` | `200` → `fast` |
| `models/components/drawers/model-mutate-drawer.tsx:1123` | `200` → `fast` |

### Functional (design-adjacent)
| File:line | Issue | Fix |
| --- | --- | --- |
| `errors/maintenance-error.tsx:37` | Secondary action button was dead (no handler). | Replaced with a working **Try again** button (`onClick={() => window.location.reload()}`). |
| `profile/components/tabs/notification-tab.tsx:174` | Quota-warning-threshold input accepted negative numbers. | Added `min={0}`. |

**Verification:** `tsc --noEmit` ✓ · `eslint src/features` ✓ · `bun run build` ✓ · dist CSS confirms `.from-brand/{12,20,25,60}`, `.to-brand/{20,60}`, and `.duration-{instant,fast,base,slow}` all compiled.

---

## Deferred / By design

### A. Intentional typographic micro-sizes — **By design**
The redesign uses deliberate sub-scale sizes that have no Tailwind default step: 10–11px eyebrow labels, 13px dense table text, 28px auth/setup headings. Converting to `text-xs` (12px) / `text-3xl` (30px) would visibly shift the layout. Kept as intentional arbitrary values.

| File:line | Value |
| --- | --- |
| `wallet/components/recharge-form-card.tsx:332` | `text-[10px]` eyebrow |
| `wallet/components/affiliate-rewards-card.tsx:89` | `text-[10px]` eyebrow |
| `usage-logs/components/usage-logs-table.tsx:192` | `text-[13px]` table |
| `usage-logs/components/usage-logs-mobile-card.tsx:131` | `text-[11px]`, `text-[10px]` |
| `usage-logs/components/logs-filter-toolbar.tsx:132` | `text-[10px]` badge |
| `system-settings/components/form-dirty-indicator.tsx:44` | `text-[11px]` |
| `system-settings/components/settings-form-layout.tsx:214` | `text-[13px]` |
| `system-settings/integrations/waffo-pancake-settings-section.tsx:533` | `text-[10px]`, `tracking-[0.2em]` |
| `auth/auth-layout.tsx:115` | `text-[11px]`, `tracking-[0.06em]` |
| `auth/{sign-in,sign-up,otp,forgot-password,reset-password-confirm}/index.tsx:35` | `text-[28px]` heading |
| `setup/setup-wizard.tsx:310` | `text-[28px]` heading |

### B. `bg-[var(--*-subtle)]` — **By design** (already token-driven)
These reference real theme CSS variables (`--danger-subtle`, `--warning-subtle`, `--success-subtle`, `--info-subtle`) through Tailwind arbitrary-property syntax. They *are* using design tokens; the suggested first-class `bg-danger-subtle` utilities don't exist in the theme yet. Functionally correct and theme-reactive. Optional future polish: register these as named utilities in `theme.css`.

`keys/components/api-key-group-combobox.tsx:64` · `usage-logs/components/usage-logs-table.tsx:55` · `setup/components/database-step.tsx:108,120,136,150` · `setup/components/admin-step.tsx:38`

### C. Chart colors — **Deferred** (needs VChart theme mapping)
VChart specs take literal color strings (not CSS vars) and must react to dark/light mode. The correct fix is a shared VChart theme object that resolves semantic tokens → colors at render time; piecemeal hex swaps wouldn't respond to theme changes. Track as a dedicated charts-theming task.

| File:line | Hardcoded |
| --- | --- |
| `pricing/components/model-details-charts.tsx:192` | `#10b981` (uptime line) |
| `pricing/components/model-details-charts.tsx:198` | `#ffffff #10b981 #f59e0b #ef4444` (uptime points) |
| `pricing/components/model-details-charts.tsx:315` | `#6366f1` (throughput bars) |
| `dashboard/lib/charts.ts:497` | `#000` (hover/selected states) |

### D. Missing i18n — **Deferred** (single locale batch)
Real i18n gaps: delete-confirmation bodies and one stat label not wrapped in `t()`. Grouped so the locale-file churn (`en/zh/fr/ru/ja/vi` via `bun run i18n:sync`) happens in one pass.

| File:line | Untranslated |
| --- | --- |
| `users/components/users-delete-dialog.tsx:85` | `Deleting...` / `Delete` |
| `system-settings/content/announcements-section.tsx:628` | delete-confirm body (+ plural) |
| `system-settings/content/faq-section.tsx:435` | delete-confirm body (+ plural) |
| `system-settings/content/uptime-kuma-section.tsx:470` | delete-confirm body (+ plural) |
| `system-settings/content/api-info-section.tsx:552` | delete-confirm body (+ plural) |
| `system-settings/maintenance/performance-section.tsx:1026` | `Goroutines:` label |

*(`faq-section.tsx:435` and `announcements-section.tsx:628` were each reported twice — once per cluster — accounting for 2 of the 78 raw entries.)*

### E. Legacy / dead routes — **Deferred** (routing-cleanup task)
| File | Note |
| --- | --- |
| `routes/(auth)/oauth.tsx:60` | Unreachable duplicate OAuth route — confirmed no navigation targets it, but removal needs route-tree regeneration + deep-link check. |
| `routes/(auth)/oauth.tsx:39` | Dead `provider === 'wechat'` branch (WeChat uses the API directly). Remove with the route above. |
| `routes/console/*` | ~15 redirect-only legacy routes — **intentional** backwards-compat. Keep; add no new features here. |

### F. Minor / low-risk — **Deferred** or **By design**
| File:line | Finding | Disposition |
| --- | --- | --- |
| `home/components/hero-terminal-demo.tsx:210,217` | `dark:shadow-[…rgba(0,0,0,0.7)]`, `dark:border-white/[0.06]` | **By design** — terminal-card aesthetic (soft black drop shadow + dark hairline). `#0b0f17` bg was tokenized; these stay. |
| `components/layout/components/glow.tsx:58` | `from-[rgba(56,158,255,0.5)] to-[rgba(56,158,255,0)]` | **By design** — deliberate lighter second-layer tint (not the brand hue) for stacked-glow depth; no exact token exists. |
| `dashboard/components/overview/overview-insights.tsx:564` | Inline computed `height` | **By design** — dynamic value, not a token candidate. |
| `subscriptions/components/subscriptions-mutate-drawer.tsx:224` | Toast echoes server error reason | **Deferred** — already falls back; sanitization is minor hardening. |
| `usage-logs/components/common-logs-filter-bar.tsx:441` | `animate-spin` reduced-motion | **By design** — global `prefers-reduced-motion` in `styles/index.css` already neutralizes it. |
| `profile/components/tabs/notification-tab.tsx:113` | No client validation that the selected method's URL/token fields are filled | **Deferred** — server validates; UX enhancement. |
| `profile/components/tabs/notification-tab.tsx:150` | Selected radio `bg-primary/5` contrast | **Deferred** — acceptable; bump to `/10` if reported. |
| `profile/components/language-preferences-card.tsx:60` | Render-time conditional `setState` | **By design** — established controlled-sync pattern used elsewhere; behaves correctly. |
| `channels/components/dialogs/channel-test-dialog.tsx:203` | `rgb(0_0_0_/_0.2)` arbitrary scrim shadow | **Deferred** — single decorative edge shadow; low value. |
| `users/components/users-mutate-drawer.tsx:450` | `discord_id` not in `User` zod schema (uses assertion) | **Deferred** — works at runtime; schema-completeness nicety. |
| `auth/auth-layout.tsx:44` | `rounded-[8px]` | **By design** — deliberate 8px (between `sm`=6 and `md`=10). |
| `setup/components/complete-step.tsx:53` | `rounded-2xl` success icon | **By design** — stylistic choice. |
| `apps/index.tsx:44` | RankBadge `amber/slate/orange` palette | **By design** — gold/silver/bronze medal metaphor; semantic tokens would erase it. |

---

## Follow-up backlog (suggested)
1. **Charts theming** (§C) — one VChart theme object mapping semantic tokens → resolved colors, reactive to dark/light.
2. **i18n batch** (§D) — wrap the 6 sites in `t()`, run `bun run i18n:sync`.
3. **Routing cleanup** (§E) — remove the dead `(auth)/oauth` route + regenerate the route tree.
4. **Optional token polish** (§B) — register `*-subtle` colors as first-class Tailwind utilities.
