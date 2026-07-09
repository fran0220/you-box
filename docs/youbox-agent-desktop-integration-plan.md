# YouBox Agent Desktop 集成方案

> 日期：2026-06-30  
> 状态：已按三仓方案完成首轮落地，本文同时作为后续维护基线  
> 目标：将 `craft-ai-agents/craft-agents-oss` 改造为 YouBox 桌面端 Agent 工具，统一接入 YouBox 用户认证与模型网关，同时保持 Agent 数据域独立、可持续同步上游。

## 1. 结论

当前落地状态：

- `you-box` 仅承载 YouBox Core 侧能力：Agent 桌面授权、授权设备管理、模型目录与网关凭证，不保存 Agent workspace/session/audit/sync 业务数据。
- `youbox-agent-service` 已作为独立仓库和独立 DB 初始化，服务通过 Core JWT/JWKS/introspection 绑定 `youbox_user_id`、`grant_id`、`device_id`。
- `youbox-agent-desktop` 已是真实的 `craft-ai-agents/craft-agents-oss` fork，`origin=fran0220/youbox-agent-desktop`，`upstream=craft-ai-agents/craft-agents-oss`，集成分支为 `youbox-integration`。
- 旧的 Core `electron/` 小壳子已从当前仓库移除；桌面端改造都发生在 Craft fork 内。
- 产品路径已收敛为 YouBox 登录 + YouBox Gateway：外部 provider、BYOK、自定义 endpoint、Craft/Claude/ChatGPT/Copilot 登录入口在 UI/RPC/runtime 层被隐藏或拒绝；Pi-compatible 代码只作为隐藏 runtime adapter 保留，不作为产品 provider 暴露。

YouBox Agent 应作为一个独立桌面端产品建设：

- **YouBox Core**：当前 `you-box` 项目，继续负责用户系统、订阅/额度、模型网关、计费、用户状态。
- **YouBox Agent Desktop**：基于 `craft-ai-agents/craft-agents-oss` fork 的桌面客户端，负责 Electron UI、本地 Agent runtime、本地 workspace/session、本地工具能力。
- **YouBox Agent Service**：独立服务与独立 DB，负责 Agent 业务数据，例如设备、workspace/session 云端索引或同步、Agent 策略、审计、同步 cursor。

核心原则：

1. **只共享用户系统，不共享 Agent 业务 DB**。
2. **桌面端只登录 YouBox，不保留 Craft 自有账号或外部 provider 登录体验**。
3. **模型调用只走 YouBox Gateway，不保留 Anthropic/BYOK/自定义 endpoint 作为产品能力；Pi 仅是隐藏 runtime adapter**。
4. **Agent workspace/session/设备/审计/同步数据归 Agent 独立数据域**。
5. **当前仓库不再保留旧 `electron/` 壳子；桌面端入口由独立桌面仓库承载**。
6. **YouBox Core 同步 `Calcium-Ion/new-api` 上游；YouBox Agent Desktop 独立同步 `craft-agents-oss` 上游**。

## 2. Core 不再包含 Electron 壳子

旧 Core `electron/` 只是启动本地 Go 后端并打开 Web 控制台的轻量包装，**不是** Agent 桌面端。该目录与相关 Core CI 已从本仓库移除；桌面能力只在独立仓库 `youbox-agent-desktop` 中演进。不要在 Core 里恢复 `electron/` 子项目。

## 3. 总体架构

```diagram
╭────────────────────────────────────────────╮
│ YouBox Core                                │
│ 当前 you-box 项目                           │
│                                            │
│ 负责：                                      │
│ - 用户账号 / 登录 / 用户状态                 │
│ - 订阅 / 额度 / 计费                         │
│ - 模型网关 / 渠道 / 日志                      │
│ - Agent 桌面端身份令牌                       │
│                                            │
│ 不负责：                                    │
│ - Agent workspace/session                   │
│ - Agent 设备业务数据                         │
│ - Agent 同步和审计数据                       │
╰───────────────────▲────────────────────────╯
                    │ YouBox Identity / Gateway
                    │
╭───────────────────┴────────────────────────╮
│ YouBox Agent Service                       │
│ 独立服务，独立 Agent DB                      │
│                                            │
│ 负责：                                      │
│ - Desktop device                            │
│ - Agent profile                             │
│ - Workspace/session 云端索引或同步             │
│ - Agent policy                              │
│ - Agent audit log                           │
│ - Sync cursor / event stream                 │
╰───────────────────▲────────────────────────╯
                    │ Agent API / Sync API
                    │
╭───────────────────┴────────────────────────╮
│ YouBox Agent Desktop                       │
│ fork from craft-agents-oss                 │
│                                            │
│ 负责：                                      │
│ - Electron 桌面 UI                          │
│ - 本地 Agent runtime                         │
│ - 本地 workspace/session                     │
│ - 本地工具执行                                │
│ - 只调用 YouBox Gateway                      │
╰────────────────────────────────────────────╯
```

