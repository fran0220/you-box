# R2-B13 Review — Profile 重做

- branch:`redesign/youbox-frontend-100`(commit `10601778`)
- 前置文档:`r2-b13-profile-tables.md`

## 结构对照表验收

| # | 设计稿 section | 结果 |
|---|---|---|
| 1 | 两列 300px/1fr | **pass** — sticky 账户卡 + 右列 Panel 堆叠 |
| 2 | 左账户卡 | **pass/adapted** — 大 Avatar + display 名 + mono 用户名 + 角色 badge(Super Admin info)/Verified + Metric 行(Group/Requests/Balance/Used,吸收原 3 统计卡);Member since 后端 GetSelf 白名单不含注册时间 → 省略(已记录);Change avatar 无上传后端 → 不做(已记录) |
| 3 | Profile Panel | **pass/adapted** — ProfileSettingsCard(绑定/偏好 tabs)Panel 化;display name/timezone 后端无字段 → 不造假字段(已记录) |
| 4 | Security SettingRow | **pass** — Password/Access Token/Delete Account 三 SettingRow(实测 Change Password dialog 打开);2FA/Passkey 独立 Panel + SettingRow 行(状态 badge + Enable/Manage),8 个 dialog 与验证流零改动 |
| 5 | Connected accounts | **pass** — bindings tab(Email Bind 实测渲染)容器 Panel 化 |
| 6 | 语言/侧栏模块/签到 | **pass** — SettingsPanel/Panel 形态,逻辑不动 |
| 7 | ProfileDropdown | **pass** — 无缺口 |

## 功能保全清单复验

tables 10 项全 ☑;`profile-header.tsx` 删除(无其他消费方)。

## 浏览器审查

dark/light @1280、密码 dialog、移动端 375(无溢出);metrics=4、setting rows=6;无 page error。截图:`screenshots/r2-b13/`。

## 验证命令

typecheck pass;i18n:sync(3 键);copyright pass;feature eslint 9 处与基线一致零新增。

## 结论

**pass** — 进入 R2-B14。
