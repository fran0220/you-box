# r2-B6 结构对照表 — /usage-logs/* + NotificationPopover

设计基准:`SCREENS.usageLogs`(screens-console.js:144-167)+ `SCREENS.notifications`(screens-console2.js:315-330)

## 结构对照表(usage-logs)

| # | 设计稿 section | 现状 | 目标实现 | 必做交互 | 适配决策 |
|---|---|---|---|---|---|
| 1 | 页头:title + 副标题 + Filters + Export CSV | 无副标题 | index.tsx 副标题行(`Every request routed through your keys…`) | — | **Export CSV 无后端 → 不做(已记录)**;Filters 即现有筛选区 |
| 2 | FilterBar 单行(search + 下拉) | primary+advanced 折叠条 | 保留现有 CommonLogsFilterBar 结构(字段为设计超集:时间/类型/模型/分组/token/admin 字段),仅做形态核对 | 筛选/重置 | 现有折叠式 advanced 保留(字段多于设计,单行放不下)——显式适配 |
| 3 | 表格列规范:Time mono、Model cellflex、Tokens/Cost 右对齐 mono、Status 语义 badge | 列存在但形态混杂 | `common-logs-columns.tsx`:created_at → MonoCell 风格(时间 HH:MM:SS 主行 + 日期副行)+ 类型 badge 改 StatusBadge soft;model_name → CellFlex(avatar initials);prompt/completion tokens + quota → MonoCell 右对齐;表头右对齐对应列 | 排序/筛选保留 | endpoint 列无数据 → 不加(已在 gap index 记录);latency 列无逐请求数据 → 不加 |
| 4 | 表尾分页 | DataTable 分页 | 保留 | — | — |
| 5 | drawing/task 同构 | tabs 已同构 | 不动(列规范主要落 common) | — | drawing/task 列形态沿用(数据特化列多,记录) |
| 6 | 详情 Panel + CodeBlock | DetailsDialog 完备 | DetailsDialog 内 JSON/原始数据展示改用 ai-elements CodeBlock(title='response.json' 形态);其余分区保留 | copy | 仅替换代码态展示,业务分区不动 |

## 结构对照表(NotificationPopover)

| # | 设计稿 section | 现状 | 目标实现 | 必做交互 | 适配决策 |
|---|---|---|---|---|---|
| 7 | FilterChips(All/Unread/分类+计数) | notice/announcements 两 tab | patterns `FilterChips`:All / Notice / Announcements(+计数:announcements 数量;unread 计数沿用现 unreadCount) | chip 切换 | **数据模型仅 notice(单文)+announcements(数组)→ 分类 = 这两类;Unread 维度无逐条已读模型 → 不做 Unread chip(已记录)** |
| 8 | NotificationGroup 日期分组 + NotificationItem | markdown 流 | announcements 用 patterns `NotificationItem`(tone=按 type 映射,icon,title=首行/类型,body=markdown,time=publishDate 相对时间)+ 按日期 `NotificationGroup`(today/earlier);notice 单条渲染为 NotificationItem(info) | 展开阅读(点击弹现有详情或内联) | extra 字段并入 body |
| 9 | Mark all read / Preferences | 无 | Mark all read:沿用现有 unread 清零机制(若仅为本地状态则点击置零);Preferences ❌(无用户通知偏好后端)→ 不做(已记录) | mark all read | — |

## 功能保全清单

| # | 旧功能 | 旧入口 | 新入口 | 复验 |
|---|---|---|---|---|
| 1 | 9+ 筛选字段(时间/类型/模型/分组/token/username/channel/request id/upstream id) | filter bar | 保留 | ☑ |
| 2 | 列显隐 ViewOptions | toolbar | 保留 | ☑ |
| 3 | UserInfoDialog(点用户) | 列 | 保留 | ☑ |
| 4 | DetailsDialog 全分区(计时/计费/缓存/审计/admin) | Details 列 | 保留(代码态 CodeBlock 化) | ☑ |
| 5 | prompt/image/audio/fail-reason dialogs(drawing/task) | 列 | 保留 | ☑ |
| 6 | CacheStatsDialog | 入口 | 保留 | ☑ |
| 7 | 移动端 Drawer 筛选 + 卡片列表 | mobile | 保留 | ☑ |
| 8 | admin 守卫列(channel/user) | 列 | 保留 | ☑ |
| 9 | 三 section tabs(common/drawing/task) | tabs | 保留 | ☑ |
| 10 | 通知:notice markdown + announcements 列表 + unread 徽章 | popover | FilterChips + NotificationItem/Group 形态 | ☑ |
