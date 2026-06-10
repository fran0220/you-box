# r2-B5 结构对照表 — /chat/$chatId

设计基准:`SCREENS.chat`(screens-console2.js:209-233)

**适配前提(经 review 确认)**:当前 chat 为外部预设 iframe 容器(消息区不可重做);消息流/composer 由外部应用渲染。本步范围 = **shell**:左侧预设 rail + 顶部 bar + 容器面板化 + 空状态。

## 结构对照表

| # | 设计稿 section | 现状 | 目标实现(组件 + 文件) | 必做交互 | 适配决策 |
|---|---|---|---|---|---|
| 1 | 左 260px 会话 rail:New chat 按钮 + search + 日期分组 + ConversationRailItem + 底部用户卡 | 无侧栏(仅全局导航) | `routes/_authenticated/chat/$chatId.tsx` 重构出 `features/chat/components/chat-shell.tsx`:左 rail(`hidden lg:flex` 260px)列出全部 chat 预设(useChatPresets),A5 `ConversationRailItem`(title=预设名,sub=type/url 域名,active=当前 chatId),点击导航 `/chat/$index`;顶部 search 输入过滤预设;底部用户卡(avatar+用户名+mono 余额) | 预设切换、过滤 | **New chat / 日期分组无数据模型(预设为静态配置)→ rail 标题 eyebrow `// presets`,无 New chat 按钮(已记录)**;移动端 rail 隐藏(全局 sidebar 已有预设导航) |
| 2 | 顶部 bar:会话标题 + 模型 tag + share/more | 无 | shell 顶 bar:预设名称 + Badge(type:web/外链)+ 右侧「在新窗口打开」iconbtn(ExternalLink,打开 resolved url) | 新窗口打开 | share/more 无数据 → 以 Open external 代替(已记录) |
| 3 | iframe 容器面板化 | 裸 iframe | iframe 包在内容区(border-l 分隔,撑满高度);loading 时 Skeleton | — | 保持 allow='camera; microphone'、apiKey 注入 |
| 4 | 空状态(无预设/非 web/key 加载/错误) | 5 种状态已有 | 保留,统一放进 shell 内容区(形态沿用现 EmptyState/InlineAlert) | 返回按钮 | — |

## 功能保全清单

| # | 旧功能 | 旧入口 | 新入口 | 复验 |
|---|---|---|---|---|
| 1 | 预设解析(localStorage status.chats/Chats) | useChatPresets | rail + 内容区共用 | ☑ |
| 2 | resolveChatUrl + apiKey 注入 | iframe src | 保留 | ☑ |
| 3 | camera/microphone 权限 | iframe allow | 保留 | ☑ |
| 4 | 预设不存在 / 非 web 类型提示 + 返回 | 空状态 | 保留 | ☑ |
| 5 | key 加载中 / key 错误 / src 生成失败状态 | 状态组件 | 保留 | ☑ |
| 6 | 外链型预设(非 web)新窗口打开 | 提示页按钮 | 保留 + rail 标注 | ☑ |
