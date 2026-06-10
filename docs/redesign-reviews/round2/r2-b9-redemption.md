# R2-B9 Review — Redemption Codes 重做

- branch:`redesign/youbox-frontend-100`
- 前置文档:`r2-b9-redemption-tables.md`

## 结构对照表验收

| # | 设计稿 section | 结果 |
|---|---|---|
| 1 | 左 340px 生成器 Panel | **pass/adapted** — 常驻 GeneratorCard(Name/Value $ MonoInput/Quantity/Expires+快捷钮)+ `Generate {{n}} codes` 联动 CTA(实测 3)→ 创建 mutation → success InlineAlert 内联展示全部 keys + Copy All + 关闭 + 「shown once」说明;Max uses 后端无字段 → 不做(已记录);Drawer 保留编辑专用 |
| 2 | 右上 3 StatCard | **pass/adapted** — Codes issued(total)/Unused/Redeemed value(实测生成后 4/3/$1 联动);当前页聚合已注释 |
| 3 | 批次表 | **pass/adapted** — StatusBadge soft(Unused=success/Used=neutral/Disabled=danger/Expired=warning)、MonoCell quota、code 遮罩保留、RowActions(Copy + More 收纳编辑/启停守卫/删除);Used 进度列单次码无维度 → 不加(已记录) |
| 4 | search | **pass** — name/id 搜索保留 |

## 功能保全清单复验

tables 9 项全 ☑(批量复制/删除无效码/启停条件守卫/遮罩/分页多选移动端);PrimaryButtons(仅 Create)删除,入口迁生成器。

## 浏览器审查

实测生成 3 码全流程 + 统计联动 + 表格新行;dark/light @1280;无 page error。截图:`screenshots/r2-b9/`。

## 验证命令

typecheck pass;i18n:sync(7 键,missing 0);copyright pass;feature eslint 0 告警。

## 结论

**pass** — 进入 R2-B10。
