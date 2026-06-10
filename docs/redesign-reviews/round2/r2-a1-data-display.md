# R2-A1 Review — 数据展示组件族

- branch:`redesign/youbox-frontend-100`
- 落点:`src/components/patterns/`(新建)+ Design Lab `data-display` 分组

## 组件交付与解剖

| 组件 | 解剖 / variants / states |
|---|---|
| `Panel` / `PanelHeader` / `PanelBody` | surface-card + border + radius-lg;header = eyebrow? + title + actions 插槽(divider 下边);可无头(body p-0 flush 内容);demo 演示 header+actions 与 headless 两态 |
| `Eyebrow` | `// UPPERCASE` mono 10px 0.1em brand;`plain` 变体去前缀;`//` 前缀 aria-hidden |
| `StatCard` | label(mono uppercase + 可选 icon)→ value(display 2xl/3xl + mono unit)→ 可选 Sparkline → 可选 DeltaBadge;`size=md/sm`;`loading` 骨架态(高度稳定);demo 演示 4-up/sm/loading/flat/teal-sparkline |
| `StatCardRow` | grid 1→2→n 响应塌缩,columns 2-5 |
| `Metric` | k(mono 9px uppercase muted)/ v(mono sm medium);`align='end'` 变体;`<b>` 子元素 brand 着色 |
| `ProgressBar` | 6px pill,surface-3 轨道;tone brand/teal/success/warning/danger;`value/max`;role=progressbar + aria-valuenow/label;width 过渡 motion-reduce 降级 |
| `Sparkline` | 单系列面积微图;`fill` 开关、`color` 任意 token、`height`;`useId` 渐变防冲突;aria-hidden(纯装饰);单点数据降级为水平线 |
| `DeltaBadge` | trending icon + mono xs;direction(up/down/flat)映射 success/danger/muted;`tone` 覆盖(延迟下降=success 场景) |

## 门槛核对

| 门槛 | 结果 |
|---|---|
| 全部进 Design Lab | pass — `demos/data-display.tsx` 七个 DemoBlock 覆盖全部 variants/states |
| dashboard 私有 StatCard 标记 deprecated | pass — `features/dashboard/components/ui/stat-card.tsx` `@deprecated` JSDoc(B1 完成替换后删除) |
| typecheck | pass(`tsc -b`;修复 Sparkline 与原生 SVG props 的 `fill/color/height/width` 类型冲突) |
| 键盘 / reduced-motion | 组件均非交互件(无焦点序);ProgressBar 过渡 `motion-reduce:transition-none` |

## 浏览器审查

- `/design-lab#data-display` dark+light @1280、light @375(StatCardRow 塌缩 1 列)无 console/page error。
- 截图:`screenshots/r2-a1/patterns-{dark,light}-1280.png`、`patterns-light-375.png`。

## 结论

**pass** — 进入 R2-A2。
