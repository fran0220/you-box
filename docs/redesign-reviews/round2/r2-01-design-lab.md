# R2-01 Review — Design Lab 组件画廊

- branch:`redesign/youbox-frontend-100`

## 交付

| 文件 | 职责 |
|---|---|
| `src/routes/design-lab.tsx` | `/design-lab` 路由;`beforeLoad` 在非 DEV 抛 `notFound()`;组件经 `import.meta.env.DEV ? lazy(...) : null` 静态分支,生产构建死代码消除 |
| `src/features/design-lab/index.tsx` | 画廊 shell:sticky 头部(brand mark + ThemeSwitch)+ 左侧 200px sticky 分组导航(IntersectionObserver scroll-spy)+ 锚点 section |
| `src/features/design-lab/registry.ts` | 分组注册表;Phase A 每步在此追加 demo 模块(lazy) |
| `src/features/design-lab/components/demo-block.tsx` | `DemoBlock`(组件级演示卡)/`DemoRow`(variant/state 行,mono uppercase 标签) |
| `src/features/design-lab/demos/foundations.tsx` | Foundations 组:surface/semantic 色板 + display/sans/mono 字阶(shell 载体证明) |

## 门槛核对

| 门槛 | 结果 |
|---|---|
| typecheck | pass(`tsc -b` 无错) |
| build | pass(`bun run build`) |
| 生产包无画廊代码 | pass — `grep 'Design Lab'` = 0、DemoBlock/演示文案 0 命中;仅剩 routeTree 中的 `design-lab` 路径字符串,该路由在生产 `beforeLoad` 即 404 |
| 画廊使用 YouBox shell 形态 | pass — token 化头部/导航/eyebrow 分组,dark+light 截图 |

## 浏览器审查

- `/design-lab` dev 环境渲染正常,无 console/page error。
- 截图:`screenshots/r2-01/design-lab-{dark,light}-1280.png`、`design-lab-light-375.png`(移动端导航塌缩为纯内容流)。

## 备注

- 画廊为 dev-only 工具页,文案不进 i18n(不影响用户面);Phase A 各步在 registry 追加分组即可被验收。

## 结论

**pass** — 进入 R2-A1。
