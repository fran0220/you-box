# Feature parity index — reference → YouBox implementation

Maps every route, feature, and shared component of the pre-redesign
frontend (`web/reference/default-before-youbox/`, snapshot of baseline
commit `e22fadc9`) to its implementation in the new `web/default/`.

Method: the redesign was executed **in place** on `web/default/`, page by
page against the same source tree, so reference and new implementation
share identical file paths — `web/reference/default-before-youbox/src/X`
corresponds to `web/default/src/X` for every file unless noted in the
deltas below. Functional parity per page (table columns, filters, search
params, dialogs, drawers, form validation, permission guards,
loading/error/empty states, import/export/copy/delete/save flows) was
verified per step; evidence is the step review record listed on each row
and the route matrix in `final-acceptance-matrix.md`.

Status legend: `implemented` — present in new `web/default/` with step
review evidence; `superseded` — intentionally removed/replaced, rationale
recorded.

## Tree deltas (reference vs new)

Full-tree diff of `src/` shows exactly two deltas; everything else is
path-identical:

| Reference file | New implementation | Status | Notes |
| --- | --- | --- | --- |
| `src/components/theme-quick-switcher.tsx` | — (removed) | superseded | Theme preset quick-switcher conflicted with the YouBox brand token source ("移除或冻结与 YouBox 冲突的主题预设入口") and had no importers in the reference tree; deleted as dead code in the step 19 cleanup (`fc75ef53`), see `step-19-final-acceptance.md`. Dark/light switching remains via `theme-switch.tsx`. |
| — | `src/features/errors/error-page-shell.tsx` | implemented (new) | Shared YouBox shell for all error pages; see `step-09-setup-errors.md`. |

## Routes

