# YouBox 前端第二轮重设计计划 — 交互与页面结构 100% 重做

## 背景:第一轮的差距

第一轮(`redesign/youbox-frontend-100`,基线 `e22fadc9`)完成了 token 体系、UI primitives、overlay、App shell、营销页、认证页、错误页/Setup 的结构性重做,并通过了 80 路由 × 5 视口的浏览器验证。但代码审计证实:**大部分控制台/管理页只做了 token 级换肤,页面结构与交互未按设计稿重做**:

| 第一轮 commit | 声明范围 | 实际改动 |
| --- | --- | --- |
| `3db21cde` | dashboard 重设计 | 1 文件 2 行 |
| `9c5ca798` | playground/chat/ai-elements | 1 文件 5 行 |
| `ad4f7786` | keys + wallet | 4 文件 6 行 |
| `9084393b` | channels/users/redemptions/subscriptions | 4 文件 6 行 |
| `b5954ef7` | 全部 system-settings | 3 文件 11 行 |
| `beeb5901` | profile | 3 文件 5 行 |

第二轮的目标:**以 `youboxdesign/screens-*.js` 的逐 SCREEN 结构定义为基准,先逐个重设计可复用组件,再逐个页面重做布局与交互**。token 对齐不再计入任何完成度。

## 第二轮的完成定义(先于一切规则)

一个页面只有同时满足以下四条才算"完成":

1. **结构等价**:设计稿对应 SCREEN 的每一个 section(stat 行、chart 面板、filter bar、参数 rail、balance hero……)在页面中有对应实现,或在该页的《结构对照表》中有经 review 通过的适配决策。
2. **交互等价**:设计稿标注的交互(可选中 chip、行内 toggle、tabs 过滤、展开行、复制反馈、流式光标……)逐项实现并经浏览器操作验证。
3. **功能保全**:重构前从现实现枚举的《功能保全清单》(列、筛选、弹窗、抽屉、校验、守卫、loading/error/empty、导入导出/复制/删除/保存)逐项在新结构中复验通过。
4. **组件消费**:页面只消费 Phase A 产出的可复用组件;不允许页内一次性样式实现本应属于组件库的模式。

## 硬性反绕过规则

以下规则的任何一条不满足,该步骤 review 直接判 fail,不得进入下一步:

1. **结构对照表前置规则**:每个页面步骤在写第一行实现代码之前,必须先提交该页的《结构对照表》(模板见下文)到 `docs/redesign-reviews/round2/`,逐节列出 `设计稿 section → 目标组件/文件 → 交互清单 → 适配决策`。review 以此表逐行验收。
2. **禁止换肤记账规则**:diff 中仅有 className/token 调整而无 JSX 结构变化的页面步骤,一律判 fail。commit 不允许使用 `redesign/restructure` 字样描述纯样式改动。
3. **适配必须显式规则**:设计稿假设的数据或后端能力如果当前不存在(如自动充值阈值、用户级订阅发票),不允许静默跳过——必须在《结构对照表》的适配决策列写明:为什么不做/降级为什么形态/用户入口在哪里,并由 review 确认。**适配是允许的,无记录的跳过不允许。**
4. **功能保全清单前置规则**:重构一个页面前,必须先从当前实现(以及 `web/reference/default-before-youbox/` 交叉对照)枚举《功能保全清单》并入库;页面完成时逐项打勾。任何旧功能消失且无对照表说明 = fail。
5. **组件先行规则**:Phase B 页面步骤不得新建本应可复用的视觉模式;发现缺口必须回到 Phase A 补组件(可以在同一步内完成,但组件必须落在共享目录并进 Design Lab)。
6. **Design Lab 演示规则**:Phase A 每个组件必须能在 Design Lab(开发环境专用画廊路由)中独立演示全部 variants/states,浏览器审查以画廊为准,不接受"在某页顺带看一眼"。
7. **浏览器门槛规则**(沿用第一轮并加强):每个页面步骤验收必须覆盖 375/768/1280/1536 断点、dark+light、hover/focus/active/disabled/loading/error/empty、键盘操作、reduced motion;**另增**:与设计稿 SCREEN 的并排截图对照(设计稿可用 `youboxdesign/_preview.html` 渲染)。
8. **每步 commit → review → push 规则**:沿用第一轮。review 记录落 `docs/redesign-reviews/round2/r2-XX-*.md`,截图落 `docs/redesign-reviews/round2/screenshots/r2-XX/`。
9. **品牌与项目保护规则**:沿用第一轮;不得触碰受保护的项目归属信息(见 CLAUDE.md Rule 5)。涉及计费表达式 UI 时必须先读 `pkg/billingexpr/expr.md`。
10. **i18n 规则**:沿用第一轮;新增文案全部走 `t()`,每步 `bun run i18n:sync`。

