# R2-C2 最终验收矩阵 v2

- branch:`redesign/youbox-frontend-100`
- 复跑 `docs/redesign-reviews/verify-harness.mjs`(80 路由 × 375/768/1280/1536 × dark+light;执行副本仅 patch 了 chromium executablePath 以匹配本机缓存版本)。
- 原始报告:[r2-c2-harness-report.json](r2-c2-harness-report.json);逐路由 dark-1280 截图归档:`screenshots/r2-c2-final/`(全分辨率/双主题原始件 35MB 留存 `/tmp/yb-verify/shots`,各 B 步骤目录已含交互/并排验收截图)。
- 「结构对照」列链接该页《结构对照表》;全部表行状态为 pass/adapted(各 review 记录逐行验收)。

## Harness 结论

**80 路由,0 真实错误。** 2 项 flag 均为预期行为,非缺陷:

| 路由 | flag | 判定 |
|---|---|---|
| `/oauth`(未登录) | `401 /api/user/self` + 重定向 `/sign-in` | 预期:OAuth 回调页无参数时校验登录态后转登录页,401 即该探测 |
| `/500` | `ERROR_BOUNDARY` 文本 flag | 误报:错误页文案本身为 “Oops! Something went wrong”,命中 harness 正则 |

\* Keyboard 列:Phase A 组件键盘行为(roving tabs/chips/rail、slider、switch、reveal)在 Design Lab 与各页验收中逐项实测(见各 review);本矩阵不重复逐路由枚举。
States(loading/error/empty/hover/disabled)与移动端等价在各 B 步骤 review 中实测记录。

## 逐路由矩阵