| Reference route file | New implementation | Status | Evidence |
| --- | --- | --- | --- |
| `src/routes/(auth)/forgot-password.tsx` | `web/default/src/routes/(auth)/forgot-password.tsx` | implemented | `step-08-auth-flows.md` |
| `src/routes/(auth)/oauth.tsx` | `web/default/src/routes/(auth)/oauth.tsx` | implemented | `step-08-auth-flows.md` |
| `src/routes/(auth)/otp.tsx` | `web/default/src/routes/(auth)/otp.tsx` | implemented | `step-08-auth-flows.md` |
| `src/routes/(auth)/register.tsx` | `web/default/src/routes/(auth)/register.tsx` | implemented | `step-08-auth-flows.md` |
| `src/routes/(auth)/reset.tsx` | `web/default/src/routes/(auth)/reset.tsx` | implemented | `step-08-auth-flows.md` |
| `src/routes/(auth)/route.tsx` | `web/default/src/routes/(auth)/route.tsx` | implemented | `step-08-auth-flows.md` |
| `src/routes/(auth)/sign-in.tsx` | `web/default/src/routes/(auth)/sign-in.tsx` | implemented | `step-08-auth-flows.md` |
| `src/routes/(auth)/sign-up.tsx` | `web/default/src/routes/(auth)/sign-up.tsx` | implemented | `step-08-auth-flows.md` |
| `src/routes/(auth)/user/reset.tsx` | `web/default/src/routes/(auth)/user/reset.tsx` | implemented | `step-08-auth-flows.md` |
| `src/routes/(errors)/401.tsx` | `web/default/src/routes/(errors)/401.tsx` | implemented | `step-09-setup-errors.md` |
| `src/routes/(errors)/403.tsx` | `web/default/src/routes/(errors)/403.tsx` | implemented | `step-09-setup-errors.md` |
| `src/routes/(errors)/404.tsx` | `web/default/src/routes/(errors)/404.tsx` | implemented | `step-09-setup-errors.md` |
| `src/routes/(errors)/500.tsx` | `web/default/src/routes/(errors)/500.tsx` | implemented | `step-09-setup-errors.md` |
| `src/routes/(errors)/503.tsx` | `web/default/src/routes/(errors)/503.tsx` | implemented | `step-09-setup-errors.md` |
| `src/routes/__root.tsx` | `web/default/src/routes/__root.tsx` | implemented | `step-05-app-shell.md` |
| `src/routes/_authenticated/channels/index.tsx` | `web/default/src/routes/_authenticated/channels/index.tsx` | implemented | `step-14-admin-pages.md` |
| `src/routes/_authenticated/chat/$chatId.tsx` | `web/default/src/routes/_authenticated/chat/$chatId.tsx` | implemented | `step-12-playground-chat.md` |
| `src/routes/_authenticated/chat2link.tsx` | `web/default/src/routes/_authenticated/chat2link.tsx` | implemented | `step-12-playground-chat.md` |
| `src/routes/_authenticated/dashboard/$section.tsx` | `web/default/src/routes/_authenticated/dashboard/$section.tsx` | implemented | `step-10-dashboard.md` |
| `src/routes/_authenticated/dashboard/index.tsx` | `web/default/src/routes/_authenticated/dashboard/index.tsx` | implemented | `step-10-dashboard.md` |
| `src/routes/_authenticated/errors/$error.tsx` | `web/default/src/routes/_authenticated/errors/$error.tsx` | implemented | `step-09-setup-errors.md` |
| `src/routes/_authenticated/keys/index.tsx` | `web/default/src/routes/_authenticated/keys/index.tsx` | implemented | `step-11-keys-wallet.md` |
| `src/routes/_authenticated/models/$section.tsx` | `web/default/src/routes/_authenticated/models/$section.tsx` | implemented | `step-15-models-admin.md` |
| `src/routes/_authenticated/models/index.tsx` | `web/default/src/routes/_authenticated/models/index.tsx` | implemented | `step-15-models-admin.md` |
| `src/routes/_authenticated/playground/index.tsx` | `web/default/src/routes/_authenticated/playground/index.tsx` | implemented | `step-12-playground-chat.md` |
| `src/routes/_authenticated/profile/index.tsx` | `web/default/src/routes/_authenticated/profile/index.tsx` | implemented | `step-17-profile.md` |
| `src/routes/_authenticated/redemption-codes/index.tsx` | `web/default/src/routes/_authenticated/redemption-codes/index.tsx` | implemented | `step-14-admin-pages.md` |
| `src/routes/_authenticated/route.tsx` | `web/default/src/routes/_authenticated/route.tsx` | implemented | `step-05-app-shell.md` |
| `src/routes/_authenticated/subscriptions/index.tsx` | `web/default/src/routes/_authenticated/subscriptions/index.tsx` | implemented | `step-14-admin-pages.md` |
| `src/routes/_authenticated/system-settings/auth/$section.tsx` | `web/default/src/routes/_authenticated/system-settings/auth/$section.tsx` | implemented | `step-16-system-settings.md` |
| `src/routes/_authenticated/system-settings/auth/index.tsx` | `web/default/src/routes/_authenticated/system-settings/auth/index.tsx` | implemented | `step-16-system-settings.md` |
| `src/routes/_authenticated/system-settings/billing/$section.tsx` | `web/default/src/routes/_authenticated/system-settings/billing/$section.tsx` | implemented | `step-16-system-settings.md` |
| `src/routes/_authenticated/system-settings/billing/index.tsx` | `web/default/src/routes/_authenticated/system-settings/billing/index.tsx` | implemented | `step-16-system-settings.md` |
| `src/routes/_authenticated/system-settings/content/$section.tsx` | `web/default/src/routes/_authenticated/system-settings/content/$section.tsx` | implemented | `step-16-system-settings.md` |
| `src/routes/_authenticated/system-settings/content/index.tsx` | `web/default/src/routes/_authenticated/system-settings/content/index.tsx` | implemented | `step-16-system-settings.md` |
| `src/routes/_authenticated/system-settings/index.tsx` | `web/default/src/routes/_authenticated/system-settings/index.tsx` | implemented | `step-16-system-settings.md` |
| `src/routes/_authenticated/system-settings/models/$section.tsx` | `web/default/src/routes/_authenticated/system-settings/models/$section.tsx` | implemented | `step-16-system-settings.md` |
| `src/routes/_authenticated/system-settings/models/index.tsx` | `web/default/src/routes/_authenticated/system-settings/models/index.tsx` | implemented | `step-16-system-settings.md` |
| `src/routes/_authenticated/system-settings/operations/$section.tsx` | `web/default/src/routes/_authenticated/system-settings/operations/$section.tsx` | implemented | `step-16-system-settings.md` |
| `src/routes/_authenticated/system-settings/operations/index.tsx` | `web/default/src/routes/_authenticated/system-settings/operations/index.tsx` | implemented | `step-16-system-settings.md` |
| `src/routes/_authenticated/system-settings/route.tsx` | `web/default/src/routes/_authenticated/system-settings/route.tsx` | implemented | `step-16-system-settings.md` |
| `src/routes/_authenticated/system-settings/security/$section.tsx` | `web/default/src/routes/_authenticated/system-settings/security/$section.tsx` | implemented | `step-16-system-settings.md` |
| `src/routes/_authenticated/system-settings/security/index.tsx` | `web/default/src/routes/_authenticated/system-settings/security/index.tsx` | implemented | `step-16-system-settings.md` |
| `src/routes/_authenticated/system-settings/site/$section.tsx` | `web/default/src/routes/_authenticated/system-settings/site/$section.tsx` | implemented | `step-16-system-settings.md` |
| `src/routes/_authenticated/system-settings/site/index.tsx` | `web/default/src/routes/_authenticated/system-settings/site/index.tsx` | implemented | `step-16-system-settings.md` |
| `src/routes/_authenticated/usage-logs/$section.tsx` | `web/default/src/routes/_authenticated/usage-logs/$section.tsx` | implemented | `step-13-usage-logs.md` |
| `src/routes/_authenticated/usage-logs/index.tsx` | `web/default/src/routes/_authenticated/usage-logs/index.tsx` | implemented | `step-13-usage-logs.md` |
| `src/routes/_authenticated/users/index.tsx` | `web/default/src/routes/_authenticated/users/index.tsx` | implemented | `step-14-admin-pages.md` |
| `src/routes/_authenticated/wallet/index.tsx` | `web/default/src/routes/_authenticated/wallet/index.tsx` | implemented | `step-11-keys-wallet.md` |
| `src/routes/about/index.tsx` | `web/default/src/routes/about/index.tsx` | implemented | `step-06-marketing-pages.md` |
| `src/routes/console/log.tsx` | `web/default/src/routes/console/log.tsx` | implemented | `step-19-final-acceptance.md` |
| `src/routes/console/topup.tsx` | `web/default/src/routes/console/topup.tsx` | implemented | `step-19-final-acceptance.md` |
| `src/routes/index.tsx` | `web/default/src/routes/index.tsx` | implemented | `step-06-marketing-pages.md` |
| `src/routes/oauth/$provider.tsx` | `web/default/src/routes/oauth/$provider.tsx` | implemented | `step-08-auth-flows.md` |
| `src/routes/pricing/$modelId/index.tsx` | `web/default/src/routes/pricing/$modelId/index.tsx` | implemented | `step-07-pricing-rankings.md` |
| `src/routes/pricing/index.tsx` | `web/default/src/routes/pricing/index.tsx` | implemented | `step-07-pricing-rankings.md` |
| `src/routes/privacy-policy.tsx` | `web/default/src/routes/privacy-policy.tsx` | implemented | `step-06-marketing-pages.md` |
| `src/routes/rankings/index.tsx` | `web/default/src/routes/rankings/index.tsx` | implemented | `step-07-pricing-rankings.md` |
| `src/routes/setup/index.tsx` | `web/default/src/routes/setup/index.tsx` | implemented | `step-09-setup-errors.md` |
| `src/routes/user-agreement.tsx` | `web/default/src/routes/user-agreement.tsx` | implemented | `step-06-marketing-pages.md` |

