# r2-B11 结构对照表 — /models/metadata|deployments

设计基准:`SCREENS.settingsModels` catalog 表(screens-admin2.js:43-62)+ `SCREENS.marketplace` 词汇

## 结构对照表

| # | 设计稿 section | 现状 | 目标实现 | 必做交互 | 适配决策 |
|---|---|---|---|---|---|
| 1 | catalog 表:Model(avatar+名+mono id 副行)、定价 mono、Enabled Switch、Edit | 13 列 | metadata 列:model_name → CellFlex(现有 icon 为 leading + 名主行 + vendor/匹配规则 mono 副行,与 icon/name_rule 列整合或并存);status → 行内 Switch(现有启停 mutation;无则保留 badge 并记录);actions → RowActions(Edit + More) | Switch、hover | **Input/Output per 1M 定价列:定价数据在 system-settings ratio 体系,不在 metadata 接口 → 不加列(已记录)**;倍率同理 |
| 2 | panel-head search + Sync rates | 搜索 + SyncWizard | 保留(SyncWizardDialog 即 Sync 入口) | — | — |
| 3 | deployments 表 + 状态 badge | 11 列 | status → StatusBadge soft(running=success/stopped=danger/pending=warning 词汇映射);时间/数值列 MonoCell;actions → RowActions(More 收纳全部) | hover | — |
| 4 | 连接守卫 InlineAlert 形态 | LoadingStep + retry | deployment-access-guard:错误/未启用态用 InlineAlert(warning/danger)+ 操作按钮(Retry / Go to settings);加载态保留 | retry | — |
| 5 | Create deployment Drawer SettingsPanel 化 | 4 分区 | 分区套 SettingsPanel(eyebrow=Basic/Hardware/Duration/Advanced) | — | 字段/校验不动 |

## 功能保全清单

| # | 旧功能 | 复验 |
|---|---|---|
| 1 | metadata 13 列 + status/vendor/sync 过滤 + 搜索 | ☑ |
| 2 | Create/Edit Model Drawer + vendor 管理 | ☑ |
| 3 | SyncWizard(源/语言/预览 diff/冲突)+ MissingModels + UpstreamConflict dialogs | ☑ |
| 4 | 批量启停/删除 | ☑ |
| 5 | deployments 11 列 + dStatus 过滤 | ☑ |
| 6 | 部署操作:日志/详情/配置/扩容/重命名/删除 dialogs | ☑ |
| 7 | Create deployment Drawer(4 分区校验) | ☑ |
| 8 | DeploymentAccessGuard(设置/连接两阶段 + retry + go-to-settings) | ☑ |
| 9 | metadata/deployments section tabs + admin 守卫 | ☑ |
| 10 | 移动端 | ☑ |
