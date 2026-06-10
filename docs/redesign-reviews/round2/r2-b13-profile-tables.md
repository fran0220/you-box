# r2-B13 结构对照表 — /profile

设计基准:`SCREENS.profile`(screens-admin.js:98-133)

## 结构对照表

| # | 设计稿 section | 现状 | 目标实现 | 必做交互 | 适配决策 |
|---|---|---|---|---|---|
| 1 | 两列 300px/1fr | header + 卡片网格 | `features/profile/index.tsx`:`lg:grid-cols-[300px_minmax(0,1fr)]`;左=账户卡(sticky);右=Panel 堆叠 | — | — |
| 2 | 左账户卡:84px avatar + display 名 + mono 邮箱 + 角色/验证 badge + Member since/Group/Requests Metric 行 | profile-header(横向)+ 3 统计卡 | 新 `account-card.tsx`:Panel 居中:大 Avatar、display 名、mono 邮箱/用户名、StatusBadge(角色 soft + 验证态)、divider、Metric 行(Member since/Group/Requests/Balance/Used——吸收原统计卡信息) | — | Change avatar 无上传后端 → 不做(已记录);Member since 字段可得性确认(无则省) |
| 3 | Profile Panel(表单) | profile-settings-card(tabs) | 右列首 Panel:保留现 ProfileSettingsCard 内容(绑定/偏好 tabs),容器 Panel 化 | 全部绑定 dialog | 设计稿 display name/timezone 字段后端无 → 不造假字段(已记录) |
| 4 | Security Panel:SettingRow(Password/2FA/Passkeys)+ 行尾按钮 | 分散 3 张卡(Security/2FA/Passkey) | 新 Security Panel:SettingRow 形态合并——Password(Change 按钮→现 dialog)、Access Token(生成→现 dialog)、2FA(状态 badge + Manage→现 setup/disable 流)、Passkeys(数量 + Add/Manage→现卡片流);若合并风险大则保留各卡但统一 SettingRow 行形态 | 全部 dialog 流 | 删除账户入口保留(danger 区) |
| 5 | Connected accounts Panel | account-bindings-tab | 形态核对:provider icon + 名称 + 状态 + Connect/Unlink 按钮(现有 tab 内容,容器 Panel 化) | 绑定/解绑 | — |
| 6 | 语言偏好/侧栏模块/签到日历 | 独立卡 | SettingsPanel/Panel 形态重排进右列 | 签到/开关 | — |
| 7 | ProfileDropdown 同步 | 菜单 | 不动(已含 Profile/Wallet/Settings/SignOut) | — | 已对照,无缺口 |

## 功能保全清单

| # | 旧功能 | 复验 |
|---|---|---|
| 1 | 余额/用量/请求数统计 | ☑(账户卡 Metric) |
| 2 | 账户绑定(Email/GitHub/Discord/OIDC/Telegram/微信/LinuxDO/custom OAuth)+ 解绑 | ☑ |
| 3 | 修改密码 dialog(校验规则) | ☑ |
| 4 | Access Token 生成 | ☑ |
| 5 | 删除账户 dialog | ☑ |
| 6 | 2FA setup/disable/备份码 | ☑ |
| 7 | Passkey 注册/删除 + 安全验证 | ☑ |
| 8 | 语言偏好(i18n 联动) | ☑ |
| 9 | 侧栏模块配置 | ☑ |
| 10 | 签到日历 + Turnstile | ☑ |