## Features (`src/features/*`)

Every file under each feature directory is path-identical between
reference and new implementation (see tree-delta section for the two
exceptions). One row per feature; the step record contains the
functional checklist (tables, filters, dialogs, guards, states).

| Reference feature | New implementation | Status | Evidence |
| --- | --- | --- | --- |
| `src/features/about/` (3 files) | `web/default/src/features/about/` | implemented | `step-06-marketing-pages.md` |
| `src/features/auth/` (34 files) | `web/default/src/features/auth/` | implemented | `step-08-auth-flows.md` |
| `src/features/channels/` (51 files) | `web/default/src/features/channels/` | implemented | `step-14-admin-pages.md` |
| `src/features/chat/` (4 files) | `web/default/src/features/chat/` | implemented | `step-12-playground-chat.md` |
| `src/features/dashboard/` (31 files) | `web/default/src/features/dashboard/` | implemented | `step-10-dashboard.md` |
| `src/features/errors/` (5 files) | `web/default/src/features/errors/` | implemented | `step-09-setup-errors.md` |
| `src/features/home/` (21 files) | `web/default/src/features/home/` | implemented | `step-06-marketing-pages.md` |
| `src/features/keys/` (19 files) | `web/default/src/features/keys/` | implemented | `step-11-keys-wallet.md` |
| `src/features/legal/` (6 files) | `web/default/src/features/legal/` | implemented | `step-06-marketing-pages.md` |
| `src/features/models/` (40 files) | `web/default/src/features/models/` | implemented | `step-15-models-admin.md` |
| `src/features/performance-metrics/` (3 files) | `web/default/src/features/performance-metrics/` | implemented | `step-13-usage-logs.md` |
| `src/features/playground/` (19 files) | `web/default/src/features/playground/` | implemented | `step-12-playground-chat.md` |
| `src/features/pricing/` (38 files) | `web/default/src/features/pricing/` | implemented | `step-07-pricing-rankings.md` |
| `src/features/profile/` (29 files) | `web/default/src/features/profile/` | implemented | `step-17-profile.md` |
| `src/features/rankings/` (14 files) | `web/default/src/features/rankings/` | implemented | `step-07-pricing-rankings.md` |
| `src/features/redemption-codes/` (16 files) | `web/default/src/features/redemption-codes/` | implemented | `step-14-admin-pages.md` |
| `src/features/setup/` (9 files) | `web/default/src/features/setup/` | implemented | `step-09-setup-errors.md` |
| `src/features/subscriptions/` (17 files) | `web/default/src/features/subscriptions/` | implemented | `step-14-admin-pages.md` |
| `src/features/system-settings/` (126 files) | `web/default/src/features/system-settings/` | implemented | `step-16-system-settings.md` |
| `src/features/usage-logs/` (33 files) | `web/default/src/features/usage-logs/` | implemented | `step-13-usage-logs.md` |
| `src/features/users/` (17 files) | `web/default/src/features/users/` | implemented | `step-14-admin-pages.md` |
| `src/features/wallet/` (28 files) | `web/default/src/features/wallet/` | implemented | `step-11-keys-wallet.md` |

