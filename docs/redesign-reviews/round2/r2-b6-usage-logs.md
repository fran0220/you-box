# R2-B6 Review — Usage Logs + 通知重做

- branch:`redesign/youbox-frontend-100`
- 前置文档:`r2-b6-usage-logs-tables.md`

## 结构对照表验收

| # | 设计稿 section | 结果 |
|---|---|---|
| 1 | 页头副标题 + Export | **pass/adapted** — 副标题落地;Export CSV 无后端 → 不做(已记录) |
| 2 | FilterBar | **pass/adapted** — 现有 primary+advanced 折叠条保留(字段超集),实测筛选区 + Usage/RPM/TPM 统计条正常 |
| 3 | 列规范 | **pass/adapted** — created_at = mono `HH:MM:SS` + 日期副行 + StatusBadge soft 类型徽章(实测 Top-up);model = CellFlex(avatar initials,保留复制/mapping popover);Tokens/Cost = MonoCell 右对齐 + 表头右对齐;endpoint/latency 列无逐请求数据 → 不加(已记录) |
| 4-5 | 分页 / 三 section | **pass** — 保留 |
| 6 | 详情 CodeBlock | **pass/adapted** — 现状无原始 JSON 块 → 在计费明细后加 Collapsible CodeBlock(`detail.json` chrome 形态),DetailSection 全保留 |
| 7 | FilterChips | **pass/adapted** — All(计数)/Notice/Announcements(计数)替代两 tab(实测 3 chips);Unread chip 无逐条已读模型于分类维度 → 不做(已记录) |
| 8 | NotificationItem/Group | **pass** — announcements 按日期 today/earlier 分组,type→tone/icon 映射,Markdown body,extra 并入;notice = info+Bell 单条(实测渲染) |
| 9 | Mark all read / Preferences | **pass/adapted** — 已读机制真实存在(zustand persist 逐条签名),新增 `markAllRead()` 接入 hook 与两个 header 消费方;Preferences 无后端 → 不做(已记录) |

## 功能保全清单复验

tables 10 项全 ☑:9+ 筛选字段、ViewOptions、UserInfoDialog、DetailsDialog 全分区、drawing/task dialogs、CacheStatsDialog、移动端 Drawer+卡片、admin 守卫列、三 section tabs、notice/announcements + unread 徽章(打开即读行为保留)。

## 浏览器审查

dark/light @1280(实测兑换产生的 Top-up 日志:mono 时间 + soft 徽章);通知 popover(notice 配置后 FilterChips + NotificationItem);无 page error。截图:`screenshots/r2-b6/`。

## 验证命令

typecheck pass;i18n:sync(8 键,missing 0);copyright pass;7 改动文件 eslint 0 告警。

## 结论

**pass** — 进入 R2-B7。
