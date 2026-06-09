# YouBox 前端 100% 重构计划

## 目标

以 `youboxdesign/` 中的 YouBox Design System 为唯一视觉与交互基准，完整重构 `web/default/` 前端的所有页面、布局、通用组件、业务组件、状态反馈、动画与响应式体验。此计划不是换色或局部修补，而是一次从设计 token 到页面体验的 100% 覆盖重设计。

## 硬性工作规则

1. **覆盖率规则**：所有可访问路由、所有页面级组件、所有共享 UI primitives、所有业务弹窗/抽屉/表格/空状态/错误状态/加载状态都必须迁移到 YouBox 设计体系。
2. **顺序规则**：本计划只有先后顺序，不设置优先级。每一步依赖前一步完成后再进入下一步。
3. **每步交付规则**：每个步骤完成后必须执行：
   - `bun run typecheck`
   - 与改动范围匹配的 `bun run lint` / `bun run build` / `bun run i18n:sync`
   - 自审 diff，确认无旧视觉体系残留扩散、无未翻译用户文案、无可访问性倒退
   - **commit**：每步一个或多个语义清晰的 commit
   - **review**：提交后进行人工/代码审查；涉及 UI 的步骤必须附截图或浏览器审查记录
   - **push**：审查通过后推送分支
4. **浏览器门槛规则**：重要节点必须用浏览器审查作为完成门槛；不能只靠 typecheck/build。
5. **品牌保护规则**：不得删除或替换项目策略保护的既有版权、许可、归属、包名、导入路径、元信息。YouBox 视觉重构只作用于 `web/default` 前端体验，不改后端品牌/许可/项目归属信息。
6. **i18n 规则**：所有用户可见文案继续走 `useTranslation()` / `t()`，新增文案同步 locale 与 static keys。
7. **组件规则**：保持 Base UI / shadcn 当前 primitive 体系，不混用新的交互 primitive；重做视觉封装而不是手写键盘/焦点行为。

## YouBox 设计基准

来源：

- `youboxdesign/_ds/youbox-design-system-*/readme.md`
- `youboxdesign/ds/tokens/*.css`
- `youboxdesign/youbox-app.css`
- `youboxdesign/screens-*.js`

必须落地的基准：

| 维度 | 目标 |
| --- | --- |
| 主题 | Dark-mode-first，默认近黑 warm ink 画布；light theme 仅作为兼容主题 |
| 主色 | YouBox Orange `#FE6A35`，只用于主 CTA、激活态、eyebrow、焦点和关键强调 |
| 辅色 | Teal `#1FBEA3`，仅用于数据/状态/类别辅助，不与橙色争抢主视觉 |
| 字体 | Space Grotesk = 标题；Hanken Grotesk = UI/正文；JetBrains Mono = code/eyebrow/数字单位 |
| 文案 | 技术、克制、开发者口吻；eyebrow 采用 `// UPPERCASE` |
| 布局 | 4px grid；控制台页面使用 `page / panel / statcard / table / tabs / field` 体系 |
| 表面 | `surface-card` + 1px hairline border + radius md/lg/xl；阴影克制 |
| 数据 | 数字必须 tabular/mono；图表用橙/青双色，网格低对比 |
| 动画 | 只动 `transform` / `opacity`；交互反馈 <= 200ms；入口动画遵守 reduced motion |
| 禁止 | 不做渐变堆叠、不使用紫色/多彩渐变、不使用 emoji、不用 glow 作为主要可点击暗示 |

## 100% 覆盖范围

### 路由页面

所有路由文件均纳入重构验证范围：

#### 公共与营销页面

- `/` → `Home`
- `/about/` → `About`
- `/pricing/` → `Pricing`
- `/pricing/$modelId/` → `ModelDetails`
- `/rankings/` → `Rankings`
- `/privacy-policy` → `PrivacyPolicy`
- `/user-agreement` → `UserAgreement`
- `/oauth/$provider` → `OAuthCallback`

#### 认证页面

- `/sign-in` → `SignIn`
- `/sign-up` → `SignUp`
- `/register` → 注册兼容入口
- `/forgot-password` → `ForgotPassword`
- `/reset` → `ResetPassword`
- `/user/reset` → `UserResetPassword`
- `/otp` → `Otp`
- `/oauth` → `OAuthComponent`

#### 错误页面