## 审查产物模板

### 《结构对照表》(每页一份,实现前提交)

```text
# r2-Bx 结构对照表 — /route
设计基准: SCREENS.xxx (youboxdesign/screens-yyy.js)

| # | 设计稿 section | 现状 | 目标实现(组件 + 文件) | 必做交互 | 适配决策 |
| 1 | 4 列 statcard 行(Requests/Spend/Tokens/Latency) | 无 | StatCardRow → features/dashboard/components/... | delta 方向色、mono 数值 | 数据来自现有 /api/... |
| 2 | ... |
```

### 《功能保全清单》(每页一份,实现前提交,完成时逐项勾)

```text
| # | 旧功能(列/筛选/弹窗/流程) | 旧入口 | 新入口 | 复验结果 |
```

### review 记录(每步一份)

- commit hash / branch / push ref
- 结构对照表逐行验收结果(每行 pass/adapted/fail)
- 功能保全清单勾选结果
- 浏览器审查:路由 × 断点 × 主题 × 交互清单,截图路径,与设计稿并排对照图
- 验证命令结果(typecheck / lint / build / i18n:sync)
- 结论 pass / 需修复项 + follow-up commit

## 实施命令

全部在 `web/default/` 执行,沿用第一轮:`bun run typecheck`(每步)、`bun run lint` + `format:check`(大范围 TS/TSX)、`bun run build`(路由/懒加载/全局样式)、`bun run i18n:sync`(文案)、`bun run copyright:check`(新文件)。

---

# Phase 0 — 差距定版与基础设施

### R2-00 逐页结构差距定版

**交付**:

- 对计划覆盖的全部路由,逐页生成《结构对照表》初版(只填"设计稿 section / 现状"两列),形成定版差距清单 `docs/redesign-reviews/round2/r2-00-gap-index.md`。
- 第一轮已结构性重做的页面(营销 home/about/legal、auth、errors、setup、pricing/rankings 部分)在本步做**结构性复核**:逐节对照 SCREENS,确认 pass 或列入 Phase B 缺口。复核必须有证据(截图对照),不允许"第一轮做过了"一句话带过。
- 建立 `docs/redesign-reviews/round2/` 与 screenshots 目录。

**门槛**:差距清单覆盖全部路由;每页至少列出设计稿 section 清单;commit → review → push。

### R2-01 Design Lab 组件画廊

**交付**:

- 新增开发环境专用路由(如 `/design-lab`,仅 `import.meta.env.DEV` 注册),按组件分组演示 variants/states/sizes/dark+light。
- 画廊页本身使用 YouBox page shell,作为后续所有 Phase A 验收的载体。
- 不进生产构建(构建产物中验证不存在该路由)。

**门槛**:typecheck/build 通过且生产包无画廊代码;commit → review → push。

---

# Phase A — 可复用组件逐个重设计

设计基准:`youboxdesign/_ds/*/readme.md`、`_ds_bundle.js`(12 个参考组件)、`youbox-app.css`(page/panel/statcard/table/field/badge/code 体系)。每个组件交付:解剖(anatomy)、variants、states、键盘行为、reduced-motion 行为、Design Lab 演示项、使用文档注释。落点:通用视觉模式 → `src/components/patterns/`(新建);表格体系 → `src/components/data-table/`;设置体系 → `src/components/settings/`(从 system-settings 抽取通用件);AI 体系 → `src/components/ai-elements/`。

### R2-A1 数据展示组件族

| 组件 | 解剖与状态(来自 DS) |
| --- | --- |
| `Panel` | surface-card + `panel__head`(title + 工具区)+ `panel__body`;可无头;头部 actions 插槽 |
| `Eyebrow` | `// UPPERCASE` mono 2xs 0.1em brand;作为 section 分隔的统一入口 |
| `StatCard`(统一版) | label(mono uppercase + 可选 icon)→ value(display 3xl + unit mono)→ delta(up/down/flat 语义色)+ 可选 mini sparkline;sm 尺寸变体;替换 dashboard 现有私有 StatCard 与 wallet 的简化卡 |
| `StatCardRow` | 3/4 列网格 + 响应式塌缩 |
| `Metric` | k(mono 9px uppercase)/ v(mono sm)对;`--end` 对齐变体 |
| `ProgressBar` | 6px pill,brand/teal/语义色填充;用量、兑换进度、订阅 seats 通用 |
| `Sparkline` | 单色面积小图,statcard 与表格行内通用 |
| `DeltaBadge` | 趋势 icon + mono xs,success/danger/muted |