## 4. 仓库与服务边界

推荐拆分为三个边界清晰的代码域：

| 代码域 | 来源/上游 | 职责 | DB |
| --- | --- | --- | --- |
| `you-box` | `Calcium-Ion/new-api` | 用户系统、模型网关、计费、桌面身份 | YouBox Core DB |
| `youbox-agent-desktop` | `craft-ai-agents/craft-agents-oss` | 桌面 Agent 客户端、本地 runtime | 本地桌面 DB/凭证存储 |
| `youbox-agent-service` | 新建，技术栈可贴近 Craft | Agent 设备、workspace/session 同步、策略、审计 | Agent DB |

不建议把 Craft fork 作为当前仓库的 `electron/` 子目录直接合入。若需要单仓管理，可使用 submodule/subtree，但会显著增加 CI、依赖、搜索与上游同步复杂度。

## 5. 用户认证设计

### 5.1 目标

YouBox Core 作为唯一身份提供方。桌面端和 Agent Service 不维护独立用户密码、注册、组织或登录体系。

### 5.2 登录流程

```diagram
╭──────────────╮
│ Desktop      │ 点击“登录 YouBox”
╰──────┬───────╯
       │ 打开系统浏览器
       ▼
╭──────────────╮
│ YouBox Web   │ 使用现有账号登录/确认授权
╰──────┬───────╯
       │ 生成一次性 auth code
       ▼
╭──────────────╮
│ Deep Link    │ youbox-agent://auth?code=...
╰──────┬───────╯
       │
       ▼
╭──────────────╮
│ Desktop      │ code 换 access/refresh token
╰──────┬───────╯
       │
       ▼
╭──────────────╮
│ Agent Service│ 校验 YouBox token，建立 Agent 数据上下文
╰──────────────╯
```

### 5.3 Token 形态

YouBox Core 签发面向桌面端的 token：

```json
{
  "iss": "https://api.you-box.com",
  "aud": "youbox-agent",
  "sub": "12345",
  "scope": "agent gateway",
  "exp": 1234567890
}
```

约束：

- `sub` 是 YouBox 用户 ID。
- Agent DB 只保存 `youbox_user_id`，不复制用户密码或主账户数据。
- 用户封禁、删除、token revoke 后，桌面端与 Agent Service 都应失效。
- refresh token 必须可撤销、可按设备管理。

### 5.4 YouBox Core 认证 API

建议在当前项目新增 Agent 身份接口：

```text
GET  /api/agent/auth/authorize
POST /api/agent/auth/exchange
POST /api/agent/auth/refresh
POST /api/agent/auth/logout
GET  /api/agent/auth/jwks
POST /api/agent/auth/introspect    # 可选，事件同步未完成前使用
GET  /api/agent/account
GET  /api/agent/models
```

说明：

- `/authorize` 依赖当前 YouBox Web 登录态。
- `/exchange` 将一次性 code 换成桌面 token。
- `/refresh` 刷新 token。
- `/logout` 撤销当前设备 refresh token。
- `/jwks` 供 Agent Service 离线校验 JWT。
- `/account` 返回用户状态、显示名、订阅摘要、额度摘要。
- `/models` 返回当前用户可用模型目录。

### 5.5 Core DB 中允许新增的认证数据

这部分属于 YouBox 用户系统扩展，不属于 Agent 业务 DB：

```text
user_agent_grants
- id
- user_id
- client_id
- device_label
- refresh_token_hash
- scopes
- last_used_at
- revoked_at
- created_at
- updated_at
```

该表只用于身份授权与撤销，不保存 workspace/session 等 Agent 业务数据。

## 6. 独立 Agent DB 设计

Agent Service 使用独立数据库或独立 schema。不要与 YouBox Core DB 建跨库外键，只通过 `youbox_user_id` 做逻辑关联。

### 6.1 Agent Service 表

