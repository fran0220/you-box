# R2-C4 — React Compiler lint 债务清零(95 → 0)

- branch: `redesign/youbox-frontend-100`
- 背景:R2-C3 发现 HEAD 上有 95 个 React Compiler 规则错误(react-hooks v6 recommended),分布在 ~60 个文件,此前因管道掩盖退出码被误记为 "lint 通过"。
- 本轮:分 5 批全部清零,且顺带清零全部 warning(最终 `eslint .` exit 0,0 error 0 warning),无新增任何 eslint-disable 抑制(净移除 3 个既有抑制)。

## 分批(每批独立 commit)

| 批 | 范围 | commit |
|---|---|---|
| 1/5 | 共享 hooks/组件(use-mobile、use-table-url-state、theme-radius、datetime-picker、json-editor、web-preview、risk-acknowledgement-dialog、use-minimum-loading-time) | 0b040630 |
| 2/5 | auth + profile(OAuth/passkey/2FA hooks、登录表单、profile 卡片与 tabs) | 50e67759 |
| 3/5 | channels 弹窗 ×8 + dashboard 图表 + models 弹窗/抽屉 | 72b17ea3 |
| 4/5 | system-settings(refs-during-render ×8、内容区 section ×4、分组倍率/阶梯计价编辑器等) | 28996ec7 |
| 5/5 | usage-logs + users + wallet + subscriptions + 全部残余 warning | 4883e26e |

## 标准修复模式(批 1 确立,后续批沿用)

1. **prop/外部值同步 effect → render 期间调整 state**(React 官方 adjust 模式,编译器接受):`const [prev, setPrev] = useState(v); if (prev !== v) { setPrev(v); setX(derive(v)) }`;比较语义与原 effect deps 完全一致。
2. **弹窗 open 重置/预填** → 同上,以 `open`(或 open+记录标识复合 key)为比较键;配合惰性 useState 初始化覆盖"挂载即打开"。
3. **render 路径必须纯**:Date.now 行 id → generation 计数器 state;过期判断 → 数据获取时刷新的 `nowSec` state。
4. **必须 post-commit 的副作用**(DOM 读取、fetch-on-open):effect 内经 setTimeout(0)/rAF/queueMicrotask **异步** setState(规则只禁 effect 体内同步 setState);fetch 用 `useEffectEvent` 摆脱 deps。
5. **媒体查询订阅** → `useSyncExternalStore`(use-mobile)。
6. **refs-during-render** → `form.handleSubmit(onSubmit)` 由 render 期调用改为事件期调用;ref 初值进惰性 state。
7. **render 中创建组件** → 提升到模块作用域(user-info-dialog 的 InfoItem,9 处)。
8. 其余:闭包变量重赋值 → for 循环;use-before-declare → 声明前移;`location.href=` → `location.assign()`;不诚实的 useMemo deps → 修正。

## 验证

- 静态:`eslint .` exit 0(0 error / 0 warning);`tsc -b` ✓;生产构建 ✓。
- 运行时(fresh SQLite 后端 :3001 + dev :3000,Playwright):
  - **80 路由 harness 复跑:与重构前基线完全一致** —— 仅 2 个既有预期 flag(登出态 `/oauth` 的 401 探测、`/500` 自身文案命中正则),0 pageerror,58 个认证路由全部以认证态渲染。
  - **重点交互实测**(覆盖重构最密集路径,全程 0 page error):system-settings System Name 改名 → 脏检测出现 StickySaveBar → 保存 → reload 持久化 ✓(并还原);channels Add Channel 抽屉打开、输入可交互(含 model-mapping-editor 挂载)✓;usage-logs 筛选输入不丢键(URL→state 同步重构)✓;wallet 页渲染 ✓;profile 2FA setup 弹窗打开(deferred fetch 重构)✓。

## 备注

- `tiered-pricing-editor.tsx:1669` 保留一个**既有** disable(initRef 门控的 once-per-model 初始化,与 dirty 流耦合,改写风险大于收益);其余既有 react-hooks disable(cache-stats-dialog、rule-editor-dialog、form-navigation-guard 等)不在 95 错误清单内,未触碰。
- settings-page-context 拆分:context 对象与类型移至 `settings-page-context-store.ts`,chrome hook 移至 `use-settings-section-chrome.ts`(消除 react-refresh only-export-components 警告);既有组件导入路径不变。
