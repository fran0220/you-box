# r2-B2 结构对照表 — /keys

设计基准:`SCREENS.keys`(screens-console.js:75-99)

## 结构对照表

| # | 设计稿 section | 现状 | 目标实现(组件 + 文件) | 必做交互 | 适配决策 |
|---|---|---|---|---|---|
| 1 | 页头:title + 副标题 + Docs + Create API key | 标题 + 创建按钮 | `features/keys/index.tsx`:Content 顶部副标题行;Docs 按钮仅当 status 配置有文档地址(`useStatus` docs_link/about?),否则省略并记录;Create 保留 | Create 打开 Drawer | **Docs:读 `status.docs_link`(若字段存在),无配置 → 不渲染** |
| 2 | 3 列 StatCard(Active keys / Monthly spend / Requests today) | 无 | DataTablePage `statHeader` + patterns StatCardRow(3)/StatCard(sm);Active keys = 表数据中 status=enabled 计数;Spend(7d)与 Requests today 来自 `getUserQuotaDates`(7d/1d 窗口) | loading 骨架 | **Monthly spend 后端无按月聚合 → 改 7 日消费并标注 label**;Requests today = 1d count 合计 |
| 3 | new-key InlineAlert + SecretReveal(一次性) | 创建后 dialog 展示 | 创建成功后页内 InlineAlert(brand,title「copy it now」)+ SecretReveal(defaultRevealed)+ 关闭按钮;由 keys provider/state 持有 last created key,刷新即消失 | copy 反馈、关闭 | 保留安全语义:完整 key 仅本次会话展示一次 |
| 4 | 表格:Name(主+mono key 副行)、Models tag、Spend `of limit`+ProgressBar、Status badge、Last used、hover rowact(copy/edit/delete) | 12 列 DataTable | `api-keys-columns.tsx`:name 列改 CellFlex(主名 + mono 遮罩 key 副行,合并现 name+key 两列信息);quota 列改 `$used of $limit` mono + patterns ProgressBar(unlimited → `∞` 文案无进度);status 列 StatusBadge soft;accessed_time 改 MonoCell muted;actions 改 RowActions(Copy key icon + Edit icon + 既有 dropdown 收进 More icon) | hover 显现、copy 反馈 | 其余列(group/model_limits/allow_ips/created/expired/select)保留不删,默认列显隐沿用 |
| 5 | FilterBar:search + 状态过滤 | toolbar(search+faceted) | 保留 DataTableToolbar(search/status/token 搜索能力为设计超集) | 搜索/过滤 | 不降级现有过滤能力 |

## 功能保全清单

| # | 旧功能 | 旧入口 | 新入口 | 复验 |
|---|---|---|---|---|
| 1 | 12 列(select/name/status/key/quota/group/model_limits/allow_ips/created/accessed/expired/actions) | 表格 | 保留(name+key 合并为 CellFlex,信息不丢) | ☑ |
| 2 | name + token 双搜索 | toolbar | 保留 | ☑ |
| 3 | status 过滤(enabled/disabled/expired/exhausted) | toolbar | 保留 | ☑ |
| 4 | 批量复制 keys / 批量删除 | bulk actions | 保留 | ☑ |
| 5 | Mutate Drawer 8 字段(name/quota/unlimited/expired/model_limits/allow_ips/group/cross_group_retry) | Drawer | 保留 | ☑ |
| 6 | 行操作:Copy Key / Copy Connection Info / Edit / CC Switch / Chat / Delete / 启停 | dropdown | Copy/Edit 上提为 icon,其余收进 More dropdown,逐项保留 | ☑ |
| 7 | 删除 dialog(单/多) | dialog | 保留 | ☑ |
| 8 | 移动端卡片列表 + skeleton | mobile | 保留 | ☑ |
| 9 | 空态(No API Keys Found) | TableEmpty | 保留 | ☑ |
| 10 | 创建后展示 key | dialog | InlineAlert + SecretReveal(页内) | ☑ |
