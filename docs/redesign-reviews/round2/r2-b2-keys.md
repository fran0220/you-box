# R2-B2 Review — API Keys 重做

- branch:`redesign/youbox-frontend-100`
- 前置文档:`r2-b2-keys-tables.md`

## 结构对照表验收

| # | 设计稿 section | 结果 |
|---|---|---|
| 1 | 页头 + 副标题 + Docs + Create | **pass** — 副标题行;Docs 外链按钮按 `status.docs_link` 有值渲染(后端字段确认存在 `controller/misc.go:73`);Create 保留 |
| 2 | 3 列 StatCard | **pass/adapted** — statHeader 插槽:Active keys(表数据 enabled 计数)/ Spend (7d) / Requests today(getUserQuotaDates 7d/1d);Monthly→7d 已记录 |
| 3 | new-key InlineAlert + SecretReveal | **pass/adapted** — 创建成功后页内 brand InlineAlert + SecretReveal(defaultRevealed)+ 关闭;后端 AddToken 不回传 key → 创建后取 id desc 首条 + fetchTokenKey 解析(失败静默降级,已记录);浏览器实测 `sk-…` 完整展示、关闭/刷新消失 |
| 4 | 表格列 v2 | **pass** — name=CellFlex(名 + mono 遮罩 key 副行,原 key 列默认隐藏可经 View 打开)、quota=`used of limit`+ProgressBar(无限=∞/Unlimited)、status=StatusBadge soft(Active)、last used=MonoCell muted、actions=RowActions hover(Copy/Edit/启停/More dropdown 全保留,实测 hover 4 按钮) |
| 5 | FilterBar | **pass/adapted** — 保留双搜索 + status faceted(设计超集,不降级) |

## 功能保全清单复验

tables 文档 10 项全 ☑:12 列信息不丢(name+key 合并展示)、双搜索、状态过滤、批量复制/删除、Drawer 8 字段、行操作全集(Copy/Connection Info/CC Switch/Chat/Delete/启停)、删除 dialog、移动端卡片(quota/status 同步新形态)、空态、新 key 展示(dialog→页内 alert,无信息损失)。

## 浏览器审查

- 创建流程实测:Create → Drawer 填名 → Save → InlineAlert + `sk-` 完整 secret + copy;表格出现新行。
- dark/light @1280 全页、行 hover actions、移动端 375(无横向溢出)。
- 截图:`screenshots/r2-b2/`(empty/dark/light/newkey-alert/row-hover/mobile)。

## 验证命令

`bun run typecheck` pass;`bun run i18n:sync`(8 键 × 6 语言);`bun run copyright` pass;keys feature eslint 0 错,全仓 lint 与基线一致(103 存量)。

## 结论

**pass** — 进入 R2-B3。
