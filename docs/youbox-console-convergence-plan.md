# YouBox 前端第三轮计划 — 控制台收敛与模型广场重设计(Amp 风格)

## 背景

Paper 编辑部主题(浅色单主题、米黄营销纸面、靛蓝强调色)与公开页壳合一(`_public` layout、登录态驱动 Header)已在上一轮完成。本轮解决剩下的两个结构性问题:

1. **模型广场过载**:一个页面同时存在 搜索、收藏、排序、Token 单位、充值价开关、三种视图模式、过滤药丸、280px 分面侧栏(供应商/类型/分组/分类/端点/计费/价格滑块),信息密度与 Amp 的克制背道而驰。
2. **控制台信息架构混乱**:侧栏 4 组 15+ 入口,公开资源页(Docs/Pricing/Apps/API tools)混在控制台里,钱包与个人资料割裂,管理员 6 个入口与用户功能平铺。

**参照系**:Amp(ampcode.com)设置页的结构 — Account / Usage / Billing 卡片式概览 + 左侧少量平铺入口(Account、Secrets、Usage、Model Providers、Security、Integrations)。取其"入口少、每页一件事、卡片分节"的组织方式,不照抄视觉。

**已确认的决策**(2026-07-03):

| 决策点 | 结论 |
| --- | --- |
| 模型广场视图 | 只保留一种列表视图,删除卡片网格与表格模式 |
| 控制台侧栏 | Docs/Pricing/Apps/API tools 移出,只走顶部 Header;侧栏收敛到 6 个用户入口 |
| 管理员独立 | drill-in 工作区(复用 system-settings 的侧栏切换机制),不做独立 shell |
| 公告位置 | Header 通知抽屉 + Overview 顶部单行可关闭横幅 |
| 签到功能 | 移到 Billing 页(Balance 卡内一行),日历收进 popover |
| 模型调用分析 | 砍掉;Usage 只留 API / Task 两个日志 tab |
| 后端 | 完全不动;仅前端路由、组件、导航配置 |

## 设计原则

1. **入口少于功能**:侧栏只放高频动线(看用量、管钥匙、充钱、调试、设置),低频功能收进页内 tabs 或卡片。
2. **每页一个问题**:Overview 回答"我的账户现在什么状态";Usage 回答"钱花在哪了";Billing 回答"怎么充值/订阅"。
3. **卡片分节,不做仪表盘**:参照 Amp Account 页(Profile 卡 + Usage Statistics 卡 + Billing 卡纵向堆叠),避免 4 列 statcard + 多图表的 dashboard 惯性。
4. **管理员无感隔离**:普通用户看不到任何管理入口;管理员通过一个入口进入独立工作区,侧栏整体切换。
5. **URL 兼容**:所有既有 URL 保留或 301 式 `redirect`,不破坏书签与站内链接。

---

# Phase A — 用户控制台 IA 收敛

## A0 共享排版语言(Amp 克制的落地规则)

所有控制台页面遵守同一套版式约束,这是"克制"的可执行定义:

1. **两种页宽**:
   - 设置型页面(Overview / Billing / Settings):内容列 `max-w-3xl`(~768px)左对齐,卡片纵向堆叠,卡片间距 `gap-4`。
   - 数据型页面(Keys / Usage):全宽,但工具行与表格共享同一左右边距,无横向卡片拼贴。
2. **SettingsCard 基元**(新组件,进 Design Lab):白底、1px hairline 边框、无阴影、`rounded-lg`;头部一行 = 标题(sans 15px medium)左 + 动作按钮右;头部与内容之间 hairline 分隔;内容区 `p-4`。对应 Amp 的 Profile/Usage Statistics/Billing 卡。
3. **LabelValue 基元**:小型大写字距标签(11px、`tracking-wider`、`text-muted-foreground`,对应 Amp 的 USERNAME/NAME/EMAIL)+ 下方值(14px,数字一律 mono tabular)。多字段横排 `grid-cols-2 md:grid-cols-3`。
4. **SettingRow 基元**:一行一个设置项 = 左侧「名称 + 一句描述」+ 右侧「控件或动作按钮」;行间 hairline 分隔。Security/Preferences 全部用它,不再一卡一功能。
5. **数字用行,不用卡**:统计一律为 LabelValue 行内排列,禁止 3~4 列 statcard 网格。
6. **每屏至多一个实心主按钮**(靛蓝);其余动作 `outline`/`ghost`。危险操作纯文字红,放区块末尾。
7. **图标降噪**:图标只出现在侧栏(16px)与空状态;卡片标题、表头、LabelValue 不带图标。
8. **空状态即引导**:新手引导不做常驻面板,做成对应卡片的空状态(无 key → Keys 摘要卡显示三步引导 + 代码片段)。

