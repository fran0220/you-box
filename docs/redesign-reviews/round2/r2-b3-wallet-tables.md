# r2-B3 结构对照表 — /wallet

设计基准:`SCREENS.credits`(screens-console.js:170-197)+ `SCREENS.redemption` 用户侧输入形态(screens-console2.js:262-275)

## 结构对照表

| # | 设计稿 section | 现状 | 目标实现(组件 + 文件) | 必做交互 | 适配决策 |
|---|---|---|---|---|---|
| 1 | 两列 1.3fr/1fr(左:hero+充值;右:auto top-up+transactions) | stats 行 + 左右卡 | `features/wallet/index.tsx` 重排为 `xl:grid-cols-[1.3fr_1fr]`;左列 = Balance hero + Add credits;右列 = Transactions + 订阅卡 + Affiliate 卡 | — | 订阅/Affiliate 为现有能力,排进右列 |
| 2 | Balance hero Panel:`// balance` eyebrow + display 46px 余额 + token 估算 + 健康 delta + days-left | WalletStatsCard 三卡 | 新 `balance-hero-card.tsx`:Panel + Eyebrow + display 余额(formatQuota)+ 副行(总消费/请求数 mono,吸收原三卡信息)+ DeltaBadge 健康(burn-rate 由 7d 用量估算 runway) | — | **`≈ 82M tokens` 估算无混合费率 → 副行改为 Used/Requests Metric**(原三卡信息保全) |
| 3 | Add credits Panel:PresetChip 金额(可选中)+ CurrencyInput + `// pay with` ChipGroup + `Add $50.00 →` 联动 CTA + No markup badge | RechargeFormCard(按钮列表) | 重构 `recharge-form-card.tsx`:patterns Chip(size=preset)金额预设(读现有 preset 配置)+ CurrencyInput(自定义金额)+ Eyebrow `pay with` + ChipGroup(现有支付方式映射:在线/Stripe/Creem/Waffo…)+ 主 CTA 文案随金额/方式联动并触发现有确认 dialog 流程 | chip 选中、金额联动 CTA、键盘 | 货币 select 固定站点货币(无多币种)→ 仅显示标签;No markup badge 不做(无此承诺数据) |
| 4 | Auto top-up Panel(switch + ≤$25/+$50) | 无 | **不实现**(后端无自动充值;不做假开关) | — | 🔵 已记录:隐藏;ThresholdInput 组件已在 A3 备好,后端具备后接入 |
| 5 | Transactions Panel:TransactionRow 方向色列表 + 查看全部 | BillingHistoryDialog 弹窗 | 新 `transactions-card.tsx`:Panel + TransactionRow(最近 5 条,topup 历史映射 in;状态非成功的显示状态)+ `View all` 打开既有 BillingHistoryDialog | View all、`?show_history=true` 兼容 | 消费方向(usage out)无逐条流水接口 → 列表 = 充值订单历史(已记录) |
| 6 | 兑换码输入(SCREENS.redemption 形态) | RechargeFormCard 内输入+按钮 | 保留在 Add credits Panel 内,mono input + Redeem 按钮(成功 InlineAlert success 反馈) | 兑换成功反馈 | 用户侧无独立 /redemption 路由 → 形态并入 wallet(已记录) |
| 7 | 订阅计划卡 / Affiliate | SubscriptionPlansCard / AffiliateRewardsCard | 右列保留;订阅卡内计划展示用 patterns PlanCard 形态重排(current/Choose) | 划转 dialog 保留 | 用户当前订阅视图(B10 联动)在此承载 |

## 功能保全清单

| # | 旧功能 | 旧入口 | 新入口 | 复验 |
|---|---|---|---|---|
| 1 | 三卡统计(余额/总消费/请求数) | WalletStatsCard | Balance hero(余额 display + Used/Requests Metric) | ☑ |
| 2 | 预设金额选择 + 自定义金额 + 金额计算(calculatePaymentAmount) | RechargeFormCard | PresetChip + CurrencyInput(逻辑不变) | ☑ |
| 3 | 四种支付确认流程(Online/Epay、Stripe、Creem→CreemConfirmDialog、Waffo Pancake) | 支付按钮 | pay-with ChipGroup + CTA → 原 dialog 流程 | ☑ |
| 4 | Waffo 方式索引选择(onWaffoMethodSelect) | 按钮 | chip 映射保留 | ☑ |
| 5 | 兑换码(POST /api/user/topup) | 输入+按钮 | 保留 | ☑ |
| 6 | 推荐奖励卡 + 划转 dialog(aff_quota) | AffiliateRewardsCard | 右列保留 | ☑ |
| 7 | 账单历史 dialog(搜索/筛选/分页/admin 完成订单) | 链接 | Transactions Panel `View all` + `?show_history=true` 兼容 | ☑ |
| 8 | 订阅计划卡(SubscriptionPlansCard 购买流程) | 右列 | PlanCard 形态重排,流程不变 | ☑ |
| 9 | min_topup / 折扣展示 | RechargeFormCard | 保留 | ☑ |
| 10 | loading skeleton | 各卡 | 保留 | ☑ |
