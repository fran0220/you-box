# Round 2 — 交互与页面结构重做 审查记录索引

计划:`docs/youbox-frontend-round2-interaction-redesign-plan.md`。每步:《结构对照表》+《功能保全清单》前置入库 →实现→ 浏览器验收 → review 记录 → commit → push。

## Phase 0

| 步骤 | 记录 | 结论 |
|---|---|---|
| R2-00 差距定版 | [r2-00-gap-index.md](r2-00-gap-index.md) · [r2-00-review.md](r2-00-review.md) | pass |
| R2-01 Design Lab | [r2-01-design-lab.md](r2-01-design-lab.md) | pass |

## Phase A — 组件

| 步骤 | 记录 | 结论 |
|---|---|---|
| R2-A1 数据展示族 | [r2-a1-data-display.md](r2-a1-data-display.md) | pass |
| R2-A2 表格体系 v2 | [r2-a2-table-v2.md](r2-a2-table-v2.md) | pass |
| R2-A3 表单与设置族 | [r2-a3-settings-forms.md](r2-a3-settings-forms.md) | pass |
| R2-A4 反馈与状态族 | [r2-a4-feedback-status.md](r2-a4-feedback-status.md) | pass |
| R2-A5 代码与 AI 会话族 | [r2-a5-ai-code.md](r2-a5-ai-code.md) | pass |

## Phase B — 页面(对照表 tables.md + review)

| 步骤 | 对照表 | review | 结论 |
|---|---|---|---|
| B1 Dashboard | [tables](r2-b1-dashboard-tables.md) | [review](r2-b1-dashboard.md) | pass |
| B2 Keys | [tables](r2-b2-keys-tables.md) | [review](r2-b2-keys.md) | pass |
| B3 Wallet | [tables](r2-b3-wallet-tables.md) | [review](r2-b3-wallet.md) | pass |
| B4 Playground | [tables](r2-b4-playground-tables.md) | [review](r2-b4-playground.md) | pass |
| B5 Chat shell | [tables](r2-b5-chat-tables.md) | [review](r2-b5-chat.md) | pass |
| B6 Usage Logs + 通知 | [tables](r2-b6-usage-logs-tables.md) | [review](r2-b6-usage-logs.md) | pass |
| B7 Channels | [tables](r2-b7-channels-tables.md) | [review](r2-b7-channels.md) | pass |
| B8 Users | [tables](r2-b8-users-tables.md) | [review](r2-b8-users.md) | pass |
| B9 Redemption | [tables](r2-b9-redemption-tables.md) | [review](r2-b9-redemption.md) | pass |
| B10 Subscriptions | [tables](r2-b10-subscriptions-tables.md) | [review](r2-b10-subscriptions.md) | pass |
| B11 Models 管理 | [tables](r2-b11-models-tables.md) | [review](r2-b11-models.md) | pass |
| B12 System Settings(a–e) | [tables](r2-b12-system-settings-tables.md) | [shell](r2-b12a-settings-shell.md) · [汇总](r2-b12-system-settings.md) | pass |
| B13 Profile | [tables](r2-b13-profile-tables.md) | [review](r2-b13-profile.md) | pass |
| B14 营销深化 | [tables](r2-b14-marketing-depth-tables.md) | [review](r2-b14-marketing-depth.md) | pass |
| B15 缺口收尾 | (缺口=gap-index 第三节) | [review](r2-b15-closing-gaps.md) | pass |

## Phase C — 收口

| 步骤 | 记录 | 结论 |
|---|---|---|
| C1 全局一致性 | [r2-c1-consistency.md](r2-c1-consistency.md) | pass |
| C2 最终验收矩阵 v2 | [r2-c2-final-matrix.md](r2-c2-final-matrix.md) | 见记录 |

截图:`screenshots/r2-XX/`。验证环境:Go 后端(SQLite/self-use)`:3001` + `bun run dev`(`:3000`,proxy)。