## A1 侧栏收敛(6 入口,无分组标题)

`hooks/use-sidebar-data.ts` 重写为单组平铺:

| # | 入口 | URL | 来源 |
| --- | --- | --- | --- |
| 1 | Overview | `/dashboard/overview` | 重构(见 A2) |
| 2 | API Keys | `/keys` | 保留 |
| 3 | Usage | `/usage-logs/common` | 合并 API/Task 日志为页内 tabs(见 A3) |
| 4 | Billing | `/wallet` | 现钱包页,改名与重排(见 A4) |
| 5 | Playground | `/playground` | 保留;Chat 预设收进 Playground 页内入口 |
| 6 | Settings | `/profile` | 现 Profile 页重排(见 A5) |

移除项及去向:

| 移除入口 | 去向 |
| --- | --- |
| Models & Pricing、API reference、Apps | 顶部 Header 导航(公开页,已有) |
| API tools | Docs 页内入口或 Header「开发者」下拉 |
| Chat(chat-presets 侧栏项) | Playground 页内 |
| Admin 组全部 6 项 | Phase C 管理员工作区 |

注意:`hooks/use-sidebar-config.ts` 的 `sidebar_modules` 管理员×用户过滤按 URL 匹配,收敛后需同步更新 `DEFAULT_SIDEBAR_MODULES` 的 key 映射,保证旧配置不炸。

## A2 Overview 页(/dashboard/overview)— Amp Account 式账户状态页

**回答的问题**:"我的账户现在什么状态?" 设置型页宽(max-w-3xl),四张 SettingsCard 纵向堆叠。

现状内容处置:

| 现状(overview-dashboard.tsx) | 处置 |
| --- | --- |
| Setup guide(可折叠步骤 + 代码块) | 降级为 Keys 摘要卡的空状态(无 key 时显示);有 key 后彻底消失 |
| AnnouncementsPanel 公告面板 | 双轨:全部公告进 Header 通知抽屉;最新一条在 Overview 顶部显示单行可关闭横幅(localStorage 记忆已读) |
| ApiInfoPanel(Base URL 列表) | 压缩为 Keys 摘要卡头部一行「API endpoint + 复制」 |
| OverviewInsights 用量洞察 | 精简为 Usage 卡的 3 个 LabelValue + sparkline;完整图表归 Usage 页 |
| UptimePanel 可用性面板 | 删除(公开 /status 页已承载,Header 有入口) |

新版排版:

```
公告横幅(单行:icon + 摘要 + 「详情」 + ×,可关闭,无公告不渲染)
Overview(页标题,衬线)
┌ Profile ────────────────────────── [View Settings]┐
│ 头像  USERNAME      NAME        GROUP              │
│       @xiaomao      Fan         default            │
└────────────────────────────────────────────────────┘
┌ Usage(本月)───────────────────── [View Usage] ┐
│ REQUESTS      TOKENS        SPEND                  │
│ 6,055         1.9m          $12.40    ▁▂▅▃▇ 14d    │
└────────────────────────────────────────────────────┘
┌ Balance ──────────────────────────── [Top up] ─────┐
│ $0.00 USD(大号 mono)                              │
│ 订阅:Pro · 2026-08-01 到期(一行,无订阅则隐藏)   │
└────────────────────────────────────────────────────┘
┌ API Keys ─────────────────────── [Create key] ─────┐
│ endpoint https://api.you-box.com/v1  [copy]        │
│ sk-…abc1   default   最近使用 2h 前                │
│ sk-…def2   team      最近使用 3d 前   (至多 3 行)  │
│ 空状态:三步引导(创建 key → 复制 → 首次调用代码块)│
└────────────────────────────────────────────────────┘
```