- `/401` → `UnauthorisedError`
- `/403` → `ForbiddenError`
- `/404` → `NotFoundError`
- `/500` → `GeneralError`
- `/503` → `MaintenanceError`
- route-level `notFoundComponent` / `errorComponent`
- `/_authenticated/errors/$error`

#### 首次安装

- `/setup/` → `SetupWizard`

#### 已登录控制台

- `/dashboard/$section` → `Dashboard`
- `/keys/` → `ApiKeys`
- `/wallet/` → `Wallet`
- `/profile/` → `Profile`
- `/playground/` → `Playground`
- `/chat/$chatId` → chat web preset 容器
- `/chat2link` → 外部 chat 跳转页
- `/usage-logs/$section` → `UsageLogs`

#### 管理与系统页面

- `/channels/` → `Channels`
- `/users/` → `Users`
- `/redemption-codes/` → `Redemptions`
- `/subscriptions/` → `Subscriptions`
- `/models/$section` → `Models`
- `/system-settings/site/$section` → `SiteSettings`
- `/system-settings/auth/$section` → `AuthSettings`
- `/system-settings/billing/$section` → `BillingSettings`
- `/system-settings/content/$section` → `ContentSettings`
- `/system-settings/models/$section` → `ModelSettings`
- `/system-settings/operations/$section` → `OperationsSettings`
- `/system-settings/security/$section` → `SecuritySettings`

#### 兼容重定向入口

- `/console/log` → `/usage-logs`
- `/console/topup` → `/wallet?show_history=true`
- 各 index redirect 路由：`dashboard`、`models`、`usage-logs`、`system-settings/*`

### 共享组件

必须全部审查并按 YouBox 体系重构：

- `src/components/ui/*`：button、input、card、badge、tabs、table、dialog、sheet、drawer、alert-dialog、select、dropdown、popover、tooltip、skeleton、sonner、sidebar、form、calendar、chart 等。
- `src/components/layout/*`：PublicLayout、PublicHeader、AuthenticatedLayout、AppHeader、AppSidebar、TopNav、SystemBrand、SectionPageLayout、Main、MobileDrawer、SidebarViewHeader。
- 数据表体系：DataTablePage、Toolbar、FacetedFilter、Pagination、MobileCardList、TableSkeleton、TableEmpty、BulkActions。
- 全局反馈：EmptyState、ErrorState、LoadingState、ConfirmDialog、RiskAcknowledgementDialog、SignOutDialog、NotificationPopover、CommandMenu、Search、ConfigDrawer、ThemeSwitch、LanguageSwitcher。
- AI/chat 组件：`components/ai-elements/*` 全部纳入 playground/chat 体验一致性。

### 业务组件

所有 `src/features/*/components` 内组件纳入重构，包括表格列、drawer、dialog、filter、cards、charts、forms、section registry 输出页面。

## 顺序执行计划

### Step 0 — 建立重构工作分支与审查基线

**改动范围**：无业务改动，只建立分支、记录当前页面截图和路由清单。

**交付内容**：

- 创建专用分支，例如 `redesign/youbox-frontend-100`。
- 用浏览器打开当前公共页、控制台页、管理页、认证页，保存 before 截图集。
- 记录当前 typecheck/build 状态，作为后续回归基线。

**完成门槛**：

- 路由清单与 before 截图归档。
- `bun run typecheck` 有明确结果。
- commit → review → push。

### Step 1 — 导入 YouBox token 并替换全局主题源头

**改动范围**：`src/styles/*`、字体配置、Tailwind theme bridge。

**交付内容**：

- 将 `youboxdesign/ds/tokens` 映射为项目内 token，不直接散落复制到组件。
- 替换当前 `theme.css` 的默认色彩/字体/radius/shadow 语义变量，使 Tailwind token 指向 YouBox 语义层。
- 默认 dark theme 对齐 YouBox；light theme 对齐设计系统 light aliases。
- 移除或冻结与 YouBox 冲突的主题预设入口，确保不会覆盖核心品牌 token。
- 引入 Space Grotesk、Hanken Grotesk、JetBrains Mono 字体加载策略。

**浏览器门槛**：

- 打开 `/`、`/sign-in`、`/dashboard`，确认全局背景、字体、按钮基础色已切换，且无白屏/布局崩坏。

**完成门槛**：

