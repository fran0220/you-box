# R2-00 逐页结构差距定版(Gap Index)

- 分支:`redesign/youbox-frontend-100`
- 设计基准:`youboxdesign/screens-*.js`(逐 SCREEN 结构定义)、`youboxdesign/youbox-app.css`(page/panel/statcard/table/field/badge/code 体系)、`youboxdesign/_ds/`
- 现状基准:`web/default/src`(commit `fc28ab51` 时点),交叉对照 `web/reference/default-before-youbox/`
- 本文档为每页《结构对照表》**初版**:只定版「设计稿 section / 现状」两列。「目标实现 / 必做交互 / 适配决策」列在各 R2-Bx 步骤实现前补全并单独入库(`r2-XX-*.md`)。
- 图例:✅ = 现状已有结构等价实现;🟡 = 有部分实现但结构/交互不等价(仅换肤或形态不同);❌ = 缺失;🔵 = 设计稿假设的数据/后端能力当前不存在,需适配决策。

---

## 一、控制台页面

### B1 Dashboard — `/dashboard/overview|models|users`

设计基准:`SCREENS.dashboard` + `SCREENS.performance`(screens-console.js:31-65、screens-console2.js:289-308)

| # | 设计稿 section | 现状 |
|---|---|---|
| 1 | 页头:title + 问候副标题(`早上好,Jordan…last 7 days`)+ 时间范围 select + Export + New key | 🟡 SectionPageLayout 标题;无问候副标题、无页头时间范围 select(时间范围藏在 Filter dialog,`models-filter-dialog.tsx:72`)、无 Export/New key 页头主操作 |
| 2 | 4 列 StatCard 行(Requests/Spend/Tokens/Avg latency,icon label + display 值 + unit + delta vs last week) | 🟡 overview 是 3 卡 + 信用面板的私有 `StatCard`(`components/ui/stat-card.tsx:205`);models 是 5 列私有 `LogStatCards`(`log-stat-cards.tsx:41`);均无统一解剖(mono label/display val/delta 行) |
| 3 | Requests over time Panel:eyebrow + 标题数值 + 图内 tabs(Requests/Tokens/Spend)+ 双系列面积图 + mono 日期轴 + legend | 🟡 `consumption-distribution-chart.tsx:57` 为 VChart Bar/Area 切换,无 eyebrow/标题数值/Requests-Tokens-Spend tabs 形态 |
| 4 | Spend by model Panel:模型行(avatar-sm + 名称 + mono 金额 + 占比 ProgressBar) | 🟡 `model-charts.tsx` 以 VChart 饼图/排名图表达,无「行 + 进度条」形态 |
| 5 | Recent activity Panel:近期请求表(model/endpoint mono 副行/status badge/cost/time)+ View all | ❌ 无近期请求表 |
| 6 | Credit balance Panel:display 大数余额 + `/ $500 budget` + 8px ProgressBar + Used/days-left mono 行 + `// daily spend` eyebrow + 7 日 bar 图 + Top up | 🟡 `summary-cards.tsx:271` 信用面板有余额/链接,无 budget 进度条、daily spend bar 图、burn-rate 文案结构 |
| 7 | performance 形态(SCREENS.performance):uptime/p50/p99/error 4 statcard(内嵌 sparkline)+ Throughput 面积图(tabs All/2xx/5xx)+ Latency by region bars + Provider health 表(badge+sparkline) | 🟡 `performance-health-panel.tsx:68` / `performance-overview.tsx:96` 为 KPI 文本 + Top5 badge,无 sparkline statcard、无 provider health 表形态 |
| 8 | (现有能力,设计稿无)设置指南横幅、API info、公告、FAQ、uptime 面板 | ✅ 存在(`overview-dashboard.tsx:612-786`);B1 适配决策:重排进设计结构之后,不得删除 |

功能保全素材:见 R2-00 盘点(filter/preferences dialog 各字段、localStorage 偏好、admin 守卫、4 个 API endpoint、懒加载 fallback)。

### B2 API Keys — `/keys`

设计基准:`SCREENS.keys`(screens-console.js:75-99)

