# R2-B1 Review — Dashboard 重做

- branch:`redesign/youbox-frontend-100`
- 前置文档:`r2-b1-dashboard-tables.md`(结构对照表 + 功能保全清单)

## 结构对照表验收

| # | 设计稿 section | 结果 |
|---|---|---|
| 1 | 页头(问候 + 时间范围 select + New key) | **pass/adapted** — `overview-insights.tsx` 头部行;问候按时段 + 用户名;范围 select(Today/7/14/30,修复 SelectValue 显示标签);Export 无后端 → 不做(已记录) |
| 2 | 4 列 StatCard 行 | **pass/adapted** — patterns StatCardRow/StatCard;Requests/Spend/Tokens 带前后半窗 delta;第 4 卡 = Balance + runway delta(latency 无用户级数据,已记录) |
| 3 | Requests over time Panel | **pass/adapted** — Panel(eyebrow `// usage over time` + 标题数值)+ FilterTabs(Requests/Tokens/Spend)+ Sparkline 170px + mono 日期轴;单系列(已记录) |
| 4 | Spend by model Panel | **pass** — avatar + 名称 + mono 金额 + 占比 ProgressBar,top6,空态文案 |
| 5 | Recent activity Panel | **pass/adapted** — getUserLogs 6 条:model 主行 + token 副行 + StatusBadge(soft,日志类型映射)+ mono cost/相对时间 + View all → /usage-logs;endpoint 列无数据(已记录) |
| 6 | Credit balance Panel | **pass/adapted** — display 余额 + `/ total` + 8px ProgressBar(used/total)+ Used/runway mono 行 + `// daily spend` eyebrow + brand bar 图(末桶高亮)+ Top up → /wallet;无预算概念(已记录) |
| 7 | 现有面板保留 | **pass** — 设置指南/API info/公告/FAQ/uptime 保留并后置于 insights 之下 |
| 8 | performance 形态 | **pass/adapted** — `performance-health-panel.tsx` 重排:Panel eyebrow + 3 × StatCard(sm)+ 模型健康表(StatusBadge Operational/Degraded/Down 词汇 + MonoCell p50/成功率/吞吐);models 区复用同一面板,删除重复的 `performance-overview.tsx`;provider/region 维度后端无 → 模型维度(已记录) |
| 9 | models 统计卡统一 | **pass** — `log-stat-cards.tsx` 改 StatCardRow(5)+StatCard(sm),RPM/额度/TPM/成功率逻辑保留 |
| 10-11 | 图表/users 区 | **pass** — VChart 体系与 tabs 保留 |

## 功能保全清单复验

表中 17 项全部 ☑(见 tables 文档):设置指南折叠/localStorage、API info 延迟测试、公告弹窗、FAQ、uptime 刷新、Preferences/Filter dialog、Bar/Area 与三 tab 图、users tabs、admin 守卫、货币双显示、内容可见性配置——浏览器逐页打开验证 + 代码路径未删改。
删除项(均为被替换的私有实现):`summary-cards.tsx`、`components/ui/stat-card.tsx`(deprecated 兑现)、`performance-overview.tsx`(重复设计,统一到 health panel)。

## 浏览器审查

- overview/models/users × dark+light @1280 全页截图;移动端 375(无横向溢出,StatCardRow 塌缩 1 列)。
- 交互:范围 select 7→30 数据联动;指标 tabs Requests→Spend 标题数值随动;New key/Top up/View all 链接;loading 骨架(StatCard loading 态)。
- 截图:`screenshots/r2-b1/`。
- console 仅剩导航中断导致的 `Failed to load system config: Failed to fetch`(快速跳页时 fetch abort,与本步改动无关)。

## 验证命令

- `bun run typecheck` pass;`bun run i18n:sync` 已跑(新增文案全部 `t()`)。

## 结论

**pass** — 进入 R2-B2。
