# r2-B14 结构对照表 — Pricing/Marketplace/Model Detail/Rankings 深化

设计基准:`SCREENS.marketplace`/`modelDetail`/`rankings`(screens-marketing.js)。R2-00 复核缺口清单为准。

## 结构对照表

| # | 缺口(R2-00 复核) | 现状 | 目标实现 | 必做交互 | 适配决策 |
|---|---|---|---|---|---|
| 1 | 模型卡收藏星 | 无 | `model-card.tsx` 右上角星形 toggle(brand 高亮);本地收藏(localStorage 集合,zustand/persist 或简单 hook);sidebar 过滤区或 toolbar 加「Favorites」过滤 | 收藏/取消、过滤 | 🔵 无后端收藏 → localStorage(已记录) |
| 2 | 卡片 footer Metric 化 | 自有形态 | footer 价格/吞吐展示改 patterns `Metric`(k/v + `--end`)形态(In/Out 价格 + TPS 如有) | hover 不变 | 数据可得项展示 |
| 3 | Model detail 右栏 spec 卡(display 大数 2×3) | SummaryGrid 文本 | detail(Sheet)Overview 顶部 spec 卡 Panel:2×3 grid display 大数(Input/Output per 1M、Context?无 → 可得项:TPS/Latency/Success rate/价格) | — | Context/Max output 无字段 → 用可得指标(已记录) |
| 4 | Weekly usage sparkline | uptime 条 | detail 内已有 30 天 UptimeSparkline,补 patterns Sparkline 形态的用量趋势如数据可得;否则保留 uptime 条并记录 | — | 用量趋势接口无 → 保留 uptime sparkline(已记录) |
| 5 | quick call CodeBlock chrome | code samples 无 chrome | ModelDetailsApi 的代码示例改用 ai-elements CodeBlock(title=语言/文件名 chrome bar + copy) | copy | — |
| 6 | provider 表 YouBox Auto 高亮行 | per-group 表 | per-group 性能表:站点默认分组行高亮(brand-subtle 行底)| — | group=该站 provider 概念(已记录) |
| 7 | rankings 4 StatCard 行 | 无 | RankingsHero 下加 StatCardRow(4):Tokens(期内合计)/ Models(参与排名模型数)/ Vendors / Top growth(最大涨幅 badge);来自现有 rankings 数据 | — | 设计稿词汇按可得数据映射(已记录) |
| 8 | rankings 增长 badge + 份额 bar | GrowthText 文本 | 排行表行:share 列加 ProgressBar(相对榜首);growth 列 GrowthText → DeltaBadge 形态 | — | — |

## 功能保全清单

| # | 旧功能 | 复验 |
|---|---|---|
| 1 | pricing 卡/表双视图 + 全部过滤(sidebar/移动端)+ 排序/单位/充值价切换 | ☑ |
| 2 | 模型详情 Sheet 三 tab(Overview/Performance/API)全内容 | ☑ |
| 3 | 模型复制/Details 按钮、动态定价标签 | ☑ |
| 4 | rankings 时期切换 + Models/MarketShare/Pulse sections | ☑ |
| 5 | 未登录可访问(公开页) | ☑ |