| # | 设计稿 section | 现状 |
|---|---|---|
| 1 | 页头:title + 副标题(scoped keys 文案)+ Docs 按钮 + Create API key 主按钮 | 🟡 标题 + 创建按钮(`features/keys/index.tsx:31-34`);无副标题与 Docs 入口 |
| 2 | 3 列 StatCard(Active keys / Monthly spend / Requests today) | ❌ 无统计行 |
| 3 | new-key InlineAlert:brand-subtle 面板 + check icon + 「shown only once」+ mono 遮罩 SecretReveal + Copy | 🟡 创建后弹 dialog 展示 key,非页内 InlineAlert+SecretReveal 形态 |
| 4 | 表格:Name(主 + mono key 副行)、Models tag、Spend(`$182.40 of $300` + 进度)、Status badge(dot)、Last used、hover 行内 actions(copy/edit/delete) | 🟡 现 12 列 DataTable(`api-keys-columns.tsx:70-322`)含 quota 进度,但无「spend of limit」mono 形态、actions 为下拉菜单非 hover icon 组 |
| 5 | FilterBar:panel 头部 search(Filter keys) | 🟡 toolbar 搜索 + status 过滤,非 panel-head FilterBar 形态 |

功能保全(重构前已枚举):12 列;name/token 双搜索;status 过滤;批量复制/删除;Mutate Drawer 8 字段;CC Switch dialog;Copy Connection Info;Chat 预设跳转;启用/禁用;移动端卡片列表 + skeleton;空态。

### B3 Wallet — `/wallet`

设计基准:`SCREENS.credits`(screens-console.js:170-197)

| # | 设计稿 section | 现状 |
|---|---|---|
| 1 | 两列 1.3fr/1fr 布局 | 🟡 现为 stats 行 + 左右卡片(`features/wallet/index.tsx:263-325`),非该栅格 |
| 2 | Balance hero Panel:`// balance` eyebrow + display 46px 余额 + `≈ 82M tokens` 估算 + healthy delta + days-left | 🟡 三卡 `WalletStatsCard`,无 hero 形态/token 估算/burn-rate |
| 3 | Add credits Panel:`$10/$25/$50/$100` PresetChip(display 字体可选中)+ `$` CurrencyInput + USD select + `// pay with` 支付 ChipGroup(Card/支付宝/Crypto)+ `Add $50.00 →` 联动 CTA + No markup badge | 🟡 `recharge-form-card.tsx` 有预设金额按钮 + 输入 + 支付方式列表,但非 chip 解剖、CTA 不随金额联动 |
| 4 | Auto top-up Panel:switch + `≤ $25` `+ $50` ThresholdInput | 🔵 后端无自动充值能力 → 适配决策(隐藏或降级,不做假开关) |
| 5 | Transactions Panel:TransactionRow 列表(类型 + mono 日期副行 + 方向色金额) | 🟡 现为 BillingHistoryDialog 弹窗(`billing-history-dialog.tsx:62`),非页内列表 |
| 6 | (现有能力)SubscriptionPlansCard、AffiliateRewardsCard、兑换码输入、划转 dialog | ✅ 存在;B3 用 PlanCard/Panel 重排进右列 |

功能保全:四种支付确认流程(Online/Epay、Stripe、Creem、Waffo Pancake)、兑换码、推荐划转、`?show_history=true`、账单历史搜索/筛选/分页/admin 完成订单、min_topup/折扣展示。

### B4 Playground — `/playground`

设计基准:`SCREENS.playground`(screens-console.js:106-135)

| # | 设计稿 section | 现状 |
|---|---|---|
| 1 | 左 flex + 右 320px 参数 rail 栅格 | ❌ 单列布局(`features/playground/index.tsx:191-226`),无参数 rail |
| 2 | 左上 ModelSelectorHeader:avatar + `anthropic/claude-opus-4.6` select + throughput/价格 tags + reset/share iconbtn | ❌ 模型选择在 composer 内(`ModelGroupSelector`),无头部形态/tags/reset/share |
| 3 | 消息流:角色 avatar(user=surface-3/assistant=brand-subtle)+ speaker label + 流式 blinking 光标 | 🟡 ai-elements Message 有 from 样式,无统一 avatar 底色/speaker label 解剖、无 blinking 光标 |
| 4 | Composer:`Send a message… (⌘↵ to send)` + 上箭头主按钮 | 🟡 PromptInput 存在,无 ⌘↵ 提示形态 |
| 5 | 参数 rail:`// parameters` eyebrow + ParameterSlider×4(label + mono 值 + 填充轨道)+ Stream/JSON mode/failover SettingRow toggles + `// this session` SessionStats(Tokens/Cost/Latency) | ❌ 参数 UI 完全缺失(类型/状态/payload 已支持,`types.ts:110-129`);SessionStats 缺失 |
| 6 | 移动端:参数 rail 塌缩为抽屉 | ❌ |

