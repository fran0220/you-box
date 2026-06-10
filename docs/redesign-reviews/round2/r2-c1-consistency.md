# R2-C1 Review — 全局一致性收口

- branch:`redesign/youbox-frontend-100`

## 一次性样式扫描

- 设计稿类名(`statcard`/`panel__`)残留:0;已删私有实现(summary-cards/performance-overview/profile-header/wallet-stats-card/growth-text/dashboard ui StatCard)无 dangling import。
- 手写 stat 卡/progress bar:0 违例(`model-details.tsx` SpecItem 为已记录适配:StatCard 不支持 value intent 着色)。
- 手写 eyebrow:1 处违例(design-lab shell)→ 已改消费 Eyebrow;5 处 `yb-eyebrow` 全局 utility(landing 11px 变体)判定合规。
- pill tab 违例 2 处 → 收敛:`SegmentedControl` 提升为 `components/patterns/segmented-control.tsx`(进 Design Lab 演示,规则 5);rankings-hero 手写 tablist 改 `ui/tabs` line variant。

## 死代码清理

删除:`useSummaryCardsConfig`(零引用)、`settings-card.tsx`、`model-badge.tsx`(本轮替换后零引用)。main 上即已死的 9 个文件列入清单不动(非本轮孤儿,留存量治理)。

## motion / reduced-motion

新增组件全部复验;修复 5 处无保护 `animate-pulse` → `motion-safe:animate-pulse`(status-badge pulse、api-info-item ×2、overview-insights loading、design-lab fallback);landing 动画已有全局 reduced-motion 覆盖。

## 断点/键盘/aria

Phase A 组件键盘行为(FilterTabs/ChipGroup/SettingsRail roving、Slider、SecretReveal aria-pressed、RowActionButton 强制 label)在各步浏览器验收复验;375 断点横向溢出每步实测 0。

## 验证命令

- `bun run typecheck` pass
- `bun run lint`:98 errors / 9 warnings(基线 99-103 存量,无新增,净减)
- `bun run build` pass;生产包 Design Lab 代码 0 命中(含新增 demo)
- `bun run i18n:sync` 干净;`format:check` 存量 67(基线 69,触及文件已格式化)
- `bun run copyright` pass

## 结论

**pass** — 进入 R2-C2。
