# r2-B12 结构对照表 — /system-settings/**(7 组 × 38 section)

设计基准:`SCREENS.settings` / `settingsModels` / `settingsSecurity`(screens-admin.js:65-95、screens-admin2.js:43-87)

## 结构对照表(shell,r2-B12a)

| # | 设计稿 section | 现状 | 目标实现 | 必做交互 | 适配决策 |
|---|---|---|---|---|---|
| 1 | 220px sticky SettingsRail(icon+label+active),移动端塌缩 | 全局 sidebar 嵌套导航(tabs-only 形态) | 页内 A3 `SettingsRail`:两级(7 组 + 当前组 section 子项),value=当前 `{group}/{section}`,onValueChange→router navigate;<lg 塌缩水平 scroll 条;全局 sidebar 入口保留 | 键盘 roving、路由联动 | 路由结构(7 组 × $section)不变;rail 与 sidebar 并存(sidebar 是全局导航,rail 是页内导航) |
| 2 | 页头 Discard + Save(全局) | 每 section 分散 SettingsPageFormActions | A3 `StickySaveBar` 接 settings-page-context 的 dirty/save/reset;分散按钮移除;FormNavigationGuard 保留 | dirty 出现/Discard/Save spinner | 保存仍按 section 提交(useSettingsForm 变更字段最小提交,语义不变) |
| 3 | 每 section = Panel(eyebrow+title)+ SettingRow | SettingsSection + form grid | 共享 `SettingsSection` 容器改为 SettingsPanel 形态(eyebrow=组名/title=section 名)——一次改动覆盖 38 section;SettingRow 逐项重排在分组子步骤(b..g)内完成 | — | 复杂编辑器(JSON/表格/富文本)保持 flush 面板,不强行 SettingRow |

## 结构对照表(分组,r2-B12b..)

| 组 | section 清单 | SettingRow 化范围 | 适配决策 |
|---|---|---|---|
| site(4) | system-info/notice/header-navigation/sidebar-modules | system-info 文本/选择字段 → SettingRow;notice(富文本)/header-navigation(表格)/sidebar-modules(树)保持 flush Panel | 编辑器类不强转 |
| auth(5) | basic-auth/oauth/passkey/bot-protection/custom-oauth | 开关/输入类逐项 SettingRow | oauth 多 provider 子卡保持卡式 |
| billing(6) | quota/currency/model-pricing/group-pricing/payment/checkin | quota/currency/checkin 标量项 → SettingRow;model-pricing/group-pricing(ratio 表格/表达式编辑器)保持 flush;**实现前已读 `pkg/billingexpr/expr.md`,表达式编辑器 UI 不改动行为** | 计费表达式体系不动 |
| models(6) | global/gemini/claude/grok/channel-affinity/model-deployment | 开关/输入 → SettingRow | JSON 配置块 flush |
| security(3) | rate-limit/sensitive-words/ssrf | rate-limit/ssrf 标量 → SettingRow;sensitive-words 文本域 flush | — |
| content(7) | dashboard/announcements/api-info/faq/uptime-kuma/chat/drawing | 开关类 → SettingRow;列表编辑器(announcements/api-info/faq/chat)flush | — |
| operations(7) | behavior/monitoring/email/worker/logs/performance/update-checker | 开关/输入 → SettingRow | — |

## 功能保全清单(每 section 通用)

| # | 项 | 复验 |
|---|---|---|
| 1 | 38 section 全部可达(路由不变) | ☑ |
| 2 | 默认值加载(useSystemOptions 合并) | ☑ |
| 3 | 保存成功/失败 toast;仅提交变更字段 | ☑ |
| 4 | 重置(reset 回默认值) | ☑ |
| 5 | dirty guard(路由阻断 + beforeunload) | ☑ |
| 6 | 权限重定向(admin 守卫) | ☑ |
| 7 | 各 section 专有编辑器(JSON/表格/富文本/树/ratio 表达式)行为不变 | ☑ |
| 8 | i18n 双语 | ☑ |
