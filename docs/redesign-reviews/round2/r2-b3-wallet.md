# R2-B3 Review — Wallet 重做

- branch:`redesign/youbox-frontend-100`
- 前置文档:`r2-b3-wallet-tables.md`

## 结构对照表验收

| # | 设计稿 section | 结果 |
|---|---|---|
| 1 | 两列 1.3fr/1fr | **pass** — `xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]`;左 hero+充值,右 Transactions+订阅+Affiliate;全部 dialog 装配保留 |
| 2 | Balance hero | **pass/adapted** — Panel + `// balance` eyebrow + display 40px 余额 + Used/Requests Metric(原三卡信息并入)+ 健康 DeltaBadge(7d 用量 runway)+ `~N days at current rate`;token 估算无混合费率 → Metric 替代(已记录);实测兑换后余额实时更新($200→$201) |
| 3 | Add credits | **pass/adapted** — PresetChip(含折扣角标)+ CurrencyInput + `// pay with` ChipGroup(method:/waffo:/creem: 编码,min_topup 不足 disabled)+ `Add {{amount}} →` 联动 CTA(选中才触发原四种支付确认流程);货币 select → 静态站点货币;No markup badge 不做(已记录)。本验证实例未配置任何支付方式 → 正确渲染「Online topup is not enabled」InlineAlert(空态/禁用态即设计的 InlineAlert 形态);chips 完整形态已在 Design Lab A3 验收 |
| 4 | Auto top-up | **adapted(不实现)** — 后端无能力,不做假开关;已记录 |
| 5 | Transactions Panel | **pass/adapted** — TransactionRow 前 5 条 + View all → BillingHistoryDialog;`?show_history=true` 实测打开 dialog;消费流水无接口 → 充值订单历史(已记录) |
| 6 | 兑换码(SCREENS.redemption 形态) | **pass** — `// redeem code` eyebrow + mono input + Redeem;合规未确认时 warning InlineAlert 门控;实测确认合规后表单出现,创建码→兑换成功 toast + 余额更新 |
| 7 | 订阅/Affiliate 右列 | **pass** — SubscriptionPlansCard 列表项 PlanCard 化(购买流程不变),AffiliateRewardsCard 保留(划转 dialog 保留) |

## 功能保全清单复验

tables 文档 10 项全 ☑;重点实测:兑换码全流程(admin 生成 → 用户兑换 → toast + 余额)、`?show_history=true`、合规门控 InlineAlert、账单历史 dialog。删除:`wallet-stats-card.tsx`(并入 hero)、`creem-products-section.tsx`(并入 pay-with chips)。

## 浏览器审查

dark/light @1280 全页、redeem 表单/兑换成功、history dialog、移动端 375(无溢出);无 page error。截图:`screenshots/r2-b3/`。

## 验证命令

typecheck pass;i18n:sync(8 键 × 6 语言,missing 0);copyright pass;改动文件 eslint 无新告警。

## 结论

**pass** — 进入 R2-B4。