功能保全:消息编辑(Save/Save&Submit)、重发、分支版本导航、reasoning(`<think>` 折叠)、sources、停止生成、建议 pills、模型分组选择、流式渲染、复制/删除、错误消息组件;附件菜单为「开发中」占位(保持)。

### B5 Chat — `/chat/$chatId`

设计基准:`SCREENS.chat`(screens-console2.js:209-233)。适配前提:消息区为外部预设 iframe,不可重做;范围 = shell。

| # | 设计稿 section | 现状 |
|---|---|---|
| 1 | 左 260px 会话 rail:New chat 按钮 + search + `// today` 日期 eyebrow 分组 + ConversationRailItem(标题 + 模型/时间副行 + active)+ 底部用户卡 | ❌ 无侧栏;预设列表仅在全局 sidebar 导航中 |
| 2 | 顶部 bar:会话标题 + 模型 tag(avatar)+ share/more iconbtn | ❌ 无顶部 bar(`routes/_authenticated/chat/$chatId.tsx:156` 直接渲染 iframe) |
| 3 | iframe 容器面板化 | 🟡 裸 iframe |
| 4 | 空状态(无预设/非 web 预设/key 加载/错误) | ✅ 已有 5 种状态(`$chatId.tsx:75-153`),需按 YouBox 形态统一 |

功能保全:preset 解析(localStorage status.chats)、apiKey 注入 resolveChatUrl、camera/microphone 权限、非 web 预设外链提示。

### B6 Usage Logs + 通知 — `/usage-logs/*` + NotificationPopover

设计基准:`SCREENS.usageLogs`(screens-console.js:144-167)+ `SCREENS.notifications`(screens-console2.js:315-330)

| # | 设计稿 section | 现状 |
|---|---|---|
| 1 | 页头:title + 副标题 + Filters + Export CSV | 🟡 无副标题;Export ❌(🔵 后端无导出 → 适配决策) |
| 2 | FilterBar 行:search(model/key/request id)+ All models / All status / 时间范围 select | 🟡 `common-logs-filter-bar.tsx:66` 字段齐(还更多:group/token/username/channel/request id),但形态为 primary+advanced 折叠,非单行 FilterBar + 下拉 |
| 3 | 表格:Time(mono HH:MM:SS)、Model(avatar+名)、Endpoint tag、Tokens/Cost/Latency 右对齐 mono、Status badge(200/429/500 语义色) | 🟡 列存在(`common-logs-columns.tsx:263-800`)但形态不等价:时间为完整时间戳+类型 badge、无 endpoint tag 列、数值列非右对齐 mono 规范、无 status code badge |
| 4 | 表尾分页行(`Showing 9 of 38,204` + Prev/Next) | ✅ DataTable 分页(形态待统一) |
| 5 | drawing/task section 同构 | ✅ 三 section 已同构(tabs 切换) |
| 6 | 详情:Panel + CodeBlock 形态 | 🟡 `details-dialog.tsx` 内容完备(计时/计费/缓存/审计),形态非 Panel+CodeBlock |
| 7 | Notifications:FilterChips(All 12/Unread 3/Billing/System)+ `// today` 日期分组 + NotificationItem(语义色 icon tile + title + body + mono 时间 + unread dot)+ Mark all read / Preferences | ❌ 现 NotificationPopover 为 notice/announcements 两 tab markdown 流(`notification-popover.tsx:318-344`),无 item 化/分组/已读管理(🔵 数据模型按 notice/announcements 适配) |

功能保全:9+ 筛选字段、UserInfoDialog、详情各分区、列显隐(ViewOptions)、移动端 Drawer 筛选 + 卡片列表、admin 守卫列、prompt/image/audio/fail-reason dialogs、CacheStatsDialog。

