# R2-A5 Review — 代码与 AI 会话组件族

- branch:`redesign/youbox-frontend-100`
- 落点:`src/components/ai-elements/`(扩展 + 新建)+ `styles/index.css`(blink keyframes)

## 交付

| 项 | 内容 |
|---|---|
| `CodeBlock` 统一版 | 既有 Shiki 高亮版新增 `title` chrome bar:三窗点 + mono 文件名 + `CodeBlockCopyButton`(copy→check 反馈);无 `title` 时与旧形态完全一致(Response/Tool 消费方不受影响);语法 token 色由 Shiki one-light/one-dark-pro 主题承载(DS 色板对应关系记录:key=orange、str=teal、fn=blue 同族) |
| `Message` 解剖扩展 | 新增 `MessageTile`(user=surface-3 initials / assistant=brand-subtle ✦ / system)与 `SpeakerMessage`(tile + speaker label + 全宽内容列);既有 bubble Message/MessageContent 原样保留 |
| `StreamingCursor` | 7×16px brand 块,`yb-blink` step-end 闪烁;`motion-reduce` 降级为常亮 70%;aria-hidden |
| `Reasoning` / `Sources` | 折叠面板统一 Panel 形态(card/60 + border + rounded);auto-open/close、Shimmer、时长逻辑未动 |
| `ModelSelectorHeader` / `ModelMetaTag` | 头部行:picker trigger 插槽 + throughput/价格 tags(md 以上显示)+ reset/share actions + 底部分隔线 |
| `SessionStats` | `dl` 语义 k/v 行(Tokens/Cost/Latency),mono tabular |
| `ConversationRailItem` | 标题 + 模型/时间副行 + active(surface-2)+ `aria-current`;focus ring |

## 门槛核对

| 门槛 | 结果 |
|---|---|
| Design Lab 演示 | pass — `ai-code` 分组 6 个 DemoBlock(chrome/无 chrome CodeBlock、双角色消息 + 流式光标、Reasoning/Sources 折叠、header、stats、rail) |
| playground 现有功能不回归 | pass — root 登录后 `/playground` 正常渲染(建议 pills、composer、模型选择存在),无 console/page error;消息编辑/分支等深度交互依赖上游模型,无法离线触发,代码路径未改动(仅 Message 新增导出、Reasoning/Sources 容器样式) |
| typecheck | pass |
| 交互验证 | pass — chrome copy 点击、Reasoning 展开内容可见、Sources 展开(Used 2 sources → 链接可见)、rail item 切换 `aria-current=true` |

## 浏览器审查

截图:`screenshots/r2-a5/`:`ai-code-{dark,light}-1280-{top,bottom}.png`、`ai-code-interactions.png`、`playground-smoke.png`。

## 结论

**pass** — Phase A 完成,进入 Phase B(R2-B1 Dashboard)。
