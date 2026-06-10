# R2-B5 Review — Chat shell 重做

- branch:`redesign/youbox-frontend-100`
- 前置文档:`r2-b5-chat-tables.md`(含适配前提:iframe 消息区不可重做,范围=shell)

## 结构对照表验收

| # | 设计稿 section | 结果 |
|---|---|---|
| 1 | 左 260px 会话 rail | **pass/adapted** — `// presets` Eyebrow + search 过滤 + ConversationRailItem(title+域名/Opens externally 副行+active)+ 底部用户卡(avatar+名+mono 余额,实测 `RO Root User $201`);New chat/日期分组无数据模型 → 不做(已记录);外链预设保留 fetchActiveChatKey→window.open 语义;fluent 类型预设与全局 sidebar 同语义过滤 |
| 2 | 顶部 bar | **pass/adapted** — 预设名 + Embedded/External Badge + Open in new tab iconbtn;share/more 无数据 → 外开代替(已记录) |
| 3 | iframe 容器面板化 | **pass** — 内容区 border 分隔承载 iframe,onLoad 前 Skeleton;allow 权限/apiKey 注入/src 重挂保留 |
| 4 | 空状态 | **pass** — 5 种状态统一渲染于 shell 内容区,rail/顶 bar 恒在 |

## 功能保全清单复验

tables 6 项全 ☑(预设解析、resolveChatUrl+key 注入、iframe 权限、不存在/非 web 提示、key 加载/错误/src 失败状态、外链新窗口)。

## 浏览器审查

配置 2 个预设(web + 外链)实测:rail 2 项 + active 态 + 切换;顶 bar badge;iframe 实际加载;dark/light @1280;移动端 375 rail 隐藏、无溢出。截图:`screenshots/r2-b5/`。

## 验证命令

typecheck pass;i18n:sync(6 键 × 6 语言);copyright pass;改动文件 eslint 0 错。

## 结论

**pass** — 进入 R2-B6。