**门槛**:全部进 Design Lab;dashboard 现有私有 StatCard 标记 deprecated(Phase B1 完成替换);typecheck;commit → review → push。

### R2-A2 表格体系 v2

基准:SCREENS 中 keys/usageLogs/channels/users/settingsModels 的表格形态。

- `DataTablePage` 升级:**stat header 插槽**(表格上方 StatCardRow)、**FilterBar**(search + 多个下拉过滤 + 右侧 Export/主操作,替代现 toolbar 布局)、tabs 过滤条(All/Enabled/Issues 形态)与 URL state 打通。
- 列规范组件化:`MonoCell`(右对齐数值/时间)、`CellFlex`(avatar/icon + 主文本 + 副文本)、`LatencyBadge`(阈值变色)、行内 `Switch` 列、`RowActions`(icon 按钮组,hover 显现)。
- 行交互:hover surface-hover、可展开行视觉、selected 态;`TableEmpty`/`TableSkeleton` 适配新结构。
- MobileCardList 同步升级,保证移动端等价。

**门槛**:Design Lab 用 mock 数据演示完整表格(含全部状态);现有消费方不破坏(typecheck + 现有页面冒烟);commit → review → push。

### R2-A3 表单与设置组件族

基准:SCREENS.settings / settingsModels / settingsSecurity / credits。

- `SettingRow`:label + description + 右侧 control(switch/select/input),禁用联动态。
- `SettingsPanel`:Panel + Eyebrow 分组 + SettingRow 列表。
- `SettingsRail`:220px sticky 左侧导航(icon + label + active 态),移动端塌缩为水平 scroll tabs。
- `StickySaveBar`:Discard / Save changes,dirty 态出现,固定页头或页脚。
- `ChipGroup` / `PresetChip`:可选中 chip(充值预设、支付方式、通知过滤),单选/多选,键盘可达。
- `ParameterSlider`:label + 数值(mono)+ 填充轨道;playground 参数 rail 用。
- `MonoInput` 变体、`CurrencyInput`(金额 + 货币选择)、`ThresholdInput`(≤ $25 + $50 形态)。

**门槛**:Design Lab 全演示;键盘逐项验证;commit → review → push。

### R2-A4 反馈与状态组件族

基准:SCREENS.keys(new-key alert)、redemption(validation alert)、notifications、subscriptions、setup。

- `InlineAlert`:success/warning/danger/info subtle 面板 + icon + 内容插槽(承载 new-key 复制条、兑换结果)。
- `SecretReveal`:mono 遮罩值 + copy 按钮 + "只显示一次"形态(keys 创建后)。
- `StatusBadge` 扩展:dot 变体、solid 变体,统一 200/429/500、Active/Limited/Revoked、Operational/Degraded/Down 词汇映射。
- `StepIndicator`:done/active/pending 圆点 + 连接线(setup 已有实现的抽取与定版)。
- `NotificationItem`:语义色 icon tile + title/body + mono 时间戳 + unread dot;`NotificationGroup`(eyebrow 日期分组);`FilterChips`(All/Unread/分类 + 计数)。
- `PlanCard`:plan 名 + 价格(display)+ 描述 + current/Choose 态。
- `InvoiceRow` / `TransactionRow`:类型 + 日期 + 金额(方向色)。

**门槛**:Design Lab 全演示;commit → review → push。

### R2-A5 代码与 AI 会话组件族

基准:SCREENS.playground / chat / modelDetail;现有 `components/ai-elements/*`。

- `CodeBlock` 统一版:chrome bar(三窗点 + 文件名/语言 + copy→Copied 动效)+ 语法高亮 token 色按 DS(key=orange-300、str=teal-300、fn=blue-500);quickstart、model detail、chat 共用。
- ai-elements 逐个过 YouBox 解剖:`Message`(角色 avatar 底色:user=surface-3 / assistant=brand-subtle、speaker label)、`Conversation`、`PromptInput`(composer + ⌘↵ 提示 + 附件/提交按钮形态)、`Reasoning`/`Sources`/`Tool`(折叠面板统一 Panel 形态)、流式光标(blinking bar,reduced-motion 降级)、`Loader`/`Shimmer`。
- `ModelSelectorHeader`:avatar + 名称 + 元信息 tags(throughput/价格)的选择器头。
- `SessionStats`:Tokens/Cost/Latency Metric 行。
- `ConversationRailItem`:标题 + 模型/时间副行 + active 态(chat 侧栏)。