### B10 Subscriptions — `/subscriptions`

设计基准:`SCREENS.subscriptions`(screens-console2.js:236-259)。适配前提:现页为**管理员计划管理**,设计稿为**用户订阅视图**——管理表不得删。

| # | 设计稿 section | 现状 |
|---|---|---|
| 1 | 当前计划 hero(Pro badge + $20/mo display + renews 行 + Change/Cancel) | 🔵 用户侧无此数据模型;形态落 wallet 订阅卡(B3)+ 此页 PlanCard 预览,适配决策记录 |
| 2 | This period's usage(Requests/Rate limit/Seats ProgressBar 行) | 🔵 同上 |
| 3 | Invoices 表 | 🔵 用户侧发票不存在;管理侧有 topup 历史(wallet) |
| 4 | Available plans:PlanCard 列表(current 高亮/Choose) | 🟡 管理表存在计划数据;无 PlanCard 预览形态 |
| 5 | (现有能力)管理表 9+ 列、Mutate Drawer(价格/时长/配额重置/支付产品/购买限制)、合规门控 alert、启停 dialog | ✅ 保留,升级表格 v2 + StatCard 行 |

### B9 Redemption Codes — `/redemption-codes`

设计基准:`SCREENS.redemptionAdmin`(screens-admin2.js:97-121)+ `SCREENS.redemption`(用户侧输入形态,供 wallet 兑换入口复用)

| # | 设计稿 section | 现状 |
|---|---|---|
| 1 | 两列 340px/1fr:左生成器 Panel(Value/Quantity/Max uses/Expires + `Generate 25 codes` CTA + 「shown once」说明) | 🟡 生成在 Mutate Drawer(name/quota/count/expired),非常驻左栏生成器 |
| 2 | 右上 3 StatCard(Codes issued/Active/Value redeemed) | ❌ |
| 3 | 批次表:Code mono 遮罩、Value、Used x/y、Progress ProgressBar、Status badge、copy/delete rowact | 🟡 现 10 列表格含遮罩 code/status,无 Used 进度条形态 |
| 4 | 表头 search | ✅ name/id 搜索 |

功能保全:批量复制(name\tkey)、删除无效码、启停条件(未用未过期)、过期计算、多选。

---

## 二、管理页面

### B7 Channels — `/channels`

设计基准:`SCREENS.channels`(screens-admin.js:12-31)

| # | 设计稿 section | 现状 |
|---|---|---|
| 1 | 页头:title + 副标题 + Test all + Add channel | 🟡 创建/测试全部在 PrimaryButtons 区(`channels-primary-buttons.tsx:55`),无副标题,形态不一致 |
| 2 | 4 列 StatCard(Total/Healthy/Degraded/Offline,icon label) | ❌ 无统计行(🔵 按现有渠道状态/响应时间聚合) |
| 3 | panel-head:tabs(All/Enabled/Issues)+ search | 🟡 现为 faceted filter(status/type/group/model),无 tabs 形态 |
| 4 | 表格:Channel(avatar+名+类型 mono 副行)、Models tag、Priority mono、Balance 原币种、Latency 阈值 badge、Enabled 行内 Switch、rowact(test/edit/more) | 🟡 14 列存在(优先级/权重可内联编辑保留),status 为 badge 非行内 Switch、latency 无阈值 badge、actions 为菜单 |
| 5 | 创建/编辑 Drawer 多 section 表单 | ✅ 保留,内部 SettingsPanel 化 |

功能保全(必须逐 dialog):16 个 dialog/drawer(Mutate、Test、BalanceQuery、FetchModels、Ollama、Copy、MultiKeyManage、TagBatchEdit、EditTag、UpstreamUpdate、CodexUsage、CodexOAuth、ParamOverrideEditor、StatusCodeRisk、MissingModelsConfirmation、MultiKey 行操作)+ 标签聚合模式(localStorage)+ 聚合行展开 + 批量启/停/删/设标签 + Test all/Update balances/Fix abilities/Delete disabled + ID 排序切换。

### B8 Users — `/users`

设计基准:`SCREENS.users`(screens-admin.js:41-60)

