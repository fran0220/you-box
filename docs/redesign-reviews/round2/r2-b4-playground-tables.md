# r2-B4 结构对照表 — /playground

设计基准:`SCREENS.playground`(screens-console.js:106-135)

## 结构对照表

| # | 设计稿 section | 现状 | 目标实现(组件 + 文件) | 必做交互 | 适配决策 |
|---|---|---|---|---|---|
| 1 | 左 flex + 右 320px 参数 rail 栅格 | 单列 | `features/playground/index.tsx`:`lg:grid-cols-[minmax(0,1fr)_320px]`;右 rail 在 <lg 塌缩为 Sheet/Drawer(头部按钮开关) | 抽屉开关 | rail 背景 surface,左右分隔线 |
| 2 | ModelSelectorHeader:模型选择 + throughput/价格 tags + reset/share | 模型选择在 composer 内 | A5 `ModelSelectorHeader`:trigger = 现有 ModelGroupSelector(上提)、tags = 选中模型的分组倍率/描述(`ModelMetaTag`,有什么显什么)、actions = Reset(清空会话,确认后 clearMessages)+ 移动端参数按钮 | reset 确认、选择联动 | **share 无后端 → 不做(已记录)**;throughput/价格无实时数据 → tags 显示分组/倍率(ModelOption.ratio/desc 有则显) |
| 3 | 消息流:角色 tile + speaker label + 流式光标 | bubble Message | `playground-chat.tsx` 改用 A5 `SpeakerMessage`(user=initials/assistant=✦,speaker=You/模型名);流式中末尾 `StreamingCursor`;编辑/分支/操作按钮全部保留 | 编辑/重发/分支/复制/删除 | Message bubble 体系保留供其他消费方;reasoning/sources/tool 已 A5 panel 化 |
| 4 | Composer:`(⌘↵ to send)` 提示 | PromptInput | placeholder 或 footer 加 ⌘↵ 提示(mac ⌘↵ / 其他 Ctrl↵,用 Kbd 形态或 placeholder 文案);现有快捷键行为确认(若无则补 mod+Enter 提交) | ⌘↵ 发送 | 建议 pills/附件菜单(开发中占位)保留 |
| 5 | 参数 rail:`// parameters` eyebrow + ParameterSlider×N + SettingRow toggles + `// this session` SessionStats | 无 UI(状态/payload 已支持) | 新 `playground-parameters.tsx`:Eyebrow + A3 `ParameterSlider`(temperature 0-2/top_p 0-1/max_tokens/frequency_penalty/presence_penalty,接 usePlaygroundState 的 parameters + ParameterEnabled 开关:slider 旁小开关或 enable 联动)+ divider + Stream response Switch(SettingRow 形态)+ divider + `// this session` SessionStats(Tokens/Cost/Latency) | slider 键盘、开关、参数实际进 payload | **SessionStats 数据**:从最近一次响应 usage 估算(若 usage 不可得 → 显示 tokens 估算/`—`,已记录);seed/JSON mode 等现有支持项一并暴露(有状态字段才做) |
| 6 | 移动端:rail 塌缩抽屉 | — | Sheet(ui/sheet)承载同一参数组件 | 抽屉内交互等价 | — |

## 功能保全清单

| # | 旧功能 | 旧入口 | 新入口 | 复验 |
|---|---|---|---|---|
| 1 | 消息编辑(Save / Save & Submit) | hover actions | 保留(SpeakerMessage 容器内) | ☑ |
| 2 | Regenerate 重发 | actions | 保留 | ☑ |
| 3 | 分支版本导航(Branch prev/next) | 多版本消息 | 保留 | ☑ |
| 4 | Reasoning `<think>` 折叠(流式 Shimmer/时长) | 消息内 | 保留(A5 panel 形态) | ☑ |
| 5 | Sources 折叠 | 消息内 | 保留 | ☑ |
| 6 | 停止生成 | Send→Stop 按钮 | 保留 | ☑ |
| 7 | 建议 pills(6 个) | composer 上方 | 保留 | ☑ |
| 8 | 模型 + 分组选择(ModelGroupSelector) | composer 工具行 | 上提至 ModelSelectorHeader(composer 行移除重复入口) | ☑ |
| 9 | 流式渲染 | — | 保留 + StreamingCursor | ☑ |
| 10 | 复制/删除消息 | actions | 保留 | ☑ |
| 11 | 错误消息(model_price_error 特殊处理) | MessageError | 保留 | ☑ |
| 12 | 附件菜单(开发中 toast 占位) | composer | 保留 | ☑ |
| 13 | 参数状态(temperature/top_p/max_tokens/penalties/seed/stream)进 payload | payload-builder(无 UI) | 参数 rail UI 接通 | ☑ |
