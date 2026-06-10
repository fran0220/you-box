# R2-B14 Review — Pricing/Marketplace/Model Detail/Rankings 深化

- branch:`redesign/youbox-frontend-100`
- 前置文档:`r2-b14-marketing-depth-tables.md`

## 结构对照表验收

| # | 缺口 | 结果 |
|---|---|---|
| 1 | 收藏星 | **pass/adapted** — localStorage 收藏(useSyncExternalStore + 跨 tab 同步);卡片星 toggle(实测 aria-pressed true)+ toolbar Favorites 过滤 + 双空态;表格视图不加星(已记录) |
| 2 | footer Metric 化 | **pass** — Input/Output/Cached per 1K/1M 联动、request/动态定价分支,patterns Metric(实测卡内 metrics 渲染) |
| 3 | spec 卡 | **pass/adapted** — Panel 2×3 display 大数(价格/TPS/延迟/成功率);Context/Max output 无字段(已记录);替代原 SummaryGrid 信息不丢 |
| 4 | weekly usage sparkline | **adapted** — 用量趋势接口无 → 保留 UptimeSparkline;Sparkline 转由 rankings Tokens 卡消费(已记录) |
| 5 | quick call CodeBlock | **pass** — curl/main.py/client.ts/client.js chrome bar + 内置 copy |
| 6 | provider 表高亮 | **pass/adapted** — default 分组行 brand-subtle + `auto` badge(group=provider 概念,已记录) |
| 7 | rankings StatCard 行 | **pass** — Tokens(+Sparkline)/Models/Vendors/Top growth(DeltaBadge);空数据时按条件隐藏(models.length===0,本实例无用量;渲染条件已核) |
| 8 | 份额 bar + 增长 badge | **pass** — 排行表行 ProgressBar(相对榜首)+ GrowthText→DeltaBadge(growth-text.tsx 删除) |

## 功能保全清单复验

5 项全 ☑(双视图/过滤/排序/单位、详情三 tab、复制/动态定价标签、rankings sections、公开访问——本步验证均在未登录上下文)。

## 浏览器审查

pricing dark @1280(9 星钮、6 Metric、收藏 toggle)、model detail spec 卡、rankings 空数据态;无 page error。截图:`screenshots/r2-b14/`。注:R2-00 发现的 `/rankings` 重定向未复现(当时为 setup 缓存未刷新),本步实测公开可达。

## 验证命令

typecheck pass;i18n:sync(11 键 × 6 语全译);copyright pass;两 feature eslint 零新增。

## 结论

**pass** — 进入 R2-B15。