```text
agent_users
- id
- youbox_user_id
- display_name_cache
- email_cache
- status_cache
- created_at
- updated_at

agent_devices
- id
- youbox_user_id
- device_id
- device_name
- platform
- app_version
- last_seen_at
- revoked_at
- created_at
- updated_at

agent_workspaces
- id
- youbox_user_id
- device_id
- name
- local_path_hash
- sync_enabled
- metadata_json
- created_at
- updated_at

agent_sessions
- id
- youbox_user_id
- workspace_id
- title
- status
- model
- last_message_at
- local_session_ref
- cloud_sync_state
- metadata_json
- created_at
- updated_at

agent_session_events
- id
- youbox_user_id
- session_id
- event_type
- payload_json
- sequence
- created_at

agent_policies
- id
- youbox_user_id
- policy_json
- source
- updated_at

agent_audit_logs
- id
- youbox_user_id
- device_id
- workspace_id
- session_id
- action
- risk_level
- payload_json
- created_at

agent_sync_cursors
- id
- youbox_user_id
- device_id
- resource_type
- cursor
- updated_at
```

### 6.2 数据边界

| 数据 | YouBox Core DB | Agent DB | Desktop Local |
| --- | --- | --- | --- |
| 用户账号/密码/OAuth 绑定 | 是 | 否 | 否 |
| 用户状态/角色/订阅/额度 | 是 | 只缓存摘要 | 只缓存展示需要 |
| 网关请求日志/扣费 | 是 | 否 | 否 |
| 桌面授权 refresh token hash | 是 | 可缓存设备状态 | 本地保存 token |
| Agent 设备 | 授权层记录 | 是 | 是 |
| Agent workspace/session | 否 | 是 | 是 |
| Agent 审计 | 否 | 是 | 是/可同步 |
| 工具审批记录 | 否 | 是 | 是 |

### 6.3 桌面本地 DB

桌面端应使用独立本地存储路径，例如：

```text
macOS:   ~/Library/Application Support/YouBox Agent/
Windows: %APPDATA%/YouBox Agent/
Linux:   ~/.config/YouBox Agent/
```

建议长期形态：

```text
youbox-agent.db
credentials.enc / OS keychain
workspace files
attachments
logs
```

敏感 token 不进入普通 SQLite 表，优先使用 OS keychain；若沿用 Craft 的 encrypted credential store，也要将配置目录改为 YouBox 品牌路径。

## 7. 模型与网关设计

### 7.1 产品约束

桌面端只保留一个模型提供方：

```text
YouBox Gateway
```

不作为产品能力保留：

- Anthropic OAuth
- Pi OAuth / Pi provider（Pi-compatible runtime adapter 仍可作为内部实现保留）
- BYOK API key
- Bedrock/service account
- Custom endpoint
- 多 provider 配置页

### 7.2 请求路径

```diagram
╭─────────────────────╮
│ YouBox Agent Desktop │
│ model = xxx          │
╰──────────┬──────────╯
           │ Authorization: Bearer <YouBox desktop token>
           ▼
╭─────────────────────╮
│ YouBox Gateway       │
│ - 校验用户             │
│ - 校验订阅/额度         │
│ - 路由渠道             │
│ - 扣费/日志             │
╰─────────────────────╯
```

### 7.3 Gateway token 实现选择

推荐内部实现可以复用现有 API token 计费路径：

- 用户登录桌面端后，YouBox Core 为该设备生成隐藏的 scoped gateway token。
- 桌面端产品上不展示为“API Key”，只作为 YouBox 登录凭证的一部分。
- 用户可在设备管理中 revoke。
- 网关请求仍走现有 token 解析、用户额度、订阅、日志链路。

也可以让 `/v1` 直接接受 desktop JWT，但需要改 relay/token 鉴权路径。若目标是降低侵入，隐藏 scoped token 更贴合当前网关架构。

### 7.4 模型目录

桌面端模型列表从 YouBox Core 获取：

```text
GET /api/agent/models
```

返回内容应包含：

```json
{
  "models": [
    {
      "id": "gpt-5.3-codex",
      "name": "GPT-5.3 Codex",
      "capabilities": ["chat", "tools", "vision"],
      "available": true,
      "reason": null
    }
  ],
  "default_model": "gpt-5.3-codex",
  "policy_version": "2026-06-30"
}
```

这样 `new-api` 上游新增模型/渠道后，只要 YouBox Core 同步成功，桌面端无需发版即可获得模型变化。

## 8. Agent Service API

Agent Service 负责 Agent 业务数据，不负责主用户系统。

建议 API：

```text
GET    /agent/v1/bootstrap
GET    /agent/v1/me

GET    /agent/v1/devices
POST   /agent/v1/devices/current/heartbeat
POST   /agent/v1/devices/current/revoke

GET    /agent/v1/policy
POST   /agent/v1/audit

GET    /agent/v1/workspaces
POST   /agent/v1/workspaces
PATCH  /agent/v1/workspaces/:id

GET    /agent/v1/sessions
POST   /agent/v1/sessions
PATCH  /agent/v1/sessions/:id
POST   /agent/v1/sessions/:id/events

GET    /agent/v1/sync/pull
POST   /agent/v1/sync/push
```

