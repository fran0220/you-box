# Design-system Gap Closure — 复审报告

- **分支**: `redesign/youbox-frontend-100`
- **基准**: `Design-system/*.dc.html`（41 屏，不含已移除的 Chat2Link）
- **日期**: 2026-06-29

## 实施摘要

| 区域 | 改动 | 结论 |
|------|------|------|
| Home `/` | 居中单栏 hero、CodeBlock、内嵌统计条、信任行；移除双栏终端 demo | **pass** |
| Status `/status` | 后端 UK history + 多窗口 uptime；vendor 聚合；Subscribe 读 `status_page_url`；incident 标题 | **pass**（UK 未配置时 honest 空态） |
| Docs `/docs` | 三栏 + scroll-spy；参数表/错误码/Response；保留 Request builder | **pass** |
| Legal `/legal/*` | TOC scroll-spy；DPA 静态 fallback；Privacy/Terms 统一页 | **pass** |
| About `/about` | 空态 → 营销 fallback（hero/统计/原则卡） | **pass** |
| Model detail | Open in Playground（`?model=`） | **pass** |
| Nav | `/apps` 公开顶栏入口 | **pass** |
| 后端 | `Monitor.history`、`uptime_24h`、公开 `status_page_url` | **pass** |
| 清理 | Chat2Link i18n 删除；harness +4 路由 | **pass** |

## 自动化验证

| 检查 | 结果 |
|------|------|
| `go build ./controller/...` | pass |
| `bun run typecheck` | pass |
| `bun run build` | pass |
| `bun run i18n:sync` | missing=0；gap-closure **109** key 已写入 6 语种 |
| `verify-harness.mjs` | **85** 路由，**1** 预期 warn（`/500` ERROR_BOUNDARY 误报） |

## Harness 截图（2026-06-29）

- 报告：`/tmp/yb-verify/report.json`
- 截图目录：`/tmp/yb-verify/shots/{pub|auth}-{name}/dark-{375,768,1280,1536}.png` + `light-1280.png`
- 公开页抽检：home / status / docs / about / legal-* 均渲染完整（无 NEAR_BLANK / H_OVERFLOW）
- Status 空数据时 headline 已与 Home pill 对齐为 **All systems operational**（非 Unknown）

## Harness 路由（公开页新增）

- `/status`
- `/docs`
- `/legal/privacy`
- `/legal/terms`

## 仍标记 adapted（不做假 UI）

| 项 | 原因 |
|----|------|
| Dashboard/Usage/Users Export | 无导出 API |
| Notification Preferences | 无用户偏好 API |
| 用户 Invoices 表 | 无用户发票模型 |
| Error request-id | 无请求 ID 数据源 |
| 独立 `/analytics` | 能力在 dashboard 子页 |
| Home「Tokens routed」日量 | 无公开聚合 API，hero 统计仅 Models/Providers/Uptime |

## 41 屏分类结论

| 类别 | 屏数 | 复审 |
|------|------|------|
| Marketing | 9 | Home/Status/Docs/Legal/About 已对齐；其余 Round2 pass |
| Auth | 6 | 回归 pass |
| Console | 12 | Round2 pass |
| Admin | 10 | Round2 pass |
| Overlays/Errors | 4 | 回归 pass |

**P0/P1 gap: 0**（相对本轮审计清单）