## Shared UI primitives (`src/components/ui/*`)

All restyled on the YouBox token bridge; evidence: `step-03-ui-primitives.md` (primitives) and `step-04-overlays.md` (overlay primitives: dialog, alert-dialog, sheet, drawer, dropdown-menu, popover, tooltip, command, sonner, hover-card, context-menu, menubar).

| Reference file | New implementation | Status |
| --- | --- | --- |
| `src/components/ui/accordion.tsx` | `web/default/src/components/ui/accordion.tsx` | implemented |
| `src/components/ui/alert-dialog.tsx` | `web/default/src/components/ui/alert-dialog.tsx` | implemented |
| `src/components/ui/alert.tsx` | `web/default/src/components/ui/alert.tsx` | implemented |
| `src/components/ui/aspect-ratio.tsx` | `web/default/src/components/ui/aspect-ratio.tsx` | implemented |
| `src/components/ui/avatar.tsx` | `web/default/src/components/ui/avatar.tsx` | implemented |
| `src/components/ui/badge.tsx` | `web/default/src/components/ui/badge.tsx` | implemented |
| `src/components/ui/breadcrumb.tsx` | `web/default/src/components/ui/breadcrumb.tsx` | implemented |
| `src/components/ui/button-group.tsx` | `web/default/src/components/ui/button-group.tsx` | implemented |
| `src/components/ui/button.tsx` | `web/default/src/components/ui/button.tsx` | implemented |
| `src/components/ui/calendar.tsx` | `web/default/src/components/ui/calendar.tsx` | implemented |
| `src/components/ui/card.tsx` | `web/default/src/components/ui/card.tsx` | implemented |
| `src/components/ui/carousel.tsx` | `web/default/src/components/ui/carousel.tsx` | implemented |
| `src/components/ui/chart.tsx` | `web/default/src/components/ui/chart.tsx` | implemented |
| `src/components/ui/checkbox.tsx` | `web/default/src/components/ui/checkbox.tsx` | implemented |
| `src/components/ui/collapsible.tsx` | `web/default/src/components/ui/collapsible.tsx` | implemented |
| `src/components/ui/combobox-input.tsx` | `web/default/src/components/ui/combobox-input.tsx` | implemented |
| `src/components/ui/combobox.tsx` | `web/default/src/components/ui/combobox.tsx` | implemented |
| `src/components/ui/command.tsx` | `web/default/src/components/ui/command.tsx` | implemented |
| `src/components/ui/context-menu.tsx` | `web/default/src/components/ui/context-menu.tsx` | implemented |
| `src/components/ui/dialog.tsx` | `web/default/src/components/ui/dialog.tsx` | implemented |
| `src/components/ui/direction.tsx` | `web/default/src/components/ui/direction.tsx` | implemented |
| `src/components/ui/drawer.tsx` | `web/default/src/components/ui/drawer.tsx` | implemented |
| `src/components/ui/dropdown-menu-events.ts` | `web/default/src/components/ui/dropdown-menu-events.ts` | implemented |
| `src/components/ui/dropdown-menu.test.tsx` | `web/default/src/components/ui/dropdown-menu.test.tsx` | implemented |
| `src/components/ui/dropdown-menu.tsx` | `web/default/src/components/ui/dropdown-menu.tsx` | implemented |
| `src/components/ui/empty.tsx` | `web/default/src/components/ui/empty.tsx` | implemented |
| `src/components/ui/field.tsx` | `web/default/src/components/ui/field.tsx` | implemented |
| `src/components/ui/form.tsx` | `web/default/src/components/ui/form.tsx` | implemented |
| `src/components/ui/hover-card.tsx` | `web/default/src/components/ui/hover-card.tsx` | implemented |
| `src/components/ui/input-group.tsx` | `web/default/src/components/ui/input-group.tsx` | implemented |
| `src/components/ui/input-otp.tsx` | `web/default/src/components/ui/input-otp.tsx` | implemented |
| `src/components/ui/input.tsx` | `web/default/src/components/ui/input.tsx` | implemented |
| `src/components/ui/item.tsx` | `web/default/src/components/ui/item.tsx` | implemented |
| `src/components/ui/kbd.tsx` | `web/default/src/components/ui/kbd.tsx` | implemented |
| `src/components/ui/label.tsx` | `web/default/src/components/ui/label.tsx` | implemented |
| `src/components/ui/markdown.tsx` | `web/default/src/components/ui/markdown.tsx` | implemented |
| `src/components/ui/menubar.tsx` | `web/default/src/components/ui/menubar.tsx` | implemented |
| `src/components/ui/native-select.tsx` | `web/default/src/components/ui/native-select.tsx` | implemented |
| `src/components/ui/navigation-menu.tsx` | `web/default/src/components/ui/navigation-menu.tsx` | implemented |
| `src/components/ui/pagination.tsx` | `web/default/src/components/ui/pagination.tsx` | implemented |
| `src/components/ui/popover.tsx` | `web/default/src/components/ui/popover.tsx` | implemented |
| `src/components/ui/progress.tsx` | `web/default/src/components/ui/progress.tsx` | implemented |
| `src/components/ui/radio-group.tsx` | `web/default/src/components/ui/radio-group.tsx` | implemented |
| `src/components/ui/resizable.tsx` | `web/default/src/components/ui/resizable.tsx` | implemented |
| `src/components/ui/scroll-area.tsx` | `web/default/src/components/ui/scroll-area.tsx` | implemented |
| `src/components/ui/select.tsx` | `web/default/src/components/ui/select.tsx` | implemented |
| `src/components/ui/separator.tsx` | `web/default/src/components/ui/separator.tsx` | implemented |
| `src/components/ui/sheet.tsx` | `web/default/src/components/ui/sheet.tsx` | implemented |
| `src/components/ui/sidebar.tsx` | `web/default/src/components/ui/sidebar.tsx` | implemented |
| `src/components/ui/skeleton.tsx` | `web/default/src/components/ui/skeleton.tsx` | implemented |
| `src/components/ui/slider.tsx` | `web/default/src/components/ui/slider.tsx` | implemented |
| `src/components/ui/sonner.tsx` | `web/default/src/components/ui/sonner.tsx` | implemented |
| `src/components/ui/spinner.tsx` | `web/default/src/components/ui/spinner.tsx` | implemented |
| `src/components/ui/switch.tsx` | `web/default/src/components/ui/switch.tsx` | implemented |
| `src/components/ui/table.tsx` | `web/default/src/components/ui/table.tsx` | implemented |
| `src/components/ui/tabs.tsx` | `web/default/src/components/ui/tabs.tsx` | implemented |
| `src/components/ui/textarea.tsx` | `web/default/src/components/ui/textarea.tsx` | implemented |
| `src/components/ui/titled-card.tsx` | `web/default/src/components/ui/titled-card.tsx` | implemented |
| `src/components/ui/toggle-group.tsx` | `web/default/src/components/ui/toggle-group.tsx` | implemented |
| `src/components/ui/toggle.tsx` | `web/default/src/components/ui/toggle.tsx` | implemented |
| `src/components/ui/tooltip.tsx` | `web/default/src/components/ui/tooltip.tsx` | implemented |

