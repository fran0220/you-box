# R2-B15 Review — 营销/认证/错误/Setup 缺口收尾

- branch:`redesign/youbox-frontend-100`
- 缺口来源:`r2-00-gap-index.md` 第三节复核清单

## 逐项验收

| 缺口 | 结果 |
|---|---|
| Home quickstart CodeBlock | **pass** — how-it-works 增补 chrome 化 quickstart.sh CodeBlock(curl 示例,endpoint=站点 origin;实测渲染);hero 交互终端按对照不动 |
| Legal TOC rail | **pass/adapted** — Markdown 内容左 220px sticky 锚点 TOC(h2/h3 slug 提取与渲染侧一致,Markdown 组件新增 withHeadingIds);iframe/HTML 不显示;Last updated 无数据源 → 不做(注释记录) |
| 密码强度条 | **pass/adapted** — `auth/components/password-strength.tsx` 4 段评分条 + Weak/Fair/Good/Strong 文案(实测 sign-up 实时反馈);reset-confirm 流程无新密码输入(后端发随机密码)→ 跳过(已记录) |
| Setup StepIndicator + 底部状态行 | **pass** — 4 步卡片网格改 A4 StepIndicator(圆点+连线),描述移步内容顶部;底部 mono `{系统名} {version} · {db} connected`(version 自 /api/status,db 自 setup status);本实例已初始化无法浏览器复跑 setup 向导,typecheck + 代码审查通过(已记录) |
| Error request-id | **adapted(不做)** — 无请求 id 数据源,gap index 既定 |

## 验证命令

typecheck pass;i18n:sync(7 键);copyright pass;改动文件 eslint 零新增。截图:`screenshots/r2-b15/`。

## 结论

**pass** — Phase B 全部完成,进入 Phase C(R2-C1)。