| # | 设计稿 section | 现状 |
|---|---|---|
| 1 | 页头:title + `8,420 registered users` 副标题 + Export + Add user | 🟡 无副标题/Export(🔵 后端无用户导出 → 适配决策) |
| 2 | 4 列 StatCard(Total/Active today/Paying/Total balance + delta) | ❌(🔵 按现有统计能力适配,无则降级) |
| 3 | panel-head tabs(All/Admins/Banned)+ search | 🟡 现为 role/status faceted filter + 搜索 |
| 4 | 表格:User(avatar+名+mono 邮箱副行)、Role badge(Root=info/Admin=brand)、Balance/Used mono、Status dot badge、rowact | 🟡 10 列存在,无 avatar cellflex/mono 规范形态 |
| 5 | 表尾 `Showing 6 of 8,420` + Prev/Next | ✅ 分页存在 |
| 6 | Mutate Drawer 内 SettingsPanel 化(Basic/Auth/Quota/Group/Status/Role/Binding) | 🟡 分区存在,形态待统一 |

功能保全:删除 dialog、配额调整 dialog(add/subtract/override + USD 换算预览)、绑定信息展示、admin 守卫。

### B11 Models 管理 — `/models/metadata|deployments`

设计基准:`SCREENS.settingsModels` catalog 表(screens-admin2.js:43-62)+ `SCREENS.marketplace` 词汇

| # | 设计稿 section | 现状 |
|---|---|---|
| 1 | metadata 表:Model(avatar+名+mono vendor/id 副行)、Input/Output per 1M mono、Multiplier mono、Enabled Switch、Edit iconbtn | 🟡 13 列存在(`models-columns.tsx:63`),status 非行内 Switch、无定价 mono 形态(定价在 system-settings ratio) |
| 2 | panel-head:search + Sync rates 按钮 | 🟡 SyncWizardDialog 存在,形态不同 |
| 3 | deployments 表 + 状态 badge | 🟡 11 列存在 |
| 4 | 连接守卫(InlineAlert 形态) | 🟡 `deployment-access-guard.tsx:94` 为 LoadingStep + retry,改 InlineAlert 形态 |
| 5 | Create deployment Drawer 内 SettingsPanel 化(Basic/Hardware/Duration/Advanced) | 🟡 分区存在 |

功能保全:同步向导(预览 diff/冲突处理)、MissingModels/UpstreamConflict dialog、vendor 管理、deployments 日志/详情/扩容/重命名/删除、批量操作。

### B12 System Settings — `/system-settings/**`(7 组 38 section)

设计基准:`SCREENS.settings` / `settingsModels` / `settingsSecurity`(screens-admin.js:65-95、screens-admin2.js:43-87)

| # | 设计稿 section | 现状 |
|---|---|---|
| 1 | 页头 actions:Discard + Save changes(全局 sticky) | 🟡 每 section 独立 `SettingsPageFormActions`,分散保存 |
| 2 | 220px sticky SettingsRail(icon + label + active),移动端塌缩 | 🟡 现为全局 sidebar 嵌套导航(`layout/config/system-settings.config.ts:45`),非页内 rail |
| 3 | 每 section = Panel(eyebrow 分组 + panel title)+ SettingRow(label + desc + 右侧 control)列表 | 🟡 现为 `SettingsSection` + form grid,非 SettingRow 解剖 |
| 4 | JSON/代码编辑器统一 CodeBlock/editor 形态 | 🟡 json-editor 等存在,形态分散 |
| 5 | dirty guard | ✅ `FormNavigationGuard` 存在,接 StickySaveBar |

38 section 清单已定版(见盘点:site 4 / auth 5 / billing 6 / models 6 / security 3 / content 7 / operations 7)。billing 组涉及表达式定价 UI,实现前必读 `pkg/billingexpr/expr.md`。

### B13 Profile — `/profile`

设计基准:`SCREENS.profile`(screens-admin.js:98-133)