Agent Service 校验方式：

1. 使用 YouBox Core `/api/agent/auth/jwks` 校验 JWT。
2. `sub` 映射为 `youbox_user_id`。
3. 只访问 Agent DB。
4. 通过事件或 introspection 感知用户封禁/删除。

## 9. 桌面端改造范围

基于 Craft fork 建立 YouBox Agent Desktop。

### 9.1 品牌与发布

- app name：YouBox Agent。
- appId：使用 YouBox 自有命名空间。
- deep link：`youbox-agent://`。
- config dir：`YouBox Agent` 或 `.youbox-agent`。
- update URL：YouBox 自有更新服务。
- icons、签名、notarization、Windows signing 全部由 YouBox 维护。

### 9.2 登录与账号

- Onboarding 只显示“登录 YouBox”。
- 移除/隐藏 Craft provider 登录与 API key 配置入口。
- token 存储在 OS keychain 或 encrypted credential store。
- 支持 logout、refresh、revoke、账号状态刷新。

### 9.3 Provider registry

产品层只注册 YouBox Gateway。Pi-compatible runtime adapter 可以继续承载本地 agent 执行适配，但必须隐藏在 YouBox Gateway 之后，不能作为用户可选 provider 出现。

源码层可通过 feature flag 或 registry 控制保留上游 provider 代码，但不得在 YouBox Agent 产品中暴露或直接调用；默认路径必须始终是 YouBox Gateway。

推荐策略：

```text
ENABLE_EXTERNAL_PROVIDERS=false
DEFAULT_PROVIDER=youbox_gateway
```

### 9.4 Workspace/session

- 保留 Craft 本地 workspace/session 能力。
- 将本地配置路径和云端同步目标改为 YouBox Agent 数据域。
- 不把 session 写入 YouBox Core DB。
- 同步策略由 Agent Service 管理。

### 9.5 权限与工具执行

Craft 的本地权限系统应保留，但上限由 Agent Service policy 下发。

示例 policy：

```json
{
  "allow_shell": true,
  "allow_mcp": false,
  "allow_browser_tool": false,
  "allow_external_provider": false,
  "max_permission_mode": "ask",
  "audit_privileged_actions": true
}
```

本地工具能力属于桌面 Agent 核心价值，不能简单删除，但必须受到 YouBox policy 和本地审批系统双重约束。

## 10. 上游同步策略

### 10.1 YouBox Core 同步 `new-api`

当前主项目继续以 `Calcium-Ion/new-api` 为 upstream。同步原则：

- 同步后端功能、relay provider、模型、计费相关修复。
- 默认不合并 upstream `web/`、`docs/`、`Design-system/` 和部署默认项。
- 保留 YouBox 扩展 seam，例如 `registerYouBoxRoutes(apiRouter)`。
- YouBox Agent 相关身份接口放在独立文件中，减少与 upstream 冲突。

上游新增模型/渠道时：

```diagram
╭────────────────────╮
│ Calcium-Ion/new-api │
╰─────────┬──────────╯
          ▼
╭────────────────────╮
│ YouBox Core         │ 同步 relay/channel/model
╰─────────┬──────────╯
          ▼
╭────────────────────╮
│ YouBox Gateway      │ 新模型可用
╰─────────┬──────────╯
          ▼
╭────────────────────╮
│ YouBox Agent        │ 通过 /api/agent/models 获得
╰────────────────────╯
```

### 10.2 YouBox Agent Desktop 同步 Craft

Craft fork 独立维护 upstream：

```text
upstream = craft-ai-agents/craft-agents-oss
origin   = youbox-agent-desktop
```

推荐分支：

```text
main-upstream       # 原样跟随 Craft 上游
youbox-integration  # YouBox 改造分支
release/*           # 发布分支
```

同步方式：

```bash
git fetch upstream
git checkout main-upstream
git merge upstream/main

git checkout youbox-integration
git merge main-upstream
```

YouBox 改造集中在适配层：

```text
apps/electron/src/main/youbox/
apps/electron/src/renderer/youbox/
packages/shared/src/youbox/
packages/server-core/src/youbox/
```

核心文件只做注册点改动：

- 注册 YouBox auth flow。
- 注册 YouBox Gateway provider，并把 Pi-compatible adapter 作为内部 runtime 映射。
- 注册 YouBox policy client。
- 替换 branding/update/config dir。

避免：