现 dashboard 的两个分析 section 处置:`models`(模型调用分析)**删除**,`/dashboard/models` redirect 到 `/usage-logs/common`,相关图表组件与 api 调用一并清理;`users`(adminOnly)移入管理员工作区(URL 保留)。

## A3 Usage 页(/usage-logs)— 合并 + 去卡片化

**回答的问题**:"钱和量花在哪了?" 数据型全宽页。

```
Usage(页标题)
[ API Logs | Task Logs ](页内 tabs,URL 保留两条路由)
REQUESTS 6,055   TOKENS 1.9m   SPEND $12.40   AVG LATENCY 820ms(LabelValue 行,hairline 下边)
[日期范围][模型 ▾][Key ▾][状态 ▾]          [导出][列设置](单行过滤,更多条件收进「筛选」popover)
表格:时间 | 模型 | Key | Tokens(mono)| 花费(mono)| 延迟 | 状态
```

- 现 `common-logs-stats` 的统计卡改为上述 LabelValue 行;`logs-filter-toolbar` 压成单行。
- 移动端沿用现 `usage-logs-mobile-card` 行式卡。

## A4 Billing 页(/wallet)

**回答的问题**:"余额多少,怎么充,花了什么?" 设置型页宽。卡片自上而下:

| 卡片 | 内容与排版 | 现组件 |
| --- | --- | --- |
| Balance | BALANCE 标签 + 大号 mono 金额;右上「Top up」滚动锚到充值卡;副行:等值额度/汇率一句话;卡底 hairline 上加一行「每日签到」SettingRow(本月 X 天 + 「签到」按钮,日历收进 popover) | balance-hero-card 精简,去渐变装饰;checkin-calendar-card 迁入 |
| Top up | 预设金额 chip 行 + 自定义输入 + 支付方式;整卡唯一实心主按钮「充值」 | recharge-form-card |
| Subscription | 当前订阅一行(计划名/到期/状态)+「管理」;无订阅时展示计划列表(单列行式,不做三列 pricing 卡) | subscription-plans-card 重排 |
| Transactions | 最近 10 条流水表(时间/类型/金额 mono/余额)+「查看全部」→ billing-history-dialog;划转入口收进本卡头部动作 | transactions-card + transfer-dialog |
| Referral | 推广奖励:一行统计(邀请数/累计奖励)+ 邀请链接复制;静默卡放最底 | affiliate-rewards-card 精简 |

## A5 Settings 页(/profile)— Amp Settings 式分节

**回答的问题**:"我这个人和这个账号的配置。" 设置型页宽;桌面左侧 160px 二级锚点导航(Account / Security / Preferences),移动端顶部 tabs。全部改用 SettingRow,现有"一卡一功能"结构拆散重组:

**Account 分节**

| SettingRow | 右侧控件 | 现组件来源 |
| --- | --- | --- |
| 头像 + 用户名 + 显示名 | 「Edit」→ 行内编辑/对话框 | account-card / profile-settings-card |
| 邮箱 | 已绑定值 + 「Change」 | email-bind-dialog |
| 微信 / Telegram 绑定 | 状态 + 「Bind / Unbind」 | account-bindings-tab |
| 系统访问令牌 | 「Generate / Reset」 | access-token-dialog |

**Security 分节**

| SettingRow | 右侧控件 |
| --- | --- |
| 密码 | 「Change password」→ change-password-dialog |
| 两步验证 2FA | 状态徽标 + 「Enable / Disable」→ 现 2fa 对话框组 |
| Passkeys | 已注册列表(行内)+「Add passkey」 |
| 删除账户 | 危险区:红字「Delete account」置分节末尾,hairline 上边 |

**Preferences 分节**

