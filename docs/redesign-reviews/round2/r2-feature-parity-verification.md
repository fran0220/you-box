# 前端功能完整性验证 — 与原始 new-api 前端的 parity

- branch:`redesign/youbox-frontend-100`
- 目标:验证 YouBox 重设计前端所有功能可用,且与原始 new-api 前端(`web/reference/default-before-youbox/`,基线快照)功能一致,无迁移造成的功能 gap。
- 方法:① 文件树差异(删除=gap 信号);② 4 路并行行为级 parity diff(reference→current 逐能力比对);③ 全 80 路由 harness 运行时复跑(当前构建);④ 重点交互流端到端实测。

## 一、文件树差异 — 0 路由删除

`reference/src` vs `default/src` 全量 .tsx/.ts diff:
- **路由文件:0 删除** —— 原始前端每个 route/页面在 current 中均存在。
- 11 个被删组件,全部为已记录的 round-2 组件合并(非功能删除):`theme-quick-switcher`(round1 superseded)、`summary-cards`/`ui/stat-card`/`models/performance-overview`(B1)、`profile-header`(B13)、`growth-text`(B14)、`redemptions-primary-buttons`(B9)、`settings-card`(C1)、`model-badge`(B6)、`creem-products-section`/`wallet-stats-card`(B3)。其承载的能力均迁移至新组件(下节逐一 trace)。无 dangling import。

## 二、行为级 parity diff — 0 功能 gap

4 路并行比对(reference→current),每能力判定 PRESENT / GAP / MOVED:

| 域 | API 函数 | 弹窗/抽屉 | 表格列 | 搜索参数/筛选 | 表单字段 | 操作(行/批量/页) | 守卫 | 结论 |
|---|---|---|---|---|---|---|---|---|
| keys/wallet/redemption/subscriptions | 全保留且仍被调用(54 fn) | 全保留 | 全保留 | route 文件 byte-identical | 全保留 | 全保留(create→generator-card 等 MOVED) | — | **0 gap** |
| channels/users/models | 全保留(channels 39 / users 14 / models 41 fn,调用点数一致) | channels 15 dialog + models 12 + users 3 全保留 | 全保留(type/icon→CellFlex 默认隐藏但保留) | route byte-identical(admin guard 保留) | 全保留 | 全保留(启停→inline Switch、test-all/批量/标签聚合/内联编辑 MOVED 但行为不变) | admin role guard 保留 | **0 gap** |
| dashboard/usage-logs/playground/chat/notifications | 全保留且被调用 | 全保留(DetailsDialog 全分区 + 新增 Raw Data 块) | 全保留 | filter/preferences/granularity/admin-username 全保留 | 参数全部进 payload | 全保留 | admin guard 保留 | **0 gap**(含 NotificationPopover mark-all-read 增强) |
| system-settings(38 section)/profile/pricing/rankings/auth/errors/setup | 全 api.ts + 全 hooks byte-identical | 全保留 | — | 全筛选/toggle 计数一致 | **每 section 的 option key 集合一致(无字段丢失)** + profile 全 binding/2FA/passkey/checkin 保留 | 全保留 | beforeLoad 守卫保留 | **0 gap**(35 个 section 文件仅 SettingsPanel/SettingRow 容器替换) |

净增功能(非 gap):favorites、password-strength、error-page-shell、rankings-stats、sticky save bar、details-dialog Raw Data、playground latency/usage、model 列复制/Route popover。

## 三、运行时验证 — 全部可用

- **80 路由 harness(当前 recolor+token 修复后构建)**:80 路由,58 个 auth 路由全部以认证态渲染真实内容(0 重定向 sign-in),0 NEAR_BLANK/H_OVERFLOW/pageError;仅 2 个预期 flag(登出态 `/oauth` 探测、`/500` 自身文案命中正则)。报告 `r2-c2-harness-report.json` 同源。
- **重点交互流端到端实测**(`screenshots/r2-parity/`,0 page error):
  - system-settings **保存往返**:改 System Name → StickySaveBar 出现 → Save → reload **值已持久化 = true**(证明设置重构未破坏真实保存机制)。
  - usage-logs 筛选 UI(4 输入)+ 日志详情弹窗打开。
  - channels 行操作弹窗打开。
  - profile 2FA setup 弹窗打开。
  - pricing 表格视图渲染。
- 本会话此前已实测:setup→登录、keys 创建+一次性 key 展示、wallet 兑换码端到端(余额 +$1)、channels 创建+启停+tabs+编辑抽屉、users 创建+tabs、redemption 生成、subscriptions 创建+启停+预览、models 创建+启停、playground 发消息(错误路径)、chat 预设 shell、通知 popover、profile 密码弹窗、pricing 收藏+详情。

## 结论

**无迁移造成的功能 gap。** 原始 new-api 前端的全部路由、API 调用、弹窗/抽屉、表格列、表单字段(含 38 个 system-settings section 的全部 option)、筛选/搜索参数、行/批量/页级操作、权限守卫均在 YouBox 前端中保留或可追溯地迁移(并有若干增强);运行时 80 路由 + 重点交互流实测全部可用。
