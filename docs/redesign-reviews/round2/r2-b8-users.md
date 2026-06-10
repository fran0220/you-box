# R2-B8 Review — Users 重做

- branch:`redesign/youbox-frontend-100`
- 前置文档:`r2-b8-users-tables.md`

## 结构对照表验收

| # | 设计稿 section | 结果 |
|---|---|---|
| 1 | 页头副标题 + Export + Add user | **pass/adapted** — `{{count}} registered users`(接口 total,实测 2);Export 无后端不做(已记录) |
| 2 | 4 列 StatCard | **pass/adapted** — Total users/Admins/Banned/Total balance(formatQuota);Active today/Paying 无统计接口 → Admins/Banned 当前页聚合(已记录) |
| 3 | tabs + search | **pass/adapted** — FilterTabs All/Admins/Banned 与 faceted/URL 同源(实测 Admins→1 行);后端 role 过滤为单值精确匹配 → Admins tab=role 10,Root 经 faceted 过滤(已记录);Banned=status 2 |
| 4 | 表格列 v2 | **pass** — CellFlex(avatar+display_name+username mono 副行)、Role StatusBadge soft(Root=info/Admin=brand 新增 variant/User=neutral)、Status soft(banned=danger 对齐词汇)、quota 进度保留、RowActions(Edit + More 收纳启停/升降权/绑定/订阅/重置 Passkey/2FA/删除/配额全项) |
| 5 | Drawer SettingsPanel 化 | **pass** — basic/group & quota/bindings 三分区,字段不动 |

## 功能保全清单复验

tables 8 项全 ☑。StatusBadge 新增 brand variant(共享组件,Design Lab 词汇映射兼容)。

## 浏览器审查

dark/light @1280、Admins tab 过滤、CellFlex/badges 形态;无 page error。截图:`screenshots/r2-b8/`。

## 验证命令

typecheck pass;i18n:sync 干净;copyright pass;eslint 0 新错(存量 1 处为 HEAD 已有,stash 验证)。

## 结论

**pass** — 进入 R2-B9。