- 大改 renderer。
- 大改 SessionManager。
- 大改 workspace/session 存储格式。
- 将 Craft 构建系统迁移进当前 YouBox Web。

## 11. 建设阶段

这不是临时 MVP，而是完整系统的建议建设顺序。

### 阶段一：身份统一

- YouBox Core 提供 Agent auth/token/JWKS/account/models API。
- 桌面端只支持 YouBox 登录。
- Agent Service 只认 YouBox token。
- 用户封禁、token revoke、设备 logout 可实时生效。

### 阶段二：独立 Agent 数据域

- 建立 Agent Service。
- 建立 Agent DB。
- 实现 device/workspace/session/audit/policy/sync 数据结构。
- Desktop 本地 DB 与 Agent Service 建立同步契约。
- YouBox Core DB 不保存 Agent workspace/session。

### 阶段三：YouBox Gateway 唯一模型入口

- Craft provider 收敛成 YouBox Gateway。
- 模型目录由 YouBox Core 下发。
- 所有模型请求走 YouBox 计费与日志。
- 移除/隐藏第三方 provider 设置入口。

### 阶段四：权限与审计

- 保留本地权限系统。
- Agent Service 下发权限上限。
- Shell/MCP/browser/file access 受策略控制。
- 高风险动作写入 Agent audit log。

### 阶段五：桌面发布体系

- 建立 YouBox Agent appId、icon、update URL。
- 建立 macOS notarization、Windows signing、Linux package。
- 建立自动更新和最小支持版本策略。
- 建立崩溃日志与隐私策略。

### 阶段六：上游同步制度化

- YouBox Core 定期同步 `Calcium-Ion/new-api` backend。
- YouBox Agent Desktop 定期同步 `craft-agents-oss`。
- 用 contract tests 固化 YouBox auth、Gateway provider、models API、Agent sync API。

## 12. 安全与合规要求

### 12.1 Token 与凭证

- refresh token 只保存 hash 到服务端。
- 桌面本地优先使用 OS keychain。
- access token 短期有效。
- 所有桌面 token 都有 `aud=youbox-agent` 和明确 scope。
- 用户可在 Web 控制台撤销单个设备。

### 12.2 本地工具执行

- 默认权限模式不能超过 Agent Service 下发上限。
- 高风险 shell/MCP/browser 操作需要审批或策略允许。
- 审计 payload 不应上传敏感文件内容，默认只上传动作、命令摘要、风险等级、时间、设备、workspace/session 引用。

### 12.3 数据隔离

- Agent Service 不直接访问 YouBox Core DB。
- YouBox Core 不访问 Agent workspace/session 表。
- 双方通过 token、API、事件通信。
- 删除用户时需要触发 Agent 数据删除或冻结流程。

## 13. 验收标准

### YouBox Core

- 桌面登录只依赖现有 YouBox 用户。
- 用户封禁或撤销设备后，桌面端和 Agent Service 请求失效。
- `/api/agent/models` 能正确体现用户模型权限。
- `/v1` Gateway 请求能映射到当前用户并进入现有计费/日志链路。

### Agent Service

- 所有数据表只通过 `youbox_user_id` 关联 YouBox 用户。
- 无跨库外键依赖。
- device/workspace/session/audit/sync 数据能独立迁移和备份。
- token 校验不依赖 YouBox Core DB 直连。

### YouBox Agent Desktop

- 首屏只提供 YouBox 登录。
- 无第三方 provider 配置入口。
- 模型调用只走 YouBox Gateway。
- 本地 workspace/session 正常工作。
- 策略下发可限制 shell/MCP/browser 等能力。
- 自动更新使用 YouBox 自有更新源。

### 上游同步

- YouBox Core 能继续按 backend-only 策略同步 `new-api`。
- YouBox Agent Desktop 能合并 Craft 上游常规更新。
- YouBox 适配层补丁集中、冲突面可控。

## 14. 待决策项

1. Agent Service 技术栈：TypeScript/Bun 更贴近 Craft，Go 更贴近 YouBox Core；建议优先 TypeScript/Bun。
2. Gateway 鉴权：直接接受 desktop JWT，还是登录时生成隐藏 scoped API token；建议优先隐藏 scoped API token 以复用现有计费链路。
3. 本地敏感凭证：优先 OS keychain，还是先沿用 Craft encrypted credential store。
4. Agent session 云同步粒度：只同步索引/标题/状态，还是同步完整消息与附件。
5. 高风险工具默认策略：普通用户是否允许 shell，MCP 是否默认关闭。
6. 已决策：当前仓库旧 `electron/` 壳子废弃并移除；后续桌面端以独立桌面仓库为准。