| Route | Desktop×4 断点 / States | Dark/Light | Keyboard* | Screenshot | 结构对照 |
|---|---|---|---|---|---|
| `/` | pass | pass | pass | pass | [r2-00-gap-index.md](r2-00-gap-index.md) |
| `/about` | pass | pass | pass | pass | [r2-00-gap-index.md](r2-00-gap-index.md) |
| `/pricing?view=card` | pass | pass | pass | pass | [r2-b14-marketing-depth-tables.md](r2-b14-marketing-depth-tables.md) |
| `/pricing?view=table` | pass | pass | pass | pass | [r2-b14-marketing-depth-tables.md](r2-b14-marketing-depth-tables.md) |
| `/pricing/gpt-4o` | pass | pass | pass | pass | [r2-b14-marketing-depth-tables.md](r2-b14-marketing-depth-tables.md) |
| `/rankings` | pass | pass | pass | pass | [r2-b14-marketing-depth-tables.md](r2-b14-marketing-depth-tables.md) |
| `/privacy-policy` | pass | pass | pass | pass | [r2-00-gap-index.md](r2-00-gap-index.md) |
| `/user-agreement` | pass | pass | pass | pass | [r2-00-gap-index.md](r2-00-gap-index.md) |
| `/sign-in` | pass | pass | pass | pass | [r2-00-gap-index.md](r2-00-gap-index.md) |
| `/sign-up` | pass | pass | pass | pass | [r2-00-gap-index.md](r2-00-gap-index.md) |
| `/register` | pass | pass | pass | pass | [r2-00-gap-index.md](r2-00-gap-index.md) |
| `/forgot-password` | pass | pass | pass | pass | [r2-00-gap-index.md](r2-00-gap-index.md) |
| `/reset` | pass | pass | pass | pass | [r2-00-gap-index.md](r2-00-gap-index.md) |
| `/user/reset` | pass | pass | pass | pass | [r2-00-gap-index.md](r2-00-gap-index.md) |
| `/otp` | pass | pass | pass | pass | [r2-00-gap-index.md](r2-00-gap-index.md) |
| `/oauth` | ⚠ console: Failed to load resource: the server responded with a status of 401 (Unauthorized); req: 401 /api/user/self | pass | pass | pass | [r2-00-gap-index.md](r2-00-gap-index.md) |
| `/401` | pass | pass | pass | pass | [r2-00-gap-index.md](r2-00-gap-index.md) |
| `/403` | pass | pass | pass | pass | [r2-00-gap-index.md](r2-00-gap-index.md) |
| `/404` | pass | pass | pass | pass | [r2-00-gap-index.md](r2-00-gap-index.md) |
| `/500` | ⚠ ERROR_BOUNDARY | pass | pass | pass | [r2-00-gap-index.md](r2-00-gap-index.md) |
| `/503` | pass | pass | pass | pass | [r2-00-gap-index.md](r2-00-gap-index.md) |
| `/this-route-does-not-exist` | pass | pass | pass | pass | [r2-00-gap-index.md](r2-00-gap-index.md) |
| `/dashboard/overview` | pass | pass | pass | pass | [r2-b1-dashboard-tables.md](r2-b1-dashboard-tables.md) |
| `/dashboard/models` | pass | pass | pass | pass | [r2-b1-dashboard-tables.md](r2-b1-dashboard-tables.md) |
| `/dashboard/users` | pass | pass | pass | pass | [r2-b1-dashboard-tables.md](r2-b1-dashboard-tables.md) |
| `/keys` | pass | pass | pass | pass | [r2-b2-keys-tables.md](r2-b2-keys-tables.md) |
| `/wallet` | pass | pass | pass | pass | [r2-b3-wallet-tables.md](r2-b3-wallet-tables.md) |
| `/profile` | pass | pass | pass | pass | [r2-b13-profile-tables.md](r2-b13-profile-tables.md) |
| `/playground` | pass | pass | pass | pass | [r2-b4-playground-tables.md](r2-b4-playground-tables.md) |
| `/chat/0` | pass | pass | pass | pass | [r2-b5-chat-tables.md](r2-b5-chat-tables.md) |
| `/usage-logs/common` | pass | pass | pass | pass | [r2-b6-usage-logs-tables.md](r2-b6-usage-logs-tables.md) |
| `/usage-logs/drawing` | pass | pass | pass | pass | [r2-b6-usage-logs-tables.md](r2-b6-usage-logs-tables.md) |
| `/usage-logs/task` | pass | pass | pass | pass | [r2-b6-usage-logs-tables.md](r2-b6-usage-logs-tables.md) |
| `/channels` | pass | pass | pass | pass | [r2-b7-channels-tables.md](r2-b7-channels-tables.md) |
| `/users` | pass | pass | pass | pass | [r2-b8-users-tables.md](r2-b8-users-tables.md) |
| `/redemption-codes` | pass | pass | pass | pass | [r2-b9-redemption-tables.md](r2-b9-redemption-tables.md) |
| `/subscriptions` | pass | pass | pass | pass | [r2-b10-subscriptions-tables.md](r2-b10-subscriptions-tables.md) |
| `/models/metadata` | pass | pass | pass | pass | [r2-b11-models-tables.md](r2-b11-models-tables.md) |
| `/models/deployments` | pass | pass | pass | pass | [r2-b11-models-tables.md](r2-b11-models-tables.md) |
| `/console/log` | pass | pass | pass | pass | [r2-00-gap-index.md](r2-00-gap-index.md) |
| `/console/topup` | pass | pass | pass | pass | [r2-00-gap-index.md](r2-00-gap-index.md) |
| `/setup` | pass | pass | pass | pass | [r2-00-gap-index.md](r2-00-gap-index.md) |
| `/system-settings/site/system-info` | pass | pass | pass | pass | [r2-b12-system-settings-tables.md](r2-b12-system-settings-tables.md) |
| `/system-settings/site/notice` | pass | pass | pass | pass | [r2-b12-system-settings-tables.md](r2-b12-system-settings-tables.md) |
| `/system-settings/site/header-navigation` | pass | pass | pass | pass | [r2-b12-system-settings-tables.md](r2-b12-system-settings-tables.md) |
| `/system-settings/site/sidebar-modules` | pass | pass | pass | pass | [r2-b12-system-settings-tables.md](r2-b12-system-settings-tables.md) |
| `/system-settings/auth/basic-auth` | pass | pass | pass | pass | [r2-b12-system-settings-tables.md](r2-b12-system-settings-tables.md) |
| `/system-settings/auth/oauth` | pass | pass | pass | pass | [r2-b12-system-settings-tables.md](r2-b12-system-settings-tables.md) |
| `/system-settings/auth/passkey` | pass | pass | pass | pass | [r2-b12-system-settings-tables.md](r2-b12-system-settings-tables.md) |
| `/system-settings/auth/bot-protection` | pass | pass | pass | pass | [r2-b12-system-settings-tables.md](r2-b12-system-settings-tables.md) |
| `/system-settings/auth/custom-oauth` | pass | pass | pass | pass | [r2-b12-system-settings-tables.md](r2-b12-system-settings-tables.md) |
| `/system-settings/billing/quota` | pass | pass | pass | pass | [r2-b12-system-settings-tables.md](r2-b12-system-settings-tables.md) |
| `/system-settings/billing/currency` | pass | pass | pass | pass | [r2-b12-system-settings-tables.md](r2-b12-system-settings-tables.md) |
| `/system-settings/billing/model-pricing` | pass | pass | pass | pass | [r2-b12-system-settings-tables.md](r2-b12-system-settings-tables.md) |
| `/system-settings/billing/group-pricing` | pass | pass | pass | pass | [r2-b12-system-settings-tables.md](r2-b12-system-settings-tables.md) |
| `/system-settings/billing/payment` | pass | pass | pass | pass | [r2-b12-system-settings-tables.md](r2-b12-system-settings-tables.md) |
| `/system-settings/billing/checkin` | pass | pass | pass | pass | [r2-b12-system-settings-tables.md](r2-b12-system-settings-tables.md) |
| `/system-settings/content/dashboard` | pass | pass | pass | pass | [r2-b12-system-settings-tables.md](r2-b12-system-settings-tables.md) |
| `/system-settings/content/announcements` | pass | pass | pass | pass | [r2-b12-system-settings-tables.md](r2-b12-system-settings-tables.md) |
| `/system-settings/content/api-info` | pass | pass | pass | pass | [r2-b12-system-settings-tables.md](r2-b12-system-settings-tables.md) |
| `/system-settings/content/faq` | pass | pass | pass | pass | [r2-b12-system-settings-tables.md](r2-b12-system-settings-tables.md) |
| `/system-settings/content/uptime-kuma` | pass | pass | pass | pass | [r2-b12-system-settings-tables.md](r2-b12-system-settings-tables.md) |
| `/system-settings/content/chat` | pass | pass | pass | pass | [r2-b12-system-settings-tables.md](r2-b12-system-settings-tables.md) |
| `/system-settings/content/drawing` | pass | pass | pass | pass | [r2-b12-system-settings-tables.md](r2-b12-system-settings-tables.md) |
| `/system-settings/models/global` | pass | pass | pass | pass | [r2-b12-system-settings-tables.md](r2-b12-system-settings-tables.md) |
| `/system-settings/models/gemini` | pass | pass | pass | pass | [r2-b12-system-settings-tables.md](r2-b12-system-settings-tables.md) |
| `/system-settings/models/claude` | pass | pass | pass | pass | [r2-b12-system-settings-tables.md](r2-b12-system-settings-tables.md) |
| `/system-settings/models/grok` | pass | pass | pass | pass | [r2-b12-system-settings-tables.md](r2-b12-system-settings-tables.md) |
| `/system-settings/models/channel-affinity` | pass | pass | pass | pass | [r2-b12-system-settings-tables.md](r2-b12-system-settings-tables.md) |
| `/system-settings/models/model-deployment` | pass | pass | pass | pass | [r2-b12-system-settings-tables.md](r2-b12-system-settings-tables.md) |
| `/system-settings/operations/behavior` | pass | pass | pass | pass | [r2-b12-system-settings-tables.md](r2-b12-system-settings-tables.md) |
| `/system-settings/operations/monitoring` | pass | pass | pass | pass | [r2-b12-system-settings-tables.md](r2-b12-system-settings-tables.md) |
| `/system-settings/operations/email` | pass | pass | pass | pass | [r2-b12-system-settings-tables.md](r2-b12-system-settings-tables.md) |
| `/system-settings/operations/worker` | pass | pass | pass | pass | [r2-b12-system-settings-tables.md](r2-b12-system-settings-tables.md) |
| `/system-settings/operations/logs` | pass | pass | pass | pass | [r2-b12-system-settings-tables.md](r2-b12-system-settings-tables.md) |
| `/system-settings/operations/performance` | pass | pass | pass | pass | [r2-b12-system-settings-tables.md](r2-b12-system-settings-tables.md) |
| `/system-settings/operations/update-checker` | pass | pass | pass | pass | [r2-b12-system-settings-tables.md](r2-b12-system-settings-tables.md) |
| `/system-settings/security/rate-limit` | pass | pass | pass | pass | [r2-b12-system-settings-tables.md](r2-b12-system-settings-tables.md) |
| `/system-settings/security/sensitive-words` | pass | pass | pass | pass | [r2-b12-system-settings-tables.md](r2-b12-system-settings-tables.md) |
| `/system-settings/security/ssrf` | pass | pass | pass | pass | [r2-b12-system-settings-tables.md](r2-b12-system-settings-tables.md) |

## 最终完成定义核对

1. Phase A 全部组件 Design Lab 可演示且被页面实际消费(A1–A5 review + C1 消费方扫描:StatCard 10 页、Panel/SettingRow/FilterTabs/RowActions 等全覆盖)— ✅
2. Phase B 每页《结构对照表》全行 pass/adapted、《功能保全清单》全勾(B1–B15 review)— ✅
3. 矩阵 v2 全路由 pass(含「结构对照」列;2 个预期 flag 如上判定)— ✅
4. typecheck / lint(98 存量,无新增)/ build / i18n:sync 全过(C1)— ✅
5. 无绕过组件库的一次性样式(C1 扫描清零/收敛)、无静默跳过的设计稿 section(全部 adapted 决策入表)— ✅
6. 全部 review 记录与截图归档并 push — ✅(本 commit)

**Round 2 完成。**
