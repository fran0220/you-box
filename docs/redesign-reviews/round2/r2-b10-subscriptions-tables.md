# r2-B10 结构对照表 — /subscriptions

设计基准:`SCREENS.subscriptions`(screens-console2.js:236-259)

**适配前提(经 review 确认)**:现页为**管理员计划管理**,设计稿为**用户当前订阅视图**。管理表不得删;用户侧「当前计划 + 用量」形态由 wallet 订阅卡承载(B3 已完成 PlanCard 化)。本步 = 管理页升级 + PlanCard 预览。

## 结构对照表

| # | 设计稿 section | 现状 | 目标实现 | 必做交互 | 适配决策 |
|---|---|---|---|---|---|
| 1 | 当前计划 hero / This period's usage / Invoices | 不适用(管理视角) | 不实现 | — | 🔵 用户订阅视图数据模型在 wallet(B3 SubscriptionPlansCard 的 My Subscriptions 块);已记录 |
| 2 | Available plans PlanCard 列表 | 无预览 | 表格上方/旁加「计划预览」Panel:启用计划按 sort_order 渲染 PlanCard(name/price/unit=duration/description=subtitle,无 current 概念 → 不标 current);作为管理员所见的用户侧形态预览,可折叠 | 折叠 | 预览只读 |
| 3 | 管理表升级 | 9+ 列 DataTable | statHeader StatCardRow(3,sm):Total plans(total)/ Enabled(当前页 enabled 计数)/ MRR 无数据 → Price 合计?改 Active price range?→ 用 Enabled value(当前页启用计划价格合计 $);列:price → MonoCell;enabled → 行内 Switch(调用现有 toggle,合规门控时 disabled);actions → RowActions(Edit + More) | Switch、hover | 合规门控 alert 保留 |
| 4 | 合规门控 | Alert ×2 | InlineAlert(warning)形态统一 | — | 文案不变 |

## 功能保全清单

| # | 旧功能 | 复验 |
|---|---|---|
| 1 | 9+ 列管理表 | ☑ |
| 2 | Mutate Drawer(价格/时长/配额重置/支付产品/限购/分组/排序;Pancake 产品创建) | ☑ |
| 3 | 启停 toggle dialog | ☑ |
| 4 | 合规门控(未确认时创建/编辑/启停 disabled) | ☑ |
| 5 | Stripe/Creem 提示 alert | ☑ |
| 6 | admin 守卫(403) | ☑ |
