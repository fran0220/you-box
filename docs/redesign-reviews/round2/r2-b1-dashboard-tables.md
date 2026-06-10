# r2-B1 结构对照表 — /dashboard/overview|models|users

设计基准:`SCREENS.dashboard`(screens-console.js:31-65)+ `SCREENS.performance`(screens-console2.js:289-308)

## 结构对照表(overview)

| # | 设计稿 section | 现状 | 目标实现(组件 + 文件) | 必做交互 | 适配决策 |
|---|---|---|---|---|---|
| 1 | 页头:问候副标题 + `Last 7 days` select + Export + New key | 无 | OverviewInsights 头部行 → `overview/overview-insights.tsx`;range Select(ui/select)+ New key 按钮(Link→/keys) | range 切换全区数据联动 | **Export:后端无导出能力 → 不做按钮,记录此表**;问候按本地时段(早上好/下午好/晚上好)+ 用户名 |
| 2 | 4 列 StatCard(Requests/Spend/Tokens/Avg latency + delta + 趋势) | 私有 StatCard 3 卡 | patterns `StatCardRow`+`StatCard`;数据 `/api/data(/self)` 取 2× 窗口,前半窗算 delta | delta 方向色、mono 数值、loading 骨架 | **Avg latency 无用户级数据 → 第 4 卡 = Balance(余额 + 健康 delta)**;latency 形态由 models 区 perf 面板承载(admin) |
| 3 | Requests over time Panel:eyebrow + 标题数值 + tabs(Requests/Tokens/Spend)+ 双系列面积图 + mono 日期轴 | 无 | patterns `Panel/PanelHeader` + data-table `FilterTabs` + patterns `Sparkline`(大尺寸)+ mono 日期标签行 | tabs 切换指标,标题数值随动 | **双系列(Success/Streamed)无此维度 → 单系列**,legend 省略,记录 |
| 4 | Spend by model Panel:avatar + 名称 + mono 金额 + 占比 ProgressBar | VChart 饼图 | Panel + 行列表(Avatar/`formatQuota`/patterns `ProgressBar`),按 model_name 聚合 top6 | hover 行 | 数据来自同一 /api/data 序列 |
| 5 | Recent activity Panel:model/endpoint/status badge/cost/time + View all | 无 | Panel + 行列表;`getUserLogs({page_size:6})`;StatusBadge(soft);View all → /usage-logs | View all 跳转 | **endpoint 列无数据 → 副行 = token 名/日志类型**;status= 日志类型映射(consume=success/error=danger) |
| 6 | Credit balance Panel:display 大数 + `/budget` + ProgressBar + Used/days-left mono + `// daily spend` bar 图 + Top up | 简化信用面板 | Panel + display 余额 + `ProgressBar`(used vs used+remain)+ mono 行 + Eyebrow + CSS bar 图(7 桶)+ Top up(→/wallet) | Top up 跳转 | **无预算概念 → 进度 = 已用/(已用+余额)**,文案 `of {总额} total` |
| 7 | (现有)设置指南横幅 / API info / 公告 / FAQ / uptime | 存在 | 保留:insights 区之后按原可见性配置渲染 | 折叠/展开保留 | 设计稿无这些模块,按内容配置保留并后置 —— 显式适配 |
| 8 | performance 形态(SCREENS.performance) | KPI 文本面板 | `performance-health-panel.tsx` 重排:Panel + StatCard(sm,内嵌 sparkline 数据不可得→省)+ Top models 表(p50/成功率/吞吐,StatusBadge 词汇) | — | **provider/region 维度后端无 → 以模型维度承载 provider health 表形态**;并入 overview(admin)与 models(PerformanceOverview 同源重排) |

## 结构对照表(models / users)

| # | 设计稿 section | 现状 | 目标实现 | 必做交互 | 适配决策 |
|---|---|---|---|---|---|
| 9 | 统计卡行(统一 StatCard 形态) | 私有 LogStatCards 5 卡 | `log-stat-cards.tsx` 改为 patterns `StatCardRow(5)`+`StatCard(sm)`,逻辑(RPM/额度/TPM/成功率/延迟)不变 | loading 骨架 | 5 卡保留(数据超集) |
| 10 | 图表色 brand/teal | VChart 默认主题 | 沿用现 VChart 主题(round1 已 token 化) | tab 切换保留 | 既有 Preferences/Filter dialog 全保留 |
| 11 | users 分析 | tabs + VChart | 保留(tabs 过滤形态已与设计 pill tabs 同型) | 时间范围/粒度/TopN tabs | 无新增 |

## 功能保全清单

| # | 旧功能 | 旧入口 | 新入口 | 复验 |
|---|---|---|---|---|
| 1 | 设置指南横幅(展开/折叠 + localStorage + 3 步骤 + 快捷操作) | overview 顶部 | insights 之后保留 | ☑ |
| 2 | API info 面板(延迟测试) | overview | 保留 | ☑ |
| 3 | 公告面板(详情弹窗) | overview | 保留 | ☑ |
| 4 | FAQ 面板(折叠) | overview | 保留 | ☑ |
| 5 | Uptime 面板(刷新) | overview | 保留 | ☑ |
| 6 | 余额/今日用量/请求数统计 + sparkline | SummaryCards | StatCardRow(Requests/Spend/Tokens/Balance)+ Credit balance Panel | ☑ |
| 7 | 信用面板(健康度/runway/钱包链接) | SummaryCards 右栏 | Credit balance Panel | ☑ |
| 8 | models:RPM/额度/TPM/成功率/延迟 5 卡 | LogStatCards | 同组件统一 StatCard 形态 | ☑ |
| 9 | models:Preferences dialog(4 偏好 + localStorage) | 页头按钮 | 保留 | ☑ |
| 10 | models:Filter dialog(快捷范围/自定义区间/粒度/admin username) | 页头按钮 | 保留 | ☑ |
| 11 | models:消费分布图 Bar/Area 切换 | 图面板 | 保留 | ☑ |
| 12 | models:趋势/占比/排名三 tab 图 | 图面板 | 保留 | ☑ |
| 13 | models/users tab 导航 | 区域 tabs | 保留 | ☑ |
| 14 | users:日期/粒度/TopN tabs + 双图 | users 区 | 保留 | ☑ |
| 15 | admin 守卫(users 区、性能面板、username 过滤) | 各处 | 保留 | ☑ |
| 16 | 货币/Token 双显示(`display_in_currency`) | SummaryCards | formatQuota 沿用 | ☑ |
| 17 | overview 内容面板可见性配置(dashboard content settings) | overview | 保留 | ☑ |
