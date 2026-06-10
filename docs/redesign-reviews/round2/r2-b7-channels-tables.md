# r2-B7 结构对照表 — /channels

设计基准:`SCREENS.channels`(screens-admin.js:12-31)

## 结构对照表

| # | 设计稿 section | 现状 | 目标实现 | 必做交互 | 适配决策 |
|---|---|---|---|---|---|
| 1 | 页头:title + 副标题 + Test all + Add channel | PrimaryButtons 区(创建/标签模式/ID 排序/测试全部/更新余额/修复/删除禁用) | 副标题行;主操作区:Add channel(primary)+ Test all(secondary)上提,其余批量运维操作收进 More dropdown(逐项保留) | 全部操作可达 | 7 个页级操作不删,层级重排 |
| 2 | 4 列 StatCard(Total/Healthy/Degraded/Offline) | 无 | DataTablePage statHeader:由当前页渠道数据聚合(Total=列表总数 total;Healthy=enabled 且 response_time<阈值或未测;Degraded=enabled 且慢;Offline=禁用/自动禁用)sm StatCard + icon | loading | 🔵 聚合基于当前已加载列表(无全局健康统计接口,已记录);阈值与 LatencyBadge 一致(≤3s) |
| 3 | tabs(All/Enabled/Issues)+ search | faceted filter(status/type/group/model) | FilterTabs(All/Enabled/Issues)接 status 过滤:Enabled=status 1;Issues=status 2/3(手动/自动禁用);现有 faceted filter 与搜索保留 | tabs 切换过滤 | Issues 语义=禁用渠道(无逐渠道错误率,已记录) |
| 4 | 表格:Channel cellflex、Models tag、Priority mono、Balance、Latency badge、Enabled Switch、rowact | 14 列 | channels-columns:name → CellFlex(类型 icon 为 leading,name 主行 + 类型名 mono 副行,与现有 type 列并存或合并);response_time → LatencyBadge(ms 阈值);status → 行内 Switch(size sm,切换调用现有启停逻辑;聚合行例外保留 badge);balance → MonoCell;actions → RowActions(Test/Edit 上提 icon + 原 dropdown More);priority/weight 内联编辑保留 | Switch 启停、hover actions | 列超集(id/weight/tag/group/test_time/remark)全保留 |
| 5 | Drawer 内 SettingsPanel 体系 | 多 section 表单 | channel-mutate-drawer:各分区(basic/auth/model/advanced/settings)套 SettingsPanel(eyebrow=分区名)形态;字段与校验不动 | — | 仅容器形态,不重写字段 |

## 功能保全清单(16 dialog/drawer 逐项)

| # | 项 | 复验 |
|---|---|---|
| 1 | ChannelMutateDrawer(创建/编辑,5 分区表单) | ☑ |
| 2 | ChannelTestDialog(模型选择/请求响应) | ☑ |
| 3 | BalanceQueryDialog(查询/手动更新/Codex usage) | ☑ |
| 4 | FetchModelsDialog(上游拉模型/去重/冲突) | ☑ |
| 5 | OllamaModelsDialog | ☑ |
| 6 | CopyChannelDialog(suffix/重置余额) | ☑ |
| 7 | MultiKeyManageDialog(统计卡/分页/启停删) | ☑ |
| 8 | TagBatchEditDialog | ☑ |
| 9 | EditTagDialog | ☑ |
| 10 | UpstreamUpdateDialog(Add/Remove tab) | ☑ |
| 11 | CodexUsageDialog | ☑ |
| 12 | CodexOAuthDialog | ☑ |
| 13 | ParamOverrideEditorDialog(条件编辑器) | ☑ |
| 14 | StatusCodeRiskDialog | ☑ |
| 15 | MissingModelsConfirmationDialog | ☑ |
| 16 | MultiKey 行操作 | ☑ |
| 17 | 标签聚合模式(localStorage)+ 聚合行展开 + 聚合行批量更新确认 | ☑ |
| 18 | 批量启/停/删/设标签(bulk actions) | ☑ |
| 19 | Test all / Update balances / Fix abilities / Delete disabled / ID 排序 / 标签模式开关 | ☑ |
| 20 | status/type/group/model 过滤 + 搜索 | ☑ |
| 21 | priority/weight 内联编辑(含聚合行) | ☑ |
| 22 | 移动端卡片 + pageSize 切换 | ☑ |
