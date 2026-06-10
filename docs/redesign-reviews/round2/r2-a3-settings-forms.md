# R2-A3 Review — 表单与设置组件族

- branch:`redesign/youbox-frontend-100`
- 落点:`src/components/settings/`(新建)+ `src/components/patterns/`(表单件)

## 组件交付与解剖

| 组件 | 解剖 / variants / states |
|---|---|
| `SettingRow` | label(medium)+ description(muted 13px)+ 右侧 control 插槽;行间 divider(last 无);`disabled` 整行降透明并阻断交互(依赖联动);`htmlFor` 关联 control |
| `SettingsPanel` | Panel + eyebrow 分组头 + actions 插槽 + SettingRow 列表;`flush` 变体承载表格/编辑器 |
| `SettingsRail` | 桌面 220px sticky 垂直导航(icon+label+active=surface-2);<lg 塌缩为水平 scroll 条;radiogroup + 上下左右/Home/End roving focus;选择回调交由页面接路由 |
| `StickySaveBar` | dirty 时 sticky bottom 滑入(`animate-in`,reduced-motion 降级);`You have unsaved changes` + Discard/Save;saving spinner + 双按钮禁用;role=status;文案走 `t()` |
| `ChipGroup` / `Chip` | 单选(radiogroup + 方向键 roving + 即选)/多选(aria-pressed);selected = brand-subtle/brand-border;`size='preset'` 高 52px display 字体(充值预设);icon 子元素;disabled 跳过键盘序 |
| `ParameterSlider` | label + mono tabular 读数 + Base UI Slider 填充轨道;`formatValue`;disabled;label/aria-label 关联 |
| `MonoInput` | InputGroup 上的 mono 字段 + prefix/suffix addon(`$`、`%`、`/s`、icon) |
| `CurrencyInput` | `$` 金额(inputMode=decimal)+ 右侧货币插槽(select/静态) |
| `ThresholdInput` | `≤ $25` / `+ $50` 运算符前缀形态 |

## 门槛核对

| 门槛 | 结果 |
|---|---|
| Design Lab 全演示 | pass — `settings-forms` 分组:rail+panel+rows(含禁用联动)、save bar dirty/save 流、三种 ChipGroup、三态 ParameterSlider、全部 input 形态及 SettingRow 内嵌用例 |
| 键盘逐项验证 | pass(playwright):rail ArrowDown General→Authentication;chip ArrowLeft $100→$50;多选 toggle 计数 2;slider ArrowRight 0.7→0.8;FilterTabs 同型已在 A2 验证 |
| typecheck / i18n:sync | pass(修复 MonoInput 与原生 `prefix` 属性类型冲突;StickySaveBar 三条文案入 t(),i18n:sync 已跑) |
| 交互态 | dirty→save bar 出现→Save spinner→消失;父开关关闭→子行 `data-disabled`;截图佐证 |

## 浏览器审查

截图:`screenshots/r2-a3/`:`settings-{dark,light}-1280.png`、`settings-dirty-disabled.png`、`settings-interactions.png`、`settings-mobile-375.png`(rail 塌缩水平条)。无 console/page error。

## 结论

**pass** — 进入 R2-A4。