**门槛**:Design Lab 演示 + playground 现有功能不回归(发消息/编辑/分支/reasoning 冒烟);commit → review → push。

---

# Phase B — 逐页重设计

顺序按"用户高频 → 管理低频"。每步固定流程:**①《结构对照表》+《功能保全清单》入库 → ② 实现 → ③ 浏览器验收(含设计稿并排对照)→ ④ commit → review → push**。以下每页列出设计基准、目标结构(验收即逐节核对此清单)与已知适配决策点。

### R2-B1 Dashboard(`/dashboard/overview|models|users`)

设计基准:`SCREENS.dashboard` + `SCREENS.performance`。

目标结构(overview):

1. 页头:问候副标题 + 时间范围选择 + 主操作(Export / New Key 入口适配现有能力)。
2. 4 列 StatCard 行:Requests / Spend / Tokens / Avg latency,delta + 趋势。
3. Requests over time Panel:面积图(双系列)+ 图内 tabs(Requests/Tokens/Spend)。
4. Spend by model Panel:模型行(avatar + 名称 + 金额 + 占比 ProgressBar)。
5. Recent activity Panel:近期请求表(model/endpoint/status badge/cost/time)。
6. Credit balance Panel:大数余额 + ProgressBar + burn-rate 预估 + 日消费 bar 图 + Top up 按钮(跳 wallet)。
7. 现有 API info / 公告 / FAQ / uptime 面板:重排进上述结构之后或按内容配置折叠,不得删除(适配决策记录)。

models/users 分析 section:沿用同一 page shell;LogStatCards 替换为统一 StatCard;图表色固定 brand/teal;performance 指标面板(uptime/p50/p99/error rate + sparkline、provider health 表)按 `SCREENS.performance` 形态并入 overview 或 models(适配决策记录)。

适配决策点:时间范围选择与现有 filter dialog 的关系(建议:常用范围上提为页头 select,高级过滤保留 dialog);Export 能力是否已有后端。

### R2-B2 API Keys(`/keys`)

设计基准:`SCREENS.keys`。

目标结构:

1. 页头:标题 + 副标题 + Docs(如有文档地址配置)+ Create API Key。
2. 3 列 StatCard:Active keys / Monthly spend / Requests today(数据源用现有统计接口,缺失项记适配决策)。
3. 创建成功后的 `InlineAlert` + `SecretReveal`:new key 一次性展示 + copy(替换现纯 dialog 展示,保留安全语义)。
4. 表格 v2:Name、Models(tag)、Spend(of limit,`$182.40 of $300` 形态 + ProgressBar)、Status badge、Last used、行内 actions(copy/edit/delete)。
5. FilterBar:search + 状态过滤。

功能保全重点:批量启用/禁用/删除、导入、分组、过期策略、移动端卡片列表。

### R2-B3 Wallet(`/wallet`)

设计基准:`SCREENS.credits`。

目标结构(两列 1.3fr/1fr):

1. Balance hero Panel:eyebrow + display 大数余额 + 等效 token 估算 + 健康 badge + burn-rate(可估算则显示,否则适配决策)。
2. Add credits Panel:`PresetChip` 金额预设(可选中)+ `CurrencyInput` 自定义 + `// pay with` 支付方式 ChipGroup(在线支付/Creem/兑换码等现有渠道映射)+ CTA 按钮文案随选择联动(`Add $50.00 →`)。
3. Auto top-up Panel:现后端如无此能力 → 适配决策(隐藏或降级);不允许做假开关。
4. Transactions Panel:`TransactionRow` 列表(方向色金额),整合现 BillingHistoryDialog 为页内列表 + "查看全部"入口。
5. 订阅计划卡(现 SubscriptionPlansCard)与 Affiliate 卡:用 `PlanCard`/Panel 重排进右列。

功能保全重点:四种支付确认 dialog 流程、兑换码、划转、`?show_history=true` 兼容参数。

### R2-B4 Playground(`/playground`)

设计基准:`SCREENS.playground`。

目标结构(左 flex + 右 320px 参数 rail):

