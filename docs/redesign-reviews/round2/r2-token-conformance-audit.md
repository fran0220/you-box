# Token-Design Conformance Audit — 全面组件/页面检查

- branch:`redesign/youbox-frontend-100`
- 触发:tokens 重上色为 OpenRouter 配色(azure `--brand`=#0090ff + warm-sand 中性)后,全面核查所有组件/页面是否(1)完整重构、(2)符合新 token 设计。

## 方法

4 路并行只读审计(Explore),覆盖:数据/管理页(keys/wallet/channels/users/redemption/subscriptions/models/usage-logs)、dashboard/playground/chat/ai-elements、system-settings/profile/marketing/auth/errors/setup、共享组件(components/**)+ lib + styles。每路核查:① token 旁路色(硬编码 hex、rgba/hsl、原始 Tailwind 色阶)分类 must-fix / intentional;② 结构是否消费 round-2 Phase A 组件。主线再逐项复核(剔除过报)并验证。

## 一、结构重构完整性 — ✅ 完成

- Phase B(B1–B15)每页《结构对照表》全行 pass/adapted、《功能保全清单》全勾(见各 `r2-bXX-*.md`),并经 R2-C2 80 路由 × 4 断点 × 双主题认证 harness 复跑 0 真实错误。
- 本次并行审计中 dashboard/playground/chat/ai-elements、system-settings(SettingsRail/StickySaveBar/SettingsPanel/SettingRow × 38 section)、profile、marketing/auth/errors/setup 均确认消费 round-2 组件,无遗留旧结构。
- 审计代理对 channels/models drawer「是否 SettingsPanel 化」存疑,系其读取受限;B7/B11 review + 浏览器截图已确认 drawer 分区均已 SettingsPanel 化。无结构回归。

## 二、Token 设计符合性 — ✅ 修复后达标

### 已修复(旁路 token 的色 → 语义/品牌 token)

- **陈旧品牌橙/琥珀(brand-adjacent)**:`dashboard/lib/charts.ts` `#FF8A00` → `var(--chart-1)`;`message-error` `text-orange-500` → `text-warning`;`home/connection-line` + 未用的 `layout/glow.tsx` 暖色渐变 → azure;`api-key-group-combobox` ratio 徽章 rose/orange → destructive/warning token;`dynamic-pricing-breakdown` 橙徽章 → warning token;`announcements-section` 类型色板 green/orange/red → success/warning/destructive。
- **语义态硬编码原始色阶 → token**:uptime sparkline(emerald/amber/rose → success/warning/destructive)、json-code-editor 有效态、param-override 规则态(cyan/red/green → info/destructive/success)、details/fail-reason/task-logs/common-logs/column-helpers、channels(missing-models/codex-usage/codex-oauth/channel-test)、wallet(payment-confirm/billing-history)、keys cells、prompt-dialog、amount-discount、ionet、deployment-access-guard、users 进度条 amber、pulse-section 跌幅、model-details(.tsx/performance/modalities/api)warning/success。
- 合计 ~35 处、~30 文件。最终复扫:live 文件中 `*-orange-*` 工具类、暖色渐变、`254,106,53`/`#FF8A00` 字面量、原始语义 `text-(green|red|amber|emerald|rose)-NNN` 均为 **0**。

### 保留为有意(未改,记录依据)

- **分类多色板**:`lib/colors.ts` 的 `colorToBgClass`/`TAG_COLORS`/`stringToColor`(模型/标签/头像需多色区分,塌缩到品牌/语义 token 会损失可辨识度)、`CHART_COLORS`(且无消费方=死代码)。
- **数据可视化**:VChart spec 中 `dashboard/lib/charts.ts` 用户多色 fallback、`model-details-charts.tsx` 库要求的 hex、`#000`/`#fff` 中性描边。
- **品牌标识**:`market-share` 供应商 logo 色、`wallet` 支付渠道 logo 色。
- **正确的 white-on-solid 等**:status-badge solid 徽章白字、slider 白色滑块、config-drawer `stroke-white`、kbd `bg-white/10`、profile-dropdown 实色头像白字、notification-item `bg-teal-subtle text-teal`(合法 token 工具类)。
- 死文件:`model-details-apps.tsx`(无消费方)未改。

## 三、验证

- `bun run typecheck` pass;`bun run build` pass(生产包仍无 Design Lab 代码)。
- 浏览器抽查 settings/announcements、model detail、recolor 全量页面(landing/dashboard/pricing/keys/channels,dark+light)无 page error,azure 品牌 + sand 表面一致呈现。
- commits:`1f4bfd0f`(批量 token 迁移)+ 本步收尾(剩余 7 处语义 text)+ 本记录。

## 结论

全部组件/页面**结构重构完整**,且**符合新的 OpenRouter token 设计**:品牌色全面 azure 化、语义态统一走 token,旁路色仅余有意的分类/数据可视化/品牌标识用途(均记录)。