## Layout components (`src/components/layout/*`)

Evidence: `step-05-app-shell.md` (shell, nav, sidebar, headers) and `step-06-marketing-pages.md` (public footer).

| Reference file | New implementation | Status |
| --- | --- | --- |
| `src/components/layout/components/app-header.tsx` | `web/default/src/components/layout/components/app-header.tsx` | implemented |
| `src/components/layout/components/app-sidebar.tsx` | `web/default/src/components/layout/components/app-sidebar.tsx` | implemented |
| `src/components/layout/components/authenticated-layout.tsx` | `web/default/src/components/layout/components/authenticated-layout.tsx` | implemented |
| `src/components/layout/components/chat-presets-item.tsx` | `web/default/src/components/layout/components/chat-presets-item.tsx` | implemented |
| `src/components/layout/components/footer.tsx` | `web/default/src/components/layout/components/footer.tsx` | implemented |
| `src/components/layout/components/glow.tsx` | `web/default/src/components/layout/components/glow.tsx` | implemented |
| `src/components/layout/components/header-logo.tsx` | `web/default/src/components/layout/components/header-logo.tsx` | implemented |
| `src/components/layout/components/header.tsx` | `web/default/src/components/layout/components/header.tsx` | implemented |
| `src/components/layout/components/logo.tsx` | `web/default/src/components/layout/components/logo.tsx` | implemented |
| `src/components/layout/components/main.tsx` | `web/default/src/components/layout/components/main.tsx` | implemented |
| `src/components/layout/components/mobile-drawer.tsx` | `web/default/src/components/layout/components/mobile-drawer.tsx` | implemented |
| `src/components/layout/components/mockup.tsx` | `web/default/src/components/layout/components/mockup.tsx` | implemented |
| `src/components/layout/components/nav-group.tsx` | `web/default/src/components/layout/components/nav-group.tsx` | implemented |
| `src/components/layout/components/nav-link-item.tsx` | `web/default/src/components/layout/components/nav-link-item.tsx` | implemented |
| `src/components/layout/components/navbar.tsx` | `web/default/src/components/layout/components/navbar.tsx` | implemented |
| `src/components/layout/components/page-footer.tsx` | `web/default/src/components/layout/components/page-footer.tsx` | implemented |
| `src/components/layout/components/public-header.tsx` | `web/default/src/components/layout/components/public-header.tsx` | implemented |
| `src/components/layout/components/public-layout.tsx` | `web/default/src/components/layout/components/public-layout.tsx` | implemented |
| `src/components/layout/components/public-navigation.tsx` | `web/default/src/components/layout/components/public-navigation.tsx` | implemented |
| `src/components/layout/components/section-page-layout.tsx` | `web/default/src/components/layout/components/section-page-layout.tsx` | implemented |
| `src/components/layout/components/section.tsx` | `web/default/src/components/layout/components/section.tsx` | implemented |
| `src/components/layout/components/sidebar-view-header.tsx` | `web/default/src/components/layout/components/sidebar-view-header.tsx` | implemented |
| `src/components/layout/components/system-brand.tsx` | `web/default/src/components/layout/components/system-brand.tsx` | implemented |
| `src/components/layout/components/top-nav.tsx` | `web/default/src/components/layout/components/top-nav.tsx` | implemented |
| `src/components/layout/config/system-settings.config.ts` | `web/default/src/components/layout/config/system-settings.config.ts` | implemented |
| `src/components/layout/config/top-nav.config.ts` | `web/default/src/components/layout/config/top-nav.config.ts` | implemented |
| `src/components/layout/constants.ts` | `web/default/src/components/layout/constants.ts` | implemented |
| `src/components/layout/index.ts` | `web/default/src/components/layout/index.ts` | implemented |
| `src/components/layout/lib/sidebar-view-registry.ts` | `web/default/src/components/layout/lib/sidebar-view-registry.ts` | implemented |
| `src/components/layout/lib/url-utils.ts` | `web/default/src/components/layout/lib/url-utils.ts` | implemented |
| `src/components/layout/types.ts` | `web/default/src/components/layout/types.ts` | implemented |