- `bun run typecheck`
- `bun run build`
- commit → review → push。

### Step 2 — 重构基础 UI primitives

**改动范围**：`src/components/ui/*` 中基础视觉组件。

**交付内容**：

- Button / IconButton：primary、secondary、ghost、subtle、danger、sizes、press/hover/focus。
- Card / TitledCard / Alert：panel、statcard、brand subtle、semantic surface。
- Badge / Tag / StatusBadge / GroupBadge：mono、dot、semantic variants。
- Input / Textarea / Select / Combobox / Switch / Checkbox / Radio / Slider：field background、ring、hint、error。
- Tabs / Pagination / Kbd / Separator：pill tabs 与 line tabs。
- Skeleton / Spinner / Progress：YouBox shimmer 与 reduced motion。
- Table：header mono uppercase、row hover、numeric alignment、mobile fallback。

**浏览器门槛**：

- 建立临时或现有页面组件样本审查：按钮、表单、表格、tabs、dialog 在 dark/light 下均正确。

**完成门槛**：

- `bun run typecheck`
- 组件相关 lint/test（如存在）
- commit → review → push。

### Step 3 — 重构 Overlay 与交互容器

**改动范围**：Dialog、AlertDialog、Sheet、Drawer、Dropdown、Popover、Tooltip、Command、Sonner、Confirm/Risk dialogs。

**交付内容**：

- 所有弹层统一 `overlay / surface-card / hairline border / z-index scale`。
- destructive action 使用 AlertDialog，确认按钮使用 danger 语义。
- toast 统一为 dark panel、品牌/语义图标、近操作处错误提示。
- CommandMenu 搜索输入、结果项、空状态重做为开发者控制台风格。
- 所有 icon-only button 补齐 `aria-label`。

**浏览器门槛**：

- 打开命令菜单、通知弹窗、确认删除、退出登录、配置抽屉，键盘导航和焦点环必须正常。

**完成门槛**：

- `bun run typecheck`
- 相关交互手动审查记录
- commit → review → push。

### Step 4 — 重构 App Shell 与导航系统

**改动范围**：已登录布局与公共导航。

**交付内容**：

- PublicHeader 对齐 `YB.navMarketing`：sticky glass、brand wordmark、nav link、auth CTA。
- AuthenticatedLayout/AppHeader/AppSidebar 对齐 `YB.navApp` / `YB.navAdmin`：控制台顶部导航、余额 pill、通知、profile、搜索。
- Sidebar / nested sidebar / mobile drawer 重构为 YouBox panel 体系。
- SectionPageLayout / Main 统一 page shell：`page__head`、title、subtitle、actions、safe-area、responsive gutters。
- Header logo 保留动态系统 logo能力，但默认视觉采用 YouBox mark/wordmark 风格。

**浏览器门槛**：

- Desktop：`/dashboard`、`/channels`、`/system-settings/site`。
- Mobile：打开 nav drawer、sidebar collapsed、profile menu、language/theme/config。
- 检查键盘跳转、skip-to-main、focus order。

**完成门槛**：

- `bun run typecheck`
- `bun run build`
- commit → review → push。

### Step 5 — 重构营销首页与公共内容页

**改动范围**：`home`、`about`、`legal`、公共 Footer。

**交付内容**：

- `/` 按 `SCREENS.landing` 重做：hero、provider chips、features、quickstart code block、CTA、footer。
- `/about` 按 `SCREENS.about` 重做：hero、stats、principles、backed by / 替代实际内容。
- `/privacy-policy`、`/user-agreement` 按 `SCREENS.legal` 重做：sticky TOC、阅读排版、legal callout。
- 自定义首页 Markdown 兼容：Markdown 内容必须放入 YouBox document surface。

**浏览器门槛**：

- `/`、`/about`、`/privacy-policy` desktop/mobile 截图审查。
- 检查 hero CTA、导航 active、footer links、Markdown fallback。

**完成门槛**：

- `bun run typecheck`
- `bun run i18n:sync`
- commit → review → push。

### Step 6 — 重构模型市场、模型详情、价格页、排行榜

**改动范围**：`pricing`、`rankings`、model card/table/detail components。

**交付内容**：