1. 左上:`ModelSelectorHeader`(模型选择 + throughput/价格 tags)+ reset/share 按钮(share 如无后端 → 适配决策)。
2. 消息流:R2-A5 重做后的 Message/Conversation;流式 blinking 光标。
3. Composer:`PromptInput`(⌘↵ 提示)。
4. 右侧参数 rail:`ParameterSlider` × (temperature/max tokens/top p/frequency penalty 按现有支持项)+ Stream/JSON mode 等 `SettingRow` toggles + `SessionStats`(tokens/cost/latency)。
5. 移动端:参数 rail 塌缩为抽屉。

功能保全重点:消息编辑/重发/分支/reasoning/sources/停止生成/建议 pills/模型分组选择全部保留。

### R2-B5 Chat(`/chat/$chatId` + 预设导航)

设计基准:`SCREENS.chat`。

适配前提(必须写进对照表):当前 chat 是外部预设 iframe 容器,消息区不可重做。范围 = **shell**:左侧 `ConversationRailItem` 形态的预设列表(现 chat-presets)、顶部标题 + 模型 badge + 操作区、iframe 容器面板化、空状态(无预设)按 YouBox 形态。不允许以 iframe 为由跳过 shell 重做。

### R2-B6 Usage Logs + 通知 + 性能(`/usage-logs/*`、NotificationPopover)

设计基准:`SCREENS.usageLogs` + `SCREENS.notifications`。

目标结构(logs):

1. FilterBar:search(model/key/request id)+ Model/Status/时间范围下拉 + Export CSV(如无后端导出 → 适配决策)。
2. 表格 v2:Time(mono HH:MM:SS)、Model(avatar+名)、Endpoint tag、Tokens/Cost/Latency(右对齐 mono)、Status badge(200/429/500 语义色);三个 section(common/drawing/task)同构。
3. 详情:UserInfoDialog / 日志详情 / JSON viewer 统一 Panel + CodeBlock 形态。

NotificationPopover:`FilterChips`(全部/未读/分类 + 计数,按现有 notice/announcements 数据模型适配)+ `NotificationGroup` 日期分组 + `NotificationItem`(语义 icon tile + unread dot)+ Mark all read / Preferences(入口指向 profile 通知设置;无则适配决策)。

### R2-B7 Channels(`/channels`)

设计基准:`SCREENS.channels`。

目标结构:

1. 页头:Test all + Add channel。
2. 4 列 StatCard:Total / Healthy / Degraded / Offline(数据按现有渠道状态聚合)。
3. tabs 过滤(All/Enabled/Issues)+ search。
4. 表格 v2:Channel(avatar+名+类型)、Models、Priority、Balance(原币种)、Latency(`LatencyBadge` 阈值变色)、Enabled 行内 Switch、actions(test/edit/more)。
5. 创建/编辑保持 Drawer(多 section 表单),内部用 SettingsPanel 体系重排。

功能保全重点:15+ 个 dialog(测试、复制、多 key、标签聚合、参数覆盖、余额查询…)、展开行标签聚合、批量操作。这是功能最重的页面,《功能保全清单》必须逐 dialog 枚举。

### R2-B8 Users(`/users`)

设计基准:`SCREENS.users`。

目标结构:4 列 StatCard(Total/Active today/Paying/Total balance,按现有统计能力适配)→ tabs(All/Admins/Banned)+ search → 表格 v2(User=avatar+名+邮箱、Role badge、Balance/Used mono、Status badge)→ Mutate Drawer 内部 SettingsPanel 化 → 删除/配额 dialog 保留。

### R2-B9 Redemption Codes(`/redemption-codes`)

设计基准:`SCREENS.redemptionAdmin`(+ `SCREENS.redemption` 用户侧输入形态供 wallet 兑换入口复用)。

目标结构(两列 340px/1fr):左 = 生成器 Panel(面值/数量/次数/过期 + `Generate N codes` CTA);右 = 3 StatCard(已发/激活/已兑换价值)+ 批次表(Code mono 遮罩、Value、Used 进度 `ProgressBar`、Status badge、copy/delete)。合规门控(现有 compliance 确认)保留并写入对照表。

### R2-B10 Subscriptions(`/subscriptions`)

设计基准:`SCREENS.subscriptions`。

适配前提:当前页是**管理员计划管理**,设计稿是**用户当前订阅视图**——不允许把管理表删掉去模仿设计稿。结构:管理表保留(表格 v2 + StatCard 行);`PlanCard` 网格作为计划预览形态;用户侧"当前计划 + 用量 ProgressBar"形态落到 wallet 订阅卡(B3 联动)。全部写入适配决策。