## Data table system (`src/components/data-table/*`)

Evidence: `step-03-ui-primitives.md` (table visuals), `step-13-usage-logs.md` and `step-14-admin-pages.md` (toolbar, filters, pagination, mobile cards, bulk actions in real pages).

| Reference file | New implementation | Status |
| --- | --- | --- |
| `src/components/data-table/bulk-actions.tsx` | `web/default/src/components/data-table/bulk-actions.tsx` | implemented |
| `src/components/data-table/column-header.tsx` | `web/default/src/components/data-table/column-header.tsx` | implemented |
| `src/components/data-table/data-table-page.tsx` | `web/default/src/components/data-table/data-table-page.tsx` | implemented |
| `src/components/data-table/faceted-filter.tsx` | `web/default/src/components/data-table/faceted-filter.tsx` | implemented |
| `src/components/data-table/index.ts` | `web/default/src/components/data-table/index.ts` | implemented |
| `src/components/data-table/mobile-card-list.tsx` | `web/default/src/components/data-table/mobile-card-list.tsx` | implemented |
| `src/components/data-table/pagination.tsx` | `web/default/src/components/data-table/pagination.tsx` | implemented |
| `src/components/data-table/table-empty.tsx` | `web/default/src/components/data-table/table-empty.tsx` | implemented |
| `src/components/data-table/table-skeleton.tsx` | `web/default/src/components/data-table/table-skeleton.tsx` | implemented |
| `src/components/data-table/toolbar.tsx` | `web/default/src/components/data-table/toolbar.tsx` | implemented |
| `src/components/data-table/view-options.tsx` | `web/default/src/components/data-table/view-options.tsx` | implemented |

## AI elements (`src/components/ai-elements/*`)

Evidence: `step-12-playground-chat.md`.

