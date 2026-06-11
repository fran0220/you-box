# R2-C3 — 遗留与功能障碍 gap 全面复审

- branch: `redesign/youbox-frontend-100`
- 方法:4 路并行怀疑式审查(用户域功能接线 / 管理域功能接线 / i18n 完整性 / 认证·路由·壳层基础设施)+ typecheck/lint/build 独立复核 + 脚本化 t() key 全量提取比对(3698 个唯一 key)。

## 一、发现并修复的 gap

### 1. i18n 幽灵 key — 85 个(主要修复)

脚本化提取全部 `t()` 调用与 6 个 locale 的 `translation` 命名空间比对:

- **11 个 key 被错放在 locale JSON 顶层**(`translation` 之外)。i18next 把顶层键当作命名空间,这些已有完整 6 语种翻译的 key(Favorites/收藏系列、Vendors、Top growth 等)实际完全失效。→ 全部搬入 `translation` 命名空间。
- **74 个 key 从未入库任何 locale**(dashboard overview-insights 29 个、users/subscriptions 统计卡、channels 批量测试、auth 重置邮件、playground 空态等)。英文界面因 key 即英文原文而显示正常,**中/法/俄/日/越界面这些位置全部显示英文**。→ 全部补入 en 并新增 zh/fr/ru/ja/vi 翻译(用词对齐既有术语与引号风格)。
- **ja/ru 各 47 条、fr/vi 各 5 条历史未翻译条目**(round-2 新增 key 时只翻了部分语种,如 "Mark all read"、"Add Channel"、密码强度系列)。→ 全部补译。
- 修复后 `i18n:sync` 报告:全 6 locale missing=0、extras=0;剩余 untranslated 仅 zh 3 条 + ja/ru 各 2 条,均为 `example.com` 类技术示例(有意保留)。

### 2. 未包 t() 的用户可见字符串 — 2 处

- `channels-primary-buttons.tsx` ConfirmDialog `desc`("This will permanently delete all manually and automatically disabled channels...")→ 包 t() 并补 6 语种(此问题继承自 reference,原版同样未翻)。
- `common-logs-columns.tsx:751` Tokens 列头 `title='Tokens'` 及其 `meta.label`(同文件其他列均用 `t()`,zh 已有译文)→ 改为 `t('Tokens')`。

### 3. 调试遗留 console.log — 3 处

- `playground/index.tsx` `handleCopyMessage` 仅 console.log(复制逻辑在 MessageActions 内部,`onCopy` 为可选回调)→ 删除 handler 与 prop 传递。
- `channels-primary-buttons.tsx` Fix Abilities / Delete All Disabled 成功回调仅 console.log(handler 内部已自带 toast + invalidate)→ 移除回调。

### 4. queryKey 依赖缺失 — 1 处

- `overview-insights.tsx` trendQuery 的 `default_time` 粒度参数依赖 `rangeDays` 但未进 queryKey(当前因 timestamps 间接变化而未实际出错)→ `rangeDays` 显式加入 queryKey。

### 5. lint 修复

- `long-text.tsx` 无效 eslint-disable 指令(autofix)。
- `playground/index.tsx` queryFn 内使用 hook 的 `t` 触发 `@tanstack/query/exhaustive-deps` → 改用非响应式 `i18next.t`(与 `channel-actions.ts` 既有惯例一致)。

## 二、核查后排除(非 gap)

- `oauth_register_enabled` 后端未下发、前端默认 true:与 reference 逐字一致,继承自上游,非迁移 gap。
- playground 上传/搜索按钮 "Feature in development" toast:reference 行为完全相同。
- 4 路功能接线审查(用户域 + 管理域 + 认证/路由/壳层):全部 mutation 均正确 invalidate、表单字段均进 payload、弹窗确认均接线、导航目标均存在、admin 守卫保留、401/Turnstile/OAuth/passkey/setup 流接线完整 — **0 功能性断点**。

## 三、已知遗留债务(本轮记录、未修)

- **lint:95 个 React Compiler 错误**(64 × setState-in-effect、9 × 组件 render 中创建、8 × render 中访问 ref 等,分布于 68 个文件,全部先于本轮存在;build/typecheck 不受影响,仅相关组件跳过编译器优化)。此前记录中 "lint 通过" 系管道掩盖退出码所致,实际 HEAD 即失败。修复需逐组件重构 effect,建议另开专项。

## 四、验证

- `tsc -b` ✓;`bun run build` ✓;lint 错误 98 → 95(净 -3,我方触碰文件 0 错误)。
- 脚本复跑:t() key 缺失 en/zh = 0/0;6 locale 顶层游离 key = 0。
- 产物抽查:`dist/static/js/index.*.js` 含新增 zh("近期活动")与 ja("すべて既読にする")译文。