| # | 设计稿 section | 现状 |
|---|---|---|
| 1 | 两列 300px/1fr | 🟡 现为 header + 卡片网格(`features/profile/index.tsx:36-89`) |
| 2 | 左账户卡:84px avatar + display 名 + mono 邮箱 + Root/Verified badges + Change avatar + Member since/Group/Requests Metric 行 | 🟡 `profile-header.tsx:38` 有头像/统计卡,非左栏账户卡解剖 |
| 3 | Profile Panel(Display name/Username/Email+verified badge/Timezone 表单) | 🟡 `profile-settings-card.tsx` 存在,字段映射现有能力 |
| 4 | Security Panel:SettingRow(Password/2FA+on badge/Passkeys)+ 行尾按钮 | 🟡 分散为 ChangePassword/TwoFA/Passkey 卡片 |
| 5 | Connected accounts Panel(provider icon + Connect/Unlink) | 🟡 `account-bindings-tab.tsx:59` 存在,形态不同 |
| 6 | (现有能力)语言偏好、侧栏模块、签到日历、Access Token、删除账户 | ✅ 保留,SettingsPanel 重排 |

功能保全:密码校验规则、2FA setup/disable/备份码、Passkey 注册/删除 + 安全验证、Email/OAuth/Telegram/微信绑定 dialogs、签到 + Turnstile、ProfileDropdown 菜单同步。

---

## 三、第一轮已重做页面的结构性复核

复核方式:逐 SCREEN section 对照现实现 JSX 结构(file:line)+ 浏览器截图(`screenshots/r2-00/`)。结论:pass(结构等价)或列入对应 Phase B 步骤缺口。

### Home/Landing(`SCREENS.landing`)— **pass(留 1 缺口)**

| 设计稿 section | 现状 | 结论 |
|---|---|---|
| heroA:eyebrow + 大标题 + CTA×2 + check 行 + ticker 统计 + code 块 | `sections/hero.tsx:46-244`(eyebrow/标题/CTA/终端 demo) | pass(code 块为交互终端 demo,等价升级) |
| providers 行 | `sections/stats.tsx` 统计 + providers | pass |
| features 3×N 卡(icon tile + 标题 + 描述) | `sections/features.tsx:36-135` 8 卡 | pass |
| howItWorks(编号步骤 + quickstart code) | `sections/how-it-works.tsx` | pass;**缺口 → B15**:quickstart 代码块未用统一 CodeBlock chrome(三窗点 + 文件名 + copy) |
| CTA 面板(brand-border + glow) | `sections/cta.tsx` | pass |
| footer | `index.tsx:72` | pass |
| 自定义首页(markdown/html/iframe) | `index.tsx:43-62` | 保全项,非设计稿 section |

### About(`SCREENS.about`)— **pass(条件性)**

现状为「内容可配置」页:有内容时渲染配置内容,无内容时 `EmptyAboutState`(`features/about/index.tsx:40-123`)。设计稿 hero/统计/价值卡/backed-by 为营销示例内容。**适配决策(B15 确认)**:结构以可配置内容为准,空态卡按 YouBox 形态已重做 → pass。

### Legal(`SCREENS.legal`)— **缺口 → B15**

| 设计稿 section | 现状 | 结论 |
|---|---|---|
| 左 220px sticky TOC rail + Last updated | ❌ 无 TOC(`legal-document.tsx:49-100` 单栏渲染) | 缺口:有内容时左栏 TOC(可由 markdown 标题生成)或记录适配 |
| 标题 + 副标题 + 分节正文 + info 提示面板 | 内容可配置渲染 | pass(条件性) |

### Pricing 营销页(`SCREENS.pricing` 计划卡)— **适配确认**

现 `/pricing` 是**模型广场**(对应 `SCREENS.marketplace`),非订阅计划页;站点无公开计划页能力。适配决策(B14 记录):`SCREENS.pricing` 计划卡形态由 PlanCard 组件承载(A4),用于 wallet/subscriptions;无独立营销 pricing 路由 → adapted。

### Marketplace(`SCREENS.marketplace`,现 `/pricing`)— **缺口 → B14**

| 设计稿 section | 现状 | 结论 |
|---|---|---|
| 页头 eyebrow + title + 副标题 + search | `features/pricing/index.tsx:169-193` | pass |
| tabs(All/Chat/Image/…+ 计数)+ sort tag | 🟡 sidebar 过滤 + toolbar select | adapted(过滤能力更强,B14 复核 tabs 形态是否上提) |
| 模型卡:hover(translateY + brand glow)、收藏星、desc 2 行截断、tags、footer Metric(In/Out 价格 + throughput)+ `metric--end` | 🟡 hover ✅(`model-card.tsx:91-95`);**收藏星 ❌**;footer 为自有形态非 Metric 组件 | 缺口:收藏星(🔵 无后端收藏 → 本地收藏或适配决策)、footer Metric 化 |
| Load more | 分页 | pass(adapted) |

