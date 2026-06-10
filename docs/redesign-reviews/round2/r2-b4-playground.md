# R2-B4 Review — Playground 重做

- branch:`redesign/youbox-frontend-100`
- 前置文档:`r2-b4-playground-tables.md`

## 结构对照表验收

| # | 设计稿 section | 结果 |
|---|---|---|
| 1 | 左 flex + 右 320px rail | **pass** — `lg:grid-cols-[minmax(0,1fr)_320px]`,rail surface + border-l 内滚动;<lg 塌缩 Sheet(实测移动端按钮存在并打开) |
| 2 | ModelSelectorHeader | **pass/adapted** — A5 组件:trigger=上提的 ModelGroupSelector(分组+模型),tags=分组 Ratio/desc ModelMetaTag(实测 `Ratio: 1` + 分组描述),actions=Reset(ConfirmDialog→clearMessages);share 无后端不做(已记录);throughput/价格无实时数据 → 分组倍率(已记录) |
| 3 | 消息流 speaker 解剖 + 流式光标 | **pass** — SpeakerMessage(user=用户名首 2 字符 tile + You;assistant=✦ + 模型名);编辑/Branch/actions/Reasoning/Sources/MessageError 全保留(实测错误消息 + 4 个 action 按钮);最后一条 assistant 流式时 StreamingCursor |
| 4 | Composer ⌘↵ | **pass** — placeholder `Send a message…` + footer `⌘↵ / Ctrl↵ to send` Kbd 提示(平台检测);Enter 发送行为不变 |
| 5 | 参数 rail | **pass/adapted** — `// parameters` + 5 ParameterSlider(各带启用 Switch,禁用态实测 Max tokens/Seed)+ Seed MonoInput + Stream response SettingRow + `// this session` SessionStats;Tokens=非流式 usage 累计、Latency=实测耗时、Cost 无单请求计费透传 → `—`(不伪造,已记录);参数与 payload-builder 同一 state 接线确认 |
| 6 | 移动端抽屉 | **pass** — Sheet 复用同一 PlaygroundParameters;375 无横向溢出 |

## 功能保全清单复验

tables 13 项全 ☑:编辑(Save/Save&Submit)、Regenerate、分支导航、Reasoning/Sources 折叠、停止生成、建议 pills、模型分组选择(上提后单一入口)、流式渲染、复制/删除、错误组件(实测渠道缺失错误正常展示)、附件占位、参数进 payload。

## 浏览器审查

dark/light @1280、消息流(发送→user/assistant speaker 形态→错误面板)、reset 确认、移动端 Sheet;5 sliders + 3 session stats rows 实测;无 page error。截图:`screenshots/r2-b4/`。

## 验证命令

typecheck pass;i18n:sync(19 键 × 6 语言);copyright pass;eslint 仅存量 2 处 query/exhaustive-deps(stash 对照确认非本次引入)。

## 结论

**pass** — 进入 R2-B5。
