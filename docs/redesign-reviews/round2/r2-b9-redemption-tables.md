# r2-B9 结构对照表 — /redemption-codes

设计基准:`SCREENS.redemptionAdmin`(screens-admin2.js:97-121)

## 结构对照表

| # | 设计稿 section | 现状 | 目标实现 | 必做交互 | 适配决策 |
|---|---|---|---|---|---|
| 1 | 两列 340px/1fr:左常驻生成器 Panel(Value/Quantity/Max uses/Expires + Generate CTA + 「shown once」说明) | 生成在 Mutate Drawer | 新 `generator-card.tsx`:Panel(`lg:w-[340px]` 左列 sticky)字段:Name、Value(MonoInput $ 前缀,USD→quota 换算沿用现有逻辑)、Quantity(MonoInput 1-100)、Expires(现有 DateTimePicker 或 Never);CTA `Generate {{n}} codes`(随 Quantity 联动)→ 调用现有创建 mutation;成功后 InlineAlert success + 批量复制按钮(创建响应含 keys 数组) | 生成、联动 CTA、复制 | **Max uses per code 后端无字段(每码一次)→ 不做该字段,说明文案改为单次(已记录)**;Drawer 保留用于编辑(创建入口改为生成器,原 Create 按钮移除或指向生成器) |
| 2 | 右上 3 StatCard(Codes issued/Active/Value redeemed) | 无 | statHeader StatCardRow(3,sm):Codes issued(接口 total)/ Unused(当前页 status=1 计数)/ Redeemed value(当前页已兑换 quota 合计 formatQuota) | loading | 当前页聚合(已记录);Active→Unused、Value redeemed→已兑换面值,词汇按数据实义 |
| 3 | 批次表:Code mono 遮罩、Value、Used、Progress、Status badge、copy/delete rowact | 10 列 | status → StatusBadge soft;quota → MonoCell;code 遮罩保留;**Used 进度列**:单次码无 used/total 维度 → 不加 ProgressBar 列(已记录,状态列已表达 Unused/Used);actions → RowActions(Copy + More) | hover actions | 列超集(select/id/name/created/expired/redeemed_time)保留 |
| 4 | 表头 search | name/id 搜索 | 保留 | — | — |

## 功能保全清单

| # | 旧功能 | 复验 |
|---|---|---|
| 1 | 创建(name/quota/count/expired_time,1-100) | ☑(生成器承载) |
| 2 | 编辑 Drawer(name/quota/expired,条件:未用未过期) | ☑ |
| 3 | 状态切换(启/停,条件守卫) | ☑ |
| 4 | 删除 dialog + 批量删除无效码 | ☑ |
| 5 | 批量复制(name\tkey) | ☑ |
| 6 | status 过滤(Unused/Disabled/Used/Expired)+ 搜索 | ☑ |
| 7 | code 遮罩展示 | ☑ |
| 8 | 分页/多选/移动端 | ☑ |
| 9 | 创建成功后展示生成的 keys(现 dialog/toast 行为 → InlineAlert+复制) | ☑ |