### R2-B11 Models 管理(`/models/metadata|deployments`)

设计基准:`SCREENS.settingsModels`(catalog 表形态)+ `SCREENS.marketplace` 卡片词汇。

目标结构:metadata 表 v2(Model=avatar+名+id、定价 mono、倍率、Enabled Switch、Edit);同步/导入/导出保留;deployments 表 + 健康状态 badge + 连接守卫(守卫态用 InlineAlert 形态);Create deployment Drawer 内部 SettingsPanel 化。

### R2-B12 System Settings 全分区(`/system-settings/**`,38 sections)

设计基准:`SCREENS.settings` / `settingsModels` / `settingsSecurity`。

目标结构(shell 一次,38 section 逐组消费):

1. `SettingsRail` 220px sticky 左导航替换现 tabs-only 形态(移动端塌缩),与现路由结构(7 组 × $section)打通。
2. 每 section = `SettingsPanel`(Eyebrow 分组)+ `SettingRow` 逐项重排;JSON/代码/富文本编辑器统一 CodeBlock/editor 形态。
3. `StickySaveBar`:dirty 检测 + Discard/Save,替换分散的保存按钮;dirty guard 保留。
4. 7 组按 site → auth → billing → content → models → operations → security 顺序逐组 commit(允许 7 个子步骤 r2-B12a..g,每子步骤独立 review);billing 触及表达式定价 UI 前先读 `pkg/billingexpr/expr.md`。

功能保全重点:38 个 section 的默认值/空数据/保存成功/失败/重置/权限重定向逐项过(沿用第一轮 section 展开清单)。

### R2-B13 Profile(`/profile`)

设计基准:`SCREENS.profile`。

目标结构(两列 300px/1fr):左 = 账户卡(大 avatar、display 名、mono 邮箱、角色/验证 badge、Member since/Group/Requests `Metric` 行);右 = Profile Panel(表单)、Security Panel(`SettingRow`:密码/2FA/Passkeys + 行尾操作按钮)、Connected accounts Panel(provider icon + Connect/Unlink)、语言偏好/侧栏模块/签到日历按 SettingsPanel 重排。ProfileDropdown 同步。

### R2-B14 Pricing / Marketplace / Model Detail / Rankings 深化

设计基准:`SCREENS.marketplace` / `modelDetail` / `pricing` / `rankings`。

R2-00 复核第一轮成果后,把缺口逐节补齐,预期重点:模型卡 hover(translateY + brand glow)与收藏星、卡片 footer 价格/吞吐 `Metric`、detail 页右栏 spec 卡(display 大数)+ 周用量 sparkline + quick call CodeBlock、provider 表(YouBox Auto 高亮行)、rankings 增长 badge。

### R2-B15 营销 / 认证 / 错误 / Setup 缺口收尾

R2-00 结构复核中列出的全部缺口在此步清零(预期较小;若复核全 pass 则本步仅记录证据)。

---

# Phase C — 收口

### R2-C1 全局一致性收口

- 全前端扫描:页面是否仍有绕过 Phase A 组件的一次性样式(grep + 人工抽查);StatCard/Panel/FilterBar/SettingRow 旧私有实现删除。
- motion 统一:80/140/220ms 档位、ease-out 入场、switch spring、reduced-motion 全局复验。
- 断点、键盘、aria 复验(沿用第一轮 Step 18 清单)。
- `bun run typecheck && lint && build && i18n:sync`。

### R2-C2 最终验收矩阵 v2

- 逐路由填写验收矩阵,在第一轮矩阵列(Desktop/Mobile/Dark/Light/i18n/Keyboard/States/Screenshot)基础上**新增一列「结构对照」**:链接到该页《结构对照表》且全行 pass/adapted。
- 复跑 `docs/redesign-reviews/verify-harness.mjs`(80 路由 × 断点 × 主题)零错误。
- 与设计稿并排对照图全量归档。
- 任何页面存在未实现且未记录适配的设计稿 section,不得结束本步。

## 最终完成定义

当且仅当:

1. Phase A 全部组件在 Design Lab 可独立演示并被页面实际消费;
2. Phase B 每页《结构对照表》全行 pass/adapted、《功能保全清单》全勾;
3. 矩阵 v2 全路由 pass(含「结构对照」列);
4. typecheck / lint / build / i18n:sync 全过(lint 存量 99 个 react-hooks 错误单独立项,不得新增);
5. 无绕过组件库的一次性样式、无静默跳过的设计稿 section;
6. 全部 review 记录与截图归档并 push。