| SettingRow | 右侧控件 |
| --- | --- |
| 界面语言 | Select(language-preferences-card) |
| 通知 | 通知方式配置(notification-tab 收拢) |
| 侧栏模块 | 「Configure」→ 现 sidebar-modules-card 收进对话框;需随 A1 新侧栏更新模块清单 |

## A6 API Keys 页(/keys)

数据型全宽页,现有表格/抽屉/对话框功能全部保留,做减法:

- 删除顶部 `api-keys-stat-cards` 统计卡 → 改为标题下一行摘要:「N 个密钥 · 本月已用 $X」。
- 页头右侧唯一实心按钮「Create key」;批量操作仍在表格选中态出现。
- 表格列收敛:名称 | Key(掩码+复制)| 分组 | 额度/已用(mono)| 过期 | 状态 | `…` 行菜单;其余列进「列设置」。
- `new-key-alert`(新建后明文提示)保留,置顶 hairline 卡。
- 创建/编辑继续用现 mutate-drawer,表单分组:基本信息 / 额度 / 高级(折叠)。

## A7 Playground 页(/playground)

本轮最小改动:布局保持「模型选择 + 对话流 + 输入框」;参数面板(playground-parameters)默认收起为右侧 Sheet;顶部加「Presets ▾」菜单承接原侧栏 Chat 预设(chat-presets-item 迁移消费方)。视觉仅做扁平化对齐。

## A8 验收

- typecheck / lint / test / build 全绿;`bun run i18n:sync`。
- 浏览器验证:普通用户登录后侧栏恰好 6 项;/dashboard/overview 四卡片;/usage-logs tabs 切换;旧 URL(/usage-logs/task 等)直达正确 tab。
- 截图:overview、usage、billing、settings @ 1280 与 375。

---

# Phase B — 管理员工作区(drill-in)

## B1 注册 ADMIN_VIEW

复用 `layout/lib/sidebar-view-registry.ts` 机制,在 `SIDEBAR_VIEWS` 中新增 `ADMIN_VIEW`(置于 `SYSTEM_SETTINGS_VIEW` 之前或将其并入):

- `pathPattern`:匹配 `/channels|/models(/…)|/users|/redemption-codes|/subscriptions|/system-settings|/dashboard/users`。
- 侧栏项:Channels、Models、Users、Redemption Codes、Subscriptions、User Analytics、System Settings(七项平铺;System Settings 进入后仍走现有二级 drill-in)。
- `SidebarViewHeader` 显示「Admin」+「← Back to Console」。

## B2 入口与守卫

- 侧栏底部(或用户菜单)对 `role >= ADMIN` 显示「Admin console」入口,默认落到 `/channels`。
- 路由守卫不变(现有 `beforeLoad` 已按角色拦截);普通用户 URL 直达时行为保持现状。
- URL 全部保留,不迁移到 `/admin/*`(避免大规模路由 churn;将来要迁移只需改 registry 的 pattern 与 redirect)。

## B3 管理页版式对齐(不重构功能)

管理员页面本轮**只做 A0 版式对齐,不动功能与表格逻辑**,与用户侧共享同一套克制语言:

| 页面 | 对齐动作 |
| --- | --- |
| Channels / Users / Redemption / Subscriptions | 页头统一「标题 + 一行摘要 + 唯一实心主按钮」;顶部 statcard 网格(如有)改 LabelValue 行;过滤压单行 |
| Models(metadata) | 同上;分区 tabs 保留 |
| User Analytics(自 /dashboard/users 迁入) | 图表白卡 hairline 化,双列以内 |
| System Settings | 已有二级 drill-in 结构不动,仅继承新 token(上一轮已完成大半) |

## B4 验收

- 管理员:入口可见,进入后侧栏整体切换、返回正常;system-settings 二级 drill-in 不回退。
- 普通用户:全站看不到管理入口;直达管理 URL 被守卫拦截(现状回归)。

---

# Phase C — 模型广场重设计

## C1 目标形态(单列表 + 抽屉过滤)