### Model Detail(`SCREENS.modelDetail`,现 Drawer/Sheet)— **缺口 → B14**

| 设计稿 section | 现状 | 结论 |
|---|---|---|
| 面包屑 + 大头部(52px logo + New badge + Favorite + Open in Playground) | 🟡 Sheet 头部有 icon/名称/copy,无 Favorite/Open in Playground | 缺口 |
| tabs--line(Providers/Pricing/Performance/Apps)+ Provider 表(YouBox Auto 高亮行) | 🟡 有 Overview/Performance/API tabs + per-group 性能表,无 provider 高亮行形态 | 缺口(按现有数据适配:group = provider 行) |
| 右栏 spec 卡(display 大数 2×3)+ Weekly usage sparkline + quick call CodeBlock | 🟡 SummaryGrid/UptimeSparkline/code samples 存在但形态不一致(spec 非 display 大数,sparkline 为 uptime 条) | 缺口 |

### Rankings(`SCREENS.rankings`)— **pass(留缺口)**

| 设计稿 section | 现状 | 结论 |
|---|---|---|
| 页头 eyebrow/title/副标题 + 时期 tabs | `features/rankings/index.tsx:68`(Today/Week/Month/Year/All) | pass |
| 4 StatCard(Tokens routed/Active apps/Models served/Median latency + delta) | ❌ 无统计行 | 缺口 → B14(🔵 按现有聚合数据适配) |
| 排行表:大序号(top3 brand 色)、市场份额 bar、Tokens/wk mono、Growth badge | 🟡 ModelsSection 双列表 + GrowthText(↑303% 文本,`growth-text.tsx:31-60`),无 statcard/份额 bar 统一形态,growth 为文本非 badge | 缺口 → B14:growth badge 化、份额 ProgressBar |
| (现有)MarketShare/Pulse section | ✅ 内容超集,保留 |

### Auth(`SCREENS.signIn/signUp/forgotPassword/resetPassword/otp`)— **pass**

| 设计稿 section | 现状 | 结论 |
|---|---|---|
| signIn/signUp 双栏(表单 + 引述侧栏 + 统计) | `auth-layout.tsx` 分割布局 + 品牌面板 ✅ | pass |
| OAuth 按钮网格 + OR 分隔 | `user-auth-form.tsx:312-317` ✅(provider 集更全) | pass |
| 密码强度条(signUp/reset) | sign-up 8-20 校验存在;强度条 ❌ | 缺口 → B15(低优先,可适配) |
| forgot/otp 单卡居中 + glow | `forgot-password`/`otp` ✅(OTP 6 位 InputOTP + backup code 超集) | pass |
| reset:success icon tile + 新密码 | `reset-password-confirm/index.tsx:107-199`(流程为发送新密码,形态不同) | adapted(后端流程差异,记录) |

### Errors(`SCREENS.error404/500`)— **pass**

ErrorPageShell(`error-page-shell.tsx:36-77`):glow + icon tile + display 96px 状态码 + 标题/描述 + actions + footnote——逐节等价,且扩展 401/403/503。设计稿 request-id mono 行 ❌ → 缺口记 B15(适配:无请求 id 数据,确认跳过)。

### Setup(`SCREENS.setup`)— **pass(留 1 缺口)**

| 设计稿 section | 现状 | 结论 |
|---|---|---|
| 居中 glow + brand + 标题 | `setup-wizard.tsx:293-317` ✅ | pass |
| 横向 step 圆点 + 连接线(done=success 勾/active=brand/pending) | 🟡 4 步卡片网格(`setup-wizard.tsx:330-371`),语义等价但非圆点+连线解剖 | 缺口 → A4 StepIndicator 定版后 B15 对齐 |
| 表单卡 + eyebrow 步骤说明 + Back/Continue | ✅ StepNavigation | pass |
| 底部 mono 版本/连接状态行 | ❌ | 缺口 → B15(数据:版本号可得,DB/Redis 状态适配) |