| Reference file | New implementation | Status |
| --- | --- | --- |
| `src/components/ai-elements/actions.tsx` | `web/default/src/components/ai-elements/actions.tsx` | implemented |
| `src/components/ai-elements/artifact.tsx` | `web/default/src/components/ai-elements/artifact.tsx` | implemented |
| `src/components/ai-elements/branch.tsx` | `web/default/src/components/ai-elements/branch.tsx` | implemented |
| `src/components/ai-elements/canvas.tsx` | `web/default/src/components/ai-elements/canvas.tsx` | implemented |
| `src/components/ai-elements/chain-of-thought.tsx` | `web/default/src/components/ai-elements/chain-of-thought.tsx` | implemented |
| `src/components/ai-elements/code-block.tsx` | `web/default/src/components/ai-elements/code-block.tsx` | implemented |
| `src/components/ai-elements/confirmation.tsx` | `web/default/src/components/ai-elements/confirmation.tsx` | implemented |
| `src/components/ai-elements/connection.tsx` | `web/default/src/components/ai-elements/connection.tsx` | implemented |
| `src/components/ai-elements/context.tsx` | `web/default/src/components/ai-elements/context.tsx` | implemented |
| `src/components/ai-elements/controls.tsx` | `web/default/src/components/ai-elements/controls.tsx` | implemented |
| `src/components/ai-elements/conversation.tsx` | `web/default/src/components/ai-elements/conversation.tsx` | implemented |
| `src/components/ai-elements/edge.tsx` | `web/default/src/components/ai-elements/edge.tsx` | implemented |
| `src/components/ai-elements/image.tsx` | `web/default/src/components/ai-elements/image.tsx` | implemented |
| `src/components/ai-elements/inline-citation.tsx` | `web/default/src/components/ai-elements/inline-citation.tsx` | implemented |
| `src/components/ai-elements/loader.tsx` | `web/default/src/components/ai-elements/loader.tsx` | implemented |
| `src/components/ai-elements/message.tsx` | `web/default/src/components/ai-elements/message.tsx` | implemented |
| `src/components/ai-elements/node.tsx` | `web/default/src/components/ai-elements/node.tsx` | implemented |
| `src/components/ai-elements/open-in-chat.tsx` | `web/default/src/components/ai-elements/open-in-chat.tsx` | implemented |
| `src/components/ai-elements/panel.tsx` | `web/default/src/components/ai-elements/panel.tsx` | implemented |
| `src/components/ai-elements/plan.tsx` | `web/default/src/components/ai-elements/plan.tsx` | implemented |
| `src/components/ai-elements/prompt-input.tsx` | `web/default/src/components/ai-elements/prompt-input.tsx` | implemented |
| `src/components/ai-elements/queue.tsx` | `web/default/src/components/ai-elements/queue.tsx` | implemented |
| `src/components/ai-elements/reasoning.tsx` | `web/default/src/components/ai-elements/reasoning.tsx` | implemented |
| `src/components/ai-elements/response.tsx` | `web/default/src/components/ai-elements/response.tsx` | implemented |
| `src/components/ai-elements/shimmer.tsx` | `web/default/src/components/ai-elements/shimmer.tsx` | implemented |
| `src/components/ai-elements/sources.tsx` | `web/default/src/components/ai-elements/sources.tsx` | implemented |
| `src/components/ai-elements/suggestion.tsx` | `web/default/src/components/ai-elements/suggestion.tsx` | implemented |
| `src/components/ai-elements/task.tsx` | `web/default/src/components/ai-elements/task.tsx` | implemented |
| `src/components/ai-elements/tool.tsx` | `web/default/src/components/ai-elements/tool.tsx` | implemented |
| `src/components/ai-elements/toolbar.tsx` | `web/default/src/components/ai-elements/toolbar.tsx` | implemented |
| `src/components/ai-elements/web-preview.tsx` | `web/default/src/components/ai-elements/web-preview.tsx` | implemented |

## Other shared components (`src/components/*`)

