# R2-A2 Review — 表格体系 v2

- branch:`redesign/youbox-frontend-100`
- 落点:`src/components/data-table/`(增量升级,不破坏既有消费方)

## 交付

| 项 | 内容 |
|---|---|
| `DataTablePage` 升级 | 新增 `statHeader` 插槽(stat 行 → toolbar → 表格的 v2 解剖);`DefaultRow` 增加 `group/row` 作用域供 RowActions hover 显现;其余 API 不变 |
| `FilterBar` / `FilterBarSearch` | search(leading icon,≤300px 流式)→ 行内过滤控件 → 右侧 actions(Export/主操作),flex-wrap 响应塌缩 |
| `FilterTabs` | pill 单选过滤条(All/Enabled/Issues 形态)+ mono 计数;radiogroup 语义 + 方向键/Home/End roving focus;active = card 底 + shadow |
| `MonoCell` | mono 13px tabular-nums,默认右对齐;`align`/`muted` 变体 |
| `CellFlex` | leading(avatar/icon)+ 主文本(truncate medium)+ mono 副行 |
| `LatencyBadge` | 阈值变色(≤1s success / ≤3s warning / >3s danger,可配)+ dot;null → muted `—` |
| `RowActions` / `RowActionButton` | 右对齐 icon 组;`sm:opacity-0 group-hover/row:opacity-100`,focus-within 与 `aria-expanded` 菜单打开时保持可见,触屏(<sm)恒显;`alwaysVisible` 变体;icon 按钮强制 `label`(aria-label+title) |
| 行内 Switch 列 | 复用 `ui/switch` size=sm,演示见 mock 表格(无需新组件) |
| TableEmpty/TableSkeleton/MobileCardList | 复用现有件,在新结构下复验(demo 含 loading/empty/mobile 形态) |

## 门槛核对

| 门槛 | 结果 |
|---|---|
| Design Lab mock 数据完整演示(含全部状态) | pass — `demos/table.tsx`:statHeader + FilterBar(tabs/search/Export/主按钮)+ 8 列 mock 表(select/CellFlex/tag/MonoCell×2/LatencyBadge/Switch/RowActions)+ loading/empty 开关 + Cell primitives 独立态 |
| 现有消费方不破坏 | pass — 仅新增 props/文件与 `group/row` class;`tsc -b` 全仓通过 |
| 交互浏览器验证 | pass — tabs 过滤(Issues→2 行)、方向键循环(Issues→All)、行内 Switch 切换、hover 显现 RowActions、empty/loading 态、375 移动端卡片列表;无 page error |

## 浏览器审查

截图:`screenshots/r2-a2/`:`table-{dark,light}-1280.png`、`table-hover-row-actions.png`、`table-tab-issues.png`、`table-empty.png`、`table-loading.png`、`table-mobile-375.png`。

## 结论

**pass** — 进入 R2-A3。