---

## 四、定版差距总表(进入 Phase B 的顺序与范围)

| 步骤 | 路由 | 差距等级 | 关键缺失 |
|---|---|---|---|
| B1 | /dashboard/* | 重 | 页头操作行、统一 StatCard、面积图 Panel+tabs、Spend by model、Recent activity、Credit balance、performance 形态 |
| B2 | /keys | 重 | StatCard 行、InlineAlert+SecretReveal、表格 v2、FilterBar |
| B3 | /wallet | 重 | Balance hero、Add credits chip 体系、页内 Transactions、auto top-up 适配 |
| B4 | /playground | 重 | 参数 rail 全部、ModelSelectorHeader、SessionStats、消息解剖、移动端抽屉 |
| B5 | /chat/$chatId | 重 | 会话 rail、顶部 bar、容器面板化 |
| B6 | /usage-logs/* + 通知 | 重 | FilterBar 形态、列规范、状态 badge、NotificationItem 体系 |
| B7 | /channels | 重 | StatCard、tabs、行内 Switch、LatencyBadge、Drawer SettingsPanel 化 |
| B8 | /users | 中 | StatCard、tabs、列规范 |
| B9 | /redemption-codes | 中 | 左生成器、StatCard、Used 进度 |
| B10 | /subscriptions | 中 | 表格 v2 + StatCard + PlanCard 预览(管理表保留) |
| B11 | /models/* | 中 | 列规范、行内 Switch、守卫 InlineAlert、Drawer SettingsPanel 化 |
| B12 | /system-settings/** | 重 | SettingsRail、SettingRow 体系、StickySaveBar(38 section) |
| B13 | /profile | 中 | 两列布局、账户卡、Security SettingRow、Connected accounts |
| B14 | pricing/marketplace/detail/rankings | 轻-中 | 收藏星、Metric footer、spec 卡、provider 高亮、rankings statcard+badge |
| B15 | 营销/认证/错误/setup | 轻 | quickstart CodeBlock、legal TOC、密码强度条、StepIndicator 对齐、setup 底部状态行、error request-id 适配 |

## 五、Phase A 组件缺口确认(由上表反推)

- **patterns**:Panel、Eyebrow、StatCard/StatCardRow、Metric、ProgressBar、Sparkline、DeltaBadge —— 全部缺失或仅有私有实现(dashboard `stat-card.tsx`、`log-stat-cards.tsx`、ratio bar 等)。
- **data-table v2**:stat header 插槽、FilterBar、tabs 过滤、MonoCell/CellFlex/LatencyBadge/RowActions/行内 Switch 列 —— 现 DataTablePage 无这些插槽。
- **settings**:SettingRow/SettingsPanel/SettingsRail/StickySaveBar —— 现为 SettingsSection+form grid。
- **form**:ChipGroup/PresetChip、ParameterSlider、CurrencyInput、ThresholdInput、MonoInput —— 缺失。
- **feedback**:InlineAlert、SecretReveal、StatusBadge 扩展(dot/solid + 词汇映射)、StepIndicator、NotificationItem/Group/FilterChips、PlanCard、InvoiceRow/TransactionRow —— 缺失或分散。
- **ai/code**:CodeBlock 统一 chrome、Message 解剖、流式光标、ModelSelectorHeader、SessionStats、ConversationRailItem —— 缺失或形态不一致。

## 六、复核中发现的环境事实

- 本地验证环境:Go 后端(SQLite,self-use 模式,root 账户)on `:3001` + `bun run dev` on `:3000`(`VITE_REACT_APP_SERVER_URL=http://localhost:3001`)。
- 未初始化实例所有路由强制重定向 `/setup`(setup 截图取自该状态)。
- `/rankings` 在未登录 + 当前站点配置下重定向回 `/`(疑受站点配置/数据开关控制)——B14 实现前需确认入口条件并记入该页对照表。

## 七、复核证据

- 截图:`docs/redesign-reviews/round2/screenshots/r2-00/`(公开路由 × 1280 dark/light;与 `_preview.html` 渲染的设计稿并排对照在各 B 步骤验收时补全量)。
- 代码结构证据:本文档各表 file:line 引用。
