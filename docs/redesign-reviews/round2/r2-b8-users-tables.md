# r2-B8 结构对照表 — /users

设计基准:`SCREENS.users`(screens-admin.js:41-60)

## 结构对照表

| # | 设计稿 section | 现状 | 目标实现 | 必做交互 | 适配决策 |
|---|---|---|---|---|---|
| 1 | 页头:title + `N registered users` 副标题 + Export + Add user | 标题 + 添加 | 副标题 = `{{count}} registered users`(接口 total);Add user 保留 | — | **Export 无后端 → 不做(已记录)** |
| 2 | 4 列 StatCard(Total/Active today/Paying/Total balance) | 无 | statHeader StatCardRow(4,sm):Total users(接口 total)/ Admins(当前页 role≥10 计数)/ Banned(当前页 status≠1)/ Total balance(当前页 quota 合计 formatQuota) | loading | 🔵 Active today/Paying 无统计接口 → 改 Admins/Banned(当前页聚合,已记录) |
| 3 | tabs(All/Admins/Banned)+ search | role/status faceted | FilterTabs:All / Admins(role 过滤)/ Banned(status 过滤)与 faceted 同源;搜索保留 | tabs | — |
| 4 | 表格:User cellflex(avatar+名+mono 邮箱)、Role badge、Balance/Used mono、Status badge、rowact | 10 列 | username → CellFlex(avatar initials + display_name/username 主行 + email/username mono 副行);role → StatusBadge soft(Root=info/Admin=brand→default/User=neutral);quota 列保留进度形态或 MonoCell;status → StatusBadge soft;actions → RowActions(Edit icon + More) | hover actions | 列超集(id/group/created/last_login)保留 |
| 5 | Mutate Drawer SettingsPanel 化 | 分区表单 | 分区套 SettingsPanel(eyebrow) | — | 字段/校验不动 |

## 功能保全清单

| # | 旧功能 | 复验 |
|---|---|---|
| 1 | 10 列(select/id/username/status/quota/group/role/created/last_login/actions) | ☑ |
| 2 | role/status/group 过滤 + 搜索 | ☑ |
| 3 | Mutate Drawer(Basic/Auth/Quota/Group/Status/Role/Binding 分区) | ☑ |
| 4 | 删除 dialog | ☑ |
| 5 | 配额调整 dialog(add/subtract/override + USD 预览) | ☑ |
| 6 | request_count tooltip / 绑定信息展示 | ☑ |
| 7 | 分页 / 移动端 | ☑ |
| 8 | admin 守卫 | ☑ |