- `/pricing` 的模型目录视图对齐 `SCREENS.marketplace`：search、tabs、model cards、table view 也统一。
- `/pricing/$modelId` 对齐 `SCREENS.modelDetail`：breadcrumb、model hero、provider table、stats、quick call code。
- 公开 pricing plans 对齐 `SCREENS.pricing`，与模型价格页搜索/表格逻辑区分清楚。
- `/rankings` 对齐 `SCREENS.rankings`：stats、period tabs、ranking table、growth badge。
- 统一 ModelCard、pricing metric、provider row、model tags。

**浏览器门槛**：

- `/pricing?view=card`、`/pricing?view=table`、`/pricing/$modelId`、`/rankings`。
- 检查搜索、筛选、排序、分页、价格单位、空状态。

**完成门槛**：

- `bun run typecheck`
- `bun run i18n:sync`
- commit → review → push。

### Step 7 — 重构认证与安全登录流程

**改动范围**：`auth` feature 全部页面与组件。

**交付内容**：

- `/sign-in`、`/sign-up` 对齐 `SCREENS.signIn/signUp`：split layout、OAuth grid、brand side panel、stats。
- `/forgot-password`、`/reset`、`/user/reset` 对齐单卡片 shell。
- `/otp`、passkey、2FA、secure verification、OAuth callback 状态页统一为 YouBox auth card。
- 表单字段错误必须显示在字段旁，不只 toast。
- 密码强度、terms、OAuth loading/error 状态重做。

**浏览器门槛**：

- 全部认证路由 desktop/mobile。
- 键盘 tab 顺序、密码显示按钮、OAuth loading、错误提示。

**完成门槛**：

- `bun run typecheck`
- auth 相关测试/手动流程记录
- commit → review → push。

### Step 8 — 重构安装向导与错误页面

**改动范围**：`setup`、`errors`、root error boundaries。

**交付内容**：

- `/setup` 对齐 `SCREENS.setup`：stepper、root admin form、数据库/站点配置状态。
- 401/403/404/500/503 对齐 `SCREENS.error404/error500` 风格，保留不同语义文案和操作。
- route-level error fallback 与 not found fallback 统一。
- maintenance/unauthorized/forbidden 的 CTA 与权限提示明确。

**浏览器门槛**：

- `/setup`、`/404`、`/500`、触发 route error fallback。

**完成门槛**：

- `bun run typecheck`
- `bun run i18n:sync`
- commit → review → push。

### Step 9 — 重构 Dashboard 与数据可视化

**改动范围**：`dashboard` feature、chart cards、overview/model/user analytics。

**交付内容**：

- `/dashboard/overview` 对齐 `SCREENS.dashboard`：stat cards、requests chart、spend by model、recent activity、credit balance。
- 模型分析、用户分析分区采用同一 page shell、tabs、statcard、panel、chart visual language。
- 图表色彩固定为 brand/accent/semantic，grid/border/tooltip 对齐 YouBox。
- loading skeleton、empty/error state 全覆盖。

**浏览器门槛**：

- `/dashboard/overview`、`/dashboard/models`、`/dashboard/users`。
- 检查图表 tooltip、时间筛选、懒加载 fallback、响应式断点。

**完成门槛**：

- `bun run typecheck`
- chart/section 手动审查记录
- commit → review → push。

### Step 10 — 重构 API Keys 与 Wallet/Credits

**改动范围**：`keys`、`wallet` features。

**交付内容**：

- `/keys` 对齐 `SCREENS.keys`：stat cards、new key alert、table、create/edit/revoke dialogs。
- `/wallet` 对齐 `SCREENS.credits`：balance hero、top-up presets、payment method chips、auto top-up、transactions、subscription plans/card。
- key secret display、copy、masked value、billing history、payment confirm、transfer dialog 全部重做。
- 金额/余额/额度使用 mono/tabular；敏感内容遮罩符合现有安全逻辑。

**浏览器门槛**：

- `/keys` 创建 key 弹窗、复制提示、删除确认。
- `/wallet` 充值流程、历史记录、移动端布局。

**完成门槛**：

- `bun run typecheck`
- payment/key 手动流程记录
- commit → review → push。

### Step 11 — 重构 Playground 与 Chat 体验

**改动范围**：`playground`、`chat`、`components/ai-elements/*`。

**交付内容**：

