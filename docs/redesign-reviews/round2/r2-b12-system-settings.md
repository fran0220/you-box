# R2-B12 Review — System Settings 全分区重做(a–e 子步骤汇总)

- branch:`redesign/youbox-frontend-100`
- 前置文档:`r2-b12-system-settings-tables.md`
- 子步骤 commits:B12a shell(`c4ffac6e`)、B12b site+content(`809ed51f`)、B12c auth+security(`44a10972`)、B12d billing(`c2eddab4`)、B12e models+operations(本 commit)

## 结构对照表验收

| # | 设计稿 section | 结果 |
|---|---|---|
| 1 | SettingsRail 220px sticky + 移动端塌缩 | **pass/adapted** — 页内两级 rail(7 组 + sections),路由打通,键盘 roving;全局 sidebar 并存(已记录);实测组导航/塌缩 |
| 2 | StickySaveBar(dirty→Discard/Save) | **pass** — 表单 actions 注册器接 31 处 section(零 section 改动);实测 dirty 出现/Discard 还原;最小变更字段提交语义不变;dirty guard 保留 |
| 3 | section = Panel(eyebrow)+ SettingRow | **pass/adapted** — SettingsSection→SettingsPanel 一次覆盖 38 section;SettingRow 化分 4 批完成:b(13 字段)+ c(27)+ d(quota7/currency/payment/checkin)+ e(53),合计 100+ 字段;textarea/JSON/表格/树/列表/OAuth 子卡/表达式编辑器按对照表保持 flush(每批输出逐项记录跳过原因) |
| 4 | billing 表达式约束 | **pass** — B12d 实现前已读 `pkg/billingexpr/expr.md`,ratio/表达式卡零行为改动 |

## 功能保全清单复验

通用 8 项全 ☑:38 section 路由可达(实测 site/auth/billing/security/content/models/operations 抽查 9 个 section,无 page error)、默认值加载、保存/失败 toast 与最小提交、重置、dirty guard(FormNavigationGuard 未动)、admin 守卫、专有编辑器行为不变(表达式/ratio/JSON/列表零改动)、i18n。

## 浏览器审查

抽查截图:`screenshots/r2-b12/`(shell dark、dirty savebar、group nav、system-info、content/dashboard、basic-auth、ssrf、quota、model-pricing、email、performance、models/global)。各 section SettingRow 渲染计数与转换数吻合(performance 12/13:1 个条件字段按开关隐藏,行为与改前一致)。

## 验证命令

每批 typecheck pass;B12a 附 build pass;i18n:sync 干净;eslint 零新增(基线对照含 stash 验证);copyright pass。

## 结论

**pass** — 进入 R2-B13。