```
Eyebrow(模型广场)
Models(衬线大标题)          [Compare] [Filters(计数)]
共 N 个模型,来自 M 家提供商
────────────────────────────────────────(hairline)
[搜索框────────────────────────]  [排序 ▾]
供应商横向 chip 行(Top 8 + More)
────────────────────────────────────────
模型行:名称(衬线)+ 供应商图标 | 能力徽章 | 上下文 | 输入/输出价(mono)| ★
模型行…(虚拟滚动,保留现 ModelList 骨架)
```

**模型行解剖**(两行式,行高 ~64px,hairline 分隔,hover 整行米黄 tint):

```
[供应商图标] gpt-4.1-mini(衬线 15px,链接到详情)      $0.40 / $1.60 per 1M(mono,右对齐)
             OpenAI · 1M ctx · 视觉 · 工具调用(muted 12px 一行,徽章化克制为纯文字点分隔)   ★
```

- 能力不再用彩色 Badge 堆叠,统一 muted 文字 + `·` 分隔;只有「新」「折扣」等运营标可用一枚靛蓝 Badge。
- 价格列固定右对齐 mono;充值价开启时替换显示,不并排双价。

**Filters 抽屉分组顺序**(自上而下,与使用频率一致):供应商(带搜索)→ 模型类型 → 端点类型 → 分组(含倍率)→ 分类 → 计费类型 → 价格区间滑块 → hairline → 显示选项(Token 单位 / 充值价)。底部固定「清除全部 / 查看 N 个结果」。

## C2 删减清单

| 项 | 处理 |
| --- | --- |
| 卡片网格 `model-card-grid`、`model-card` | 删除(详情页 spec-card 不受影响) |
| 表格模式 `pricing-table`、`pricing-columns` | 删除 |
| 视图切换控件(toolbar 内) | 删除;`view` search param 兼容读取后忽略 |
| 280px 分面侧栏 `pricing-sidebar` | 改造为 Filters 抽屉内容(Sheet),桌面/移动同一实现 |
| 毛玻璃 sticky 控制条 | 改为扁平 hairline 工具行,仅搜索行 sticky |
| Token 单位 / 充值价开关 | 收进 Filters 抽屉底部「显示选项」 |
| 收藏 toggle | 保留,融入排序下拉(「Sort: Favorites first」)或行内 ★ 即可 |
| 过滤药丸行 | 保留,仅在有激活过滤时出现 |

`use-filters` 的 URL search 契约不变(providers/modelTypes/…/view),旧链接不炸。

## C3 详情与对比页

- `/pricing/$modelId`、`/pricing/compare` 本轮只做扁平化(去阴影、hairline、衬线标题),不动结构。

## C4 验收

- typecheck / lint / test(`filters.integration.test` 需随删减更新)/ build。
- 浏览器:1280 与 375 截图;过滤抽屉、搜索、排序、收藏、URL 带参直达逐项操作验证。
- 无用组件删除后 `bun run knip`(如配置)或手动确认无残留引用。

---

# 实施顺序与提交策略

| 步骤 | 内容 | commit |
| --- | --- | --- |
| 0 | 先提交当前未提交的主题+壳合一改动(前置) | `feat(web): paper editorial theme and unified public shell` |
| 1 | Phase A 侧栏收敛 + Overview 重构 | `feat(web): converge console sidebar and account overview` |
| 2 | Phase A Usage/Billing/Settings 重排 | `feat(web): merge usage tabs, reorganize billing and settings` |
| 3 | Phase B 管理员工作区 | `feat(web): admin drill-in workspace` |
| 4 | Phase C 模型广场重设计 | `feat(web): simplify model plaza to single list view` |

每步:typecheck + lint + test + build + i18n:sync 全绿后提交;浏览器截图存 `docs/redesign-reviews/round3/`。

## 不动项 / 风险

- **后端零改动**;所有数据来自现有 API。
- **路由 URL 全部保留**,行为差异仅在导航入口与页内组织。
- `sidebar_modules` 旧配置兼容:URL key 映射需迁移,并补充回归用例。
- Chat 预设入口下沉到 Playground 后,需确认 `chat-presets-item` 的消费方迁移干净。
- 模型广场删表格模式后,横向比价动线由 `/pricing/compare` 承接(入口保留在页头)。