- `/playground` 对齐 `SCREENS.playground`：model selector、message stream、composer、parameter rail、session stats。
- `/chat/$chatId` 对齐 `SCREENS.chat`：conversation rail、message list、code block、composer、model tag。
- AI elements：message、response、reasoning、tool、artifact、sources、prompt-input、actions、loader、code-block、web-preview 全部统一 YouBox surface。
- 流式状态、copy/regenerate/delete、attachment、markdown/code 渲染、empty state 全覆盖。

**浏览器门槛**：

- `/playground` 发送消息、调参数、切模型。
- `/chat/$chatId` conversations、message actions、code copy、移动端。

**完成门槛**：

- `bun run typecheck`
- chat/playground 交互审查记录
- commit → review → push。

### Step 12 — 重构 Usage Logs、Notifications、Performance 类页面

**改动范围**：`usage-logs`、notification popover/page-like states、performance metrics 相关展示。

**交付内容**：

- `/usage-logs/common|drawing|task` 对齐 `SCREENS.usageLogs`：filter bar、status badge、numeric columns、pagination。
- user info dialog、log details、JSON viewers、request/response preview 重做。
- NotificationPopover 对齐 `SCREENS.notifications`：tabs、unread dot、semantic icon tile、preferences。
- performance metrics components 对齐 `SCREENS.performance`，如该页面通过 dashboard/settings 暴露也必须同步。

**浏览器门槛**：

- `/usage-logs/common`、`/usage-logs/drawing`、`/usage-logs/task`。
- 打开 notification popover、log detail dialog、filters、pagination。

**完成门槛**：

- `bun run typecheck`
- commit → review → push。

### Step 13 — 重构 Admin 数据管理页

**改动范围**：`channels`、`users`、`redemption-codes`、`subscriptions`、admin tables/dialogs。

**交付内容**：

- `/channels` 对齐 `SCREENS.channels`：health stats、channels table、test/add/edit drawer。
- `/users` 对齐 `SCREENS.users`：user stats、roles/status badges、mutate drawer、delete dialog。
- `/redemption-codes` 同时覆盖用户兑换与管理视角，对齐 `SCREENS.redemptionAdmin`，生成 codes、批次表、复制/删除。
- `/subscriptions` 对齐 `SCREENS.subscriptions`：current plan、usage bars、invoices、available plans。
- 所有 DataTable toolbar/filter/column menu/mobile cards 全部统一。

**浏览器门槛**：

- `/channels`、`/users`、`/redemption-codes`、`/subscriptions`。
- 打开 add/edit/delete/generate/change plan dialogs。

**完成门槛**：

- `bun run typecheck`
- admin CRUD 手动流程记录
- commit → review → push。

### Step 14 — 重构 Models 管理页

**改动范围**：`models` feature。

**交付内容**：

- `/models/metadata`：模型元数据表、filters、edit/import/sync dialogs 重做为 YouBox catalog admin。
- `/models/deployments`：deployment table/card、create deployment drawer、access guard 重做。
- 模型状态、定价、部署状态、provider 标识统一使用 ModelCard/Tag/Badge 体系。

**浏览器门槛**：

- `/models/metadata`、`/models/deployments`。
- 打开 create/edit/sync dialogs，检查权限 guard。

**完成门槛**：

- `bun run typecheck`
- commit → review → push。

### Step 15 — 重构 System Settings 全部分区

**改动范围**：`system-settings` 下全部子 feature。

**交付内容**：

- settings shell 对齐 `SCREENS.settings`：left rail、page actions、panel sections。
- `/system-settings/site/*`：站点身份、首页、导航、显示配置。
- `/system-settings/auth/*`：注册、OAuth、passkey、2FA、email verification。
- `/system-settings/billing/*`：计费、价格倍率、充值、表达式定价 UI（如触及 billing expression 必须先读 `pkg/billingexpr/expr.md`）。
- `/system-settings/content/*`：公告、关于、法律、文案配置。
- `/system-settings/models/*` 对齐 `SCREENS.settingsModels`：routing strategy、model pricing、sync rates。
- `/system-settings/operations/*`：Redis、日志、任务、维护、备份、系统状态。
- `/system-settings/security/*` 对齐 `SCREENS.settingsSecurity`：2FA policy、passkeys、session、IP allowlist、rate limiting。
- 所有 setting row、switch、select、JSON editor、code editor、rich markdown editor 统一。

**浏览器门槛**：

