# R2-A4 Review — 反馈与状态组件族

- branch:`redesign/youbox-frontend-100`
- 落点:`src/components/patterns/` + `src/components/status-badge.tsx` 扩展

## 组件交付与解剖

| 组件 | 解剖 / variants / states |
|---|---|
| `InlineAlert` | subtle 语义面板(success/warning/danger/info/brand)+ tone icon(可覆盖/可隐藏)+ title/body + actions 插槽;danger/warning=role:alert,余 role:status;demo 含 new-key 组合(brand + SecretReveal + Done) |
| `SecretReveal` | code-bg mono 字段 + 遮罩(自动推导 `前7+••••+后4` 或自定义)+ eye 显隐切换(aria-pressed)+ CopyButton(copied 反馈);`defaultRevealed`(创建后一次性展示)、`hideToggle`(严格一次) |
| `StatusBadge` 扩展 | 新增 `appearance='text'(默认,兼容存量)/'soft'(subtle pill + dot + mono,表格 v2 标准)/'solid'`;新增 `statusVariantFor()` 词汇映射:2xx/Active/Operational/Paid→success、4xx/Limited/Degraded/Expired→warning、5xx/Revoked/Down/Banned→danger;存量消费方 API 不变 |
| `StepIndicator` | done(success 勾)/active(brand)/pending(surface-3)圆点 + divider 连接线 + label;`aria-current=step`;ol/li 语义 |
| `NotificationItem` | 语义色 icon tile(brand/success/warning/danger/info/accent)+ title + body + mono 时间 + unread dot;unread 行 surface-2 |
| `NotificationGroup` | eyebrow 日期分组(`// today`)+ 分隔线 |
| `FilterChips` | pill 单选 chip + mono 计数,继承 ChipGroup radio 语义与键盘行为 |
| `PlanCard` | 名称/描述 + display 价格 + unit;`current`(brand 边框/底 + current badge)vs `action`(Choose 按钮插槽) |
| `TransactionRow` | title + mono 日期副行 + 方向色 mono 金额(in=success/out=muted) |
| `InvoiceRow` | 期次 + mono 金额 + status badge 插槽 + 尾部 action(下载) |

## 门槛核对

| 门槛 | 结果 |
|---|---|
| Design Lab 全演示 | pass — `feedback` 分组 7 个 DemoBlock 覆盖全部 variants/states(含 SCREENS.keys new-key、notifications、subscriptions invoices 组合形态) |
| typecheck / i18n:sync | pass(SecretReveal/PlanCard 文案走 `t()`) |
| 交互验证(playwright) | pass — SecretReveal 遮罩→reveal→copy;StepIndicator advance(active=Site config);FilterChips 选择 Unread;无 page error |

## 浏览器审查

截图:`screenshots/r2-a4/`:`feedback-{dark,light}-1280-{top,mid,bottom}.png`、`step-indicator-advanced.png`。

## 结论

**pass** — 进入 R2-A5。
