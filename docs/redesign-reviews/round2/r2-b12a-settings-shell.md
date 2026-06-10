# R2-B12a Review — System Settings shell

- branch:`redesign/youbox-frontend-100`
- 前置文档:`r2-b12-system-settings-tables.md`(shell 表)

## 结构对照表验收(shell)

| # | 设计稿 section | 结果 |
|---|---|---|
| 1 | 220px sticky SettingsRail | **pass/adapted** — 页内两级 rail(7 组 icon+label + 当前组 sections 缩进),A3 SettingsRail × 2 实例;value→router navigate(实测组切换 → /auth/basic-auth);<lg 塌缩横向条;全局 sidebar 并存(全局 vs 页内导航,已记录);挂载点 = SettingsPage frame(7 组唯一公共渲染点,1 文件接入) |
| 2 | StickySaveBar | **pass** — SettingsPageFormActions 改为注册器(31 处 section 零改动,经 useFormContext 读 isDirty/isSubmitting);实测:改字段 → bar 滑入;Discard → 还原并退场;保存按 section 最小变更字段语义不变;FormNavigationGuard/FormDirtyIndicator/ActionsPortal 保留 |
| 3 | SettingsSection → Panel | **pass** — 共享容器 SettingsPanel 化(eyebrow=组名 + title),38 section 一次覆盖;suppress-header 机制保留 |

## 浏览器审查

实测:rails=2、组项=7、dirty→save bar=1、discard→0、组导航 URL 正确;dark @1280 全页 + dirty 态截图;无 page error。截图:`screenshots/r2-b12/`。

## 验证命令

typecheck pass;build pass(验证无循环依赖);i18n:sync(2 键);copyright pass;feature eslint 基线 30→26,零新增。

## 结论

**pass** — 进入 r2-B12b..(分组 SettingRow 化)。