- 每个一级分组至少打开默认 section 和一个表单/保存场景。
- 检查保存/重置/错误提示/权限重定向。

**完成门槛**：

- `bun run typecheck`
- `bun run i18n:sync`
- commit → review → push。

### Step 16 — 重构 Profile 与用户个人设置

**改动范围**：`profile` feature、profile dropdown。

**交付内容**：

- `/profile` 对齐 `SCREENS.profile`：account card、profile form、security、connected accounts、preferences。
- check-in calendar、language preferences、sidebar modules、2FA/passkey cards 全部 YouBox 化。
- ProfileDropdown 统一 avatar、balance、role、menu item、sign out dialog。

**浏览器门槛**：

- `/profile` desktop/mobile。
- 打开 profile dropdown、2FA/passkey/language/sidebar modules 设置。

**完成门槛**：

- `bun run typecheck`
- commit → review → push。

### Step 17 — 全局响应式、可访问性、动画与状态收口

**改动范围**：全前端。

**交付内容**：

- Mobile-first 审查：所有页面在 375px、768px、1280px、1536px 可用。
- 固定元素使用 safe-area；不使用 `h-screen`，改为 `h-dvh/svh` 或可计算容器。
- 所有 icon-only buttons 有 `aria-label`；decorative icons 有 `aria-hidden`。
- 所有 loading/error/empty/success/destructive states 完整。
- 动画统一：transition <= 200ms 交互反馈，入口动画只在需要时使用 `motion/react`，尊重 `prefers-reduced-motion`。
- 去除旧视觉残留：旧 theme preset 颜色、默认 shadcn 灰白面板、Public Sans 旧默认体、紫色/多彩渐变、任意 z-index、随意 shadow。

**浏览器门槛**：

- 用浏览器逐页抽查关键断点和交互。
- 使用键盘只操作完成：nav、search、dialog、select、table actions、forms。

**完成门槛**：

- `bun run typecheck`
- `bun run lint`
- `bun run build`
- commit → review → push。

### Step 18 — 100% 路由验收与视觉一致性审查

**改动范围**：仅修复审查发现的问题。

**交付内容**：

- 对覆盖范围内所有路由逐一打开并截图。
- 对每个页面检查：token、布局、组件、动画、交互、空/错/加载、移动端、i18n、可访问性。
- 建立最终审查矩阵，标记每个页面 `pass`。
- 清理临时文件、未使用组件、旧主题死代码。

**浏览器门槛**：

- 必须逐路由通过浏览器审查。
- 任何页面发现旧视觉体系或关键交互不可用，都不能结束本步骤。

**完成门槛**：

- `bun run typecheck`
- `bun run lint`
- `bun run i18n:sync`
- `bun run build`
- 最终 commit → final review → push。

## 最终验收矩阵模板

每个页面最终必须填写：

| Route | Desktop | Mobile | Dark | Light | i18n | Keyboard | Loading/Error/Empty | Screenshot | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` |  |  |  |  |  |  |  |  |  |
| `/sign-in` |  |  |  |  |  |  |  |  |  |
| `/dashboard/overview` |  |  |  |  |  |  |  |  |  |
| `/system-settings/site/...` |  |  |  |  |  |  |  |  |  |

矩阵需扩展到本计划列出的全部路由；只有所有 Result 为 `pass`，才算 100% 前端重构完成。

## 每步 commit/review/push 格式

建议 commit 主题：

```text
feat(ui): apply YouBox tokens and theme foundation
feat(ui): redesign core primitives for YouBox system
feat(auth): redesign authentication flows with YouBox system
feat(dashboard): redesign analytics surfaces with YouBox system
```

每步 review 记录必须包含：

- 改动摘要
- 验证命令与结果
- 浏览器审查路由与截图链接/路径
- 已知问题（若有，必须在同一步修复或明确进入下一步的顺序范围）

每步 push 后才能进入下一步。

## 最终完成定义

当且仅当以下条件全部满足时，视为完成：

1. 本计划列出的所有页面、组件、交互、动画、状态均已迁移到 YouBox 设计体系。
2. 所有路由通过浏览器审查矩阵。
3. 全量 `typecheck`、`lint`、`build` 通过。
4. i18n 同步完成，无新增未翻译用户文案。
5. 无旧主题视觉残留、无未审查页面、无临时文件。
6. 最终 review 通过并 push。