| Reference file | New implementation | Status | Evidence |
| --- | --- | --- | --- |
| `src/components/animate-in-view.tsx` | `web/default/src/components/animate-in-view.tsx` | implemented | `step-18-global-sweep.md` |
| `src/components/auto-skeleton.tsx` | `web/default/src/components/auto-skeleton.tsx` | implemented | `step-03-ui-primitives.md` |
| `src/components/coming-soon.tsx` | `web/default/src/components/coming-soon.tsx` | implemented | `step-03-ui-primitives.md` |
| `src/components/command-menu.tsx` | `web/default/src/components/command-menu.tsx` | implemented | `step-04-overlays.md` |
| `src/components/config-drawer.tsx` | `web/default/src/components/config-drawer.tsx` | implemented | `step-04-overlays.md` |
| `src/components/confirm-dialog.tsx` | `web/default/src/components/confirm-dialog.tsx` | implemented | `step-04-overlays.md` |
| `src/components/copy-button.tsx` | `web/default/src/components/copy-button.tsx` | implemented | `step-03-ui-primitives.md` |
| `src/components/date-picker.tsx` | `web/default/src/components/date-picker.tsx` | implemented | `step-03-ui-primitives.md` |
| `src/components/datetime-picker.tsx` | `web/default/src/components/datetime-picker.tsx` | implemented | `step-03-ui-primitives.md` |
| `src/components/dialog.tsx` | `web/default/src/components/dialog.tsx` | implemented | `step-04-overlays.md` |
| `src/components/drawer-layout.ts` | `web/default/src/components/drawer-layout.ts` | implemented | `step-04-overlays.md` |
| `src/components/empty-state.tsx` | `web/default/src/components/empty-state.tsx` | implemented | `step-03-ui-primitives.md` |
| `src/components/error-state.tsx` | `web/default/src/components/error-state.tsx` | implemented | `step-03-ui-primitives.md` |
| `src/components/group-badge.tsx` | `web/default/src/components/group-badge.tsx` | implemented | `step-03-ui-primitives.md` |
| `src/components/json-code-editor.tsx` | `web/default/src/components/json-code-editor.tsx` | implemented | `step-03-ui-primitives.md` |
| `src/components/json-editor.tsx` | `web/default/src/components/json-editor.tsx` | implemented | `step-03-ui-primitives.md` |
| `src/components/language-switcher.tsx` | `web/default/src/components/language-switcher.tsx` | implemented | `step-05-app-shell.md` |
| `src/components/learn-more.tsx` | `web/default/src/components/learn-more.tsx` | implemented | `step-03-ui-primitives.md` |
| `src/components/loading-state.tsx` | `web/default/src/components/loading-state.tsx` | implemented | `step-03-ui-primitives.md` |
| `src/components/long-text.tsx` | `web/default/src/components/long-text.tsx` | implemented | `step-03-ui-primitives.md` |
| `src/components/masked-value-display.tsx` | `web/default/src/components/masked-value-display.tsx` | implemented | `step-03-ui-primitives.md` |
| `src/components/model-group-selector.tsx` | `web/default/src/components/model-group-selector.tsx` | implemented | `step-03-ui-primitives.md` |
| `src/components/multi-select.tsx` | `web/default/src/components/multi-select.tsx` | implemented | `step-03-ui-primitives.md` |
| `src/components/navigation-progress.tsx` | `web/default/src/components/navigation-progress.tsx` | implemented | `step-18-global-sweep.md` |
| `src/components/notification-popover.tsx` | `web/default/src/components/notification-popover.tsx` | implemented | `step-04-overlays.md` |
| `src/components/page-transition.tsx` | `web/default/src/components/page-transition.tsx` | implemented | `step-18-global-sweep.md` |
| `src/components/password-input.tsx` | `web/default/src/components/password-input.tsx` | implemented | `step-03-ui-primitives.md` |
| `src/components/profile-dropdown.tsx` | `web/default/src/components/profile-dropdown.tsx` | implemented | `step-17-profile.md` |
| `src/components/risk-acknowledgement-dialog.tsx` | `web/default/src/components/risk-acknowledgement-dialog.tsx` | implemented | `step-04-overlays.md` |
| `src/components/search.tsx` | `web/default/src/components/search.tsx` | implemented | `step-04-overlays.md` |
| `src/components/sign-out-dialog.tsx` | `web/default/src/components/sign-out-dialog.tsx` | implemented | `step-04-overlays.md` |
| `src/components/skip-to-main.tsx` | `web/default/src/components/skip-to-main.tsx` | implemented | `step-05-app-shell.md` |
| `src/components/status-badge.tsx` | `web/default/src/components/status-badge.tsx` | implemented | `step-03-ui-primitives.md` |
| `src/components/table-id.tsx` | `web/default/src/components/table-id.tsx` | implemented | `step-03-ui-primitives.md` |
| `src/components/tag-input.tsx` | `web/default/src/components/tag-input.tsx` | implemented | `step-03-ui-primitives.md` |
| `src/components/theme-quick-switcher.tsx` | — (removed) | superseded | See tree-delta section; `step-19-final-acceptance.md` |
| `src/components/theme-switch.tsx` | `web/default/src/components/theme-switch.tsx` | implemented | `step-05-app-shell.md` |
| `src/components/truncated-text.tsx` | `web/default/src/components/truncated-text.tsx` | implemented | `step-03-ui-primitives.md` |
| `src/components/turnstile.tsx` | `web/default/src/components/turnstile.tsx` | implemented | `step-08-auth-flows.md` |

## Acceptance summary

All reference routes, features, and components above are marked
`implemented` (or `superseded` with recorded rationale). Route-level
acceptance evidence: `final-acceptance-matrix.md` (45 screenshots in
`screenshots/step-19/`), plus per-step browser review records.
