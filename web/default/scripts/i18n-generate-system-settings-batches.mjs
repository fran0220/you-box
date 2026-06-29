#!/usr/bin/env node
/**
 * Scans system-settings feature keys by sub-module and writes translation batch files
 * to scripts/batches/module-system-settings-*.json
 */
import fs from 'node:fs/promises'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const FEATURE_DIR = path.join(ROOT, 'src/features/system-settings')
const LOCALES_DIR = path.join(ROOT, 'src/i18n/locales')
const BATCHES_DIR = path.join(ROOT, 'scripts/batches')

const tCallRegex = /\bt\(\s*['"`]([^'"`\n]+?)['"`]\s*[,)]/g

function extractKeys(content) {
  const keys = new Set()
  tCallRegex.lastIndex = 0
  let match
  while ((match = tCallRegex.exec(content)) !== null) {
    const key = match[1]
    if (key.startsWith('{{') || key.includes('${')) continue
    keys.add(key)
  }
  return keys
}

async function walkDir(dir) {
  const files = []
  const entries = await fs.readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await walkDir(fullPath)))
    } else if (/\.(tsx?|jsx?)$/.test(entry.name)) {
      files.push(fullPath)
    }
  }
  return files
}

const BATCH_FILES = {
  billing: [
    'general/checkin-settings-section.tsx',
    'general/pricing-section.tsx',
    'general/quota-settings-section.tsx',
    'integrations/payment-settings-section.tsx',
    'integrations/payment-methods-visual-editor.tsx',
    'integrations/payment-method-dialog.tsx',
    'integrations/amount-discount-visual-editor.tsx',
    'integrations/amount-discount-dialog.tsx',
    'integrations/amount-options-visual-editor.tsx',
    'integrations/creem-products-visual-editor.tsx',
    'integrations/creem-product-dialog.tsx',
    'integrations/waffo-settings-section.tsx',
    'integrations/waffo-pancake-settings-section.tsx',
    'models/ratio-settings-card.tsx',
    'models/model-ratio-visual-editor.tsx',
    'models/model-ratio-table-columns.tsx',
    'models/model-ratio-form.tsx',
    'models/group-ratio-visual-editor.tsx',
    'models/group-ratio-form.tsx',
    'models/tiered-pricing-editor.tsx',
    'models/model-pricing-sheet.tsx',
    'models/model-pricing-inputs.tsx',
    'models/model-pricing-core.ts',
    'models/tool-price-settings.tsx',
    'models/upstream-ratio-sync.tsx',
    'models/upstream-ratio-sync-table.tsx',
    'models/upstream-ratio-sync-columns.tsx',
    'models/upstream-ratio-sync-helpers.ts',
    'models/group-special-usable-editor.tsx',
    'models/conflict-confirm-dialog.tsx',
    'models/channel-selector-dialog.tsx',
    'models/pricing-format.ts',
  ],
  models: [
    'models/claude-settings-card.tsx',
    'models/gemini-settings-card.tsx',
    'models/grok-settings-card.tsx',
    'models/global-settings-card.tsx',
    'models/index.tsx',
    'models/section-registry.tsx',
    'models/constants.ts',
    'models/utils.ts',
    'models/model-pricing-snapshots.ts',
    'general/channel-affinity',
    'integrations/ionet-deployment-settings-section.tsx',
  ],
  auth: ['auth'],
  content: ['content'],
  maintenance: ['maintenance'],
  site: [
    'general/system-info-section.tsx',
    'maintenance/notice-section.tsx',
    'maintenance/header-navigation-section.tsx',
    'maintenance/sidebar-modules-section.tsx',
    'maintenance/config.ts',
    'site',
  ],
  operations: [
    'general/system-behavior-section.tsx',
    'integrations/email-settings-section.tsx',
    'integrations/monitoring-settings-section.tsx',
    'integrations/worker-settings-section.tsx',
    'maintenance/log-settings-section.tsx',
    'maintenance/performance-section.tsx',
    'maintenance/update-checker-section.tsx',
    'operations',
  ],
  security: ['request-limits', 'security'],
  integrations: ['integrations/utils.ts'],
  general: ['components', 'hooks', 'utils', 'index.tsx', 'api.ts', 'types.ts'],
}

const CLAIMED_INTEGRATIONS = new Set([
  'payment-settings-section.tsx',
  'payment-methods-visual-editor.tsx',
  'payment-method-dialog.tsx',
  'amount-discount-visual-editor.tsx',
  'amount-discount-dialog.tsx',
  'amount-options-visual-editor.tsx',
  'creem-products-visual-editor.tsx',
  'creem-product-dialog.tsx',
  'waffo-settings-section.tsx',
  'waffo-pancake-settings-section.tsx',
  'ionet-deployment-settings-section.tsx',
  'email-settings-section.tsx',
  'monitoring-settings-section.tsx',
  'worker-settings-section.tsx',
  'utils.ts',
  'waffo-pancake-api.ts',
])

const CLAIMED_GENERAL = new Set([
  'checkin-settings-section.tsx',
  'pricing-section.tsx',
  'quota-settings-section.tsx',
  'system-info-section.tsx',
  'system-behavior-section.tsx',
  'channel-affinity',
  'checkin-settings-schema.test.ts',
  'pricing-settings-persist.test.ts',
])

const CLAIMED_MAINTENANCE = new Set([
  'notice-section.tsx',
  'header-navigation-section.tsx',
  'sidebar-modules-section.tsx',
  'config.ts',
  'log-settings-section.tsx',
  'performance-section.tsx',
  'update-checker-section.tsx',
])

const CLAIMED_MODELS_BILLING = new Set(
  BATCH_FILES.billing.filter((f) => f.startsWith('models/')).map((f) => path.basename(f))
)

/** Improved translations keyed by English source string */
const IMPROVED = {
  'Amount of quota to credit to user account.': {
    zh: '记入用户账户的额度数量。',
    vi: 'Số hạn mức ghi có vào tài khoản người dùng.',
  },
  'Choose how quota values are shown to users': {
    zh: '选择向用户展示额度的方式',
  },
  'Configure in your Creem dashboard': {
    zh: '在 Creem 控制台中配置',
  },
  'Creem product ID from your Creem dashboard.': {
    zh: '从 Creem 控制台获取 Creem 产品 ID。',
  },
  'Estimated quota cost': {
    zh: '估算额度费用',
  },
  'External link for users to purchase quota': {
    zh: '供用户购买额度的外部链接',
  },
  'Initial quota given to new users': {
    zh: '授予新用户的初始额度',
  },
  'New User Quota': {
    zh: '新用户额度',
  },
  'Number of tokens per unit quota': {
    zh: '每单位额度的令牌数',
  },
  'Pre-Consumed Quota': {
    zh: '预消耗额度',
  },
  'Quota Per Unit': {
    zh: '每单位额度',
  },
  'Quota consumed before charging users': {
    zh: '向用户收费前消耗的额度',
  },
  'Quota given to invited users': {
    zh: '授予被邀请用户的额度',
  },
  'Quota given to users who invite others': {
    zh: '授予邀请他人的额度',
  },
  'Show prices in currency instead of quota.': {
    zh: '以货币而非额度显示价格。',
  },
  'Tokens-only mode will show raw quota values regardless of this toggle.': {
    zh: '仅令牌模式将忽略此开关，显示原始额度值。',
    vi: 'Chế độ chỉ token sẽ hiển thị giá trị hạn mức thô bất kể công tắc này.',
  },
  'When enabled, zero-cost models also pre-consume quota before final settlement.': {
    zh: '启用后，零成本模型也会在最终结算前预扣额度。',
  },
  'Configure API documentation links for the dashboard': {
    zh: '配置仪表盘的 API 文档链接',
  },
  'Configure monitoring status page groups for the dashboard': {
    zh: '配置仪表盘的监控状态页分组',
  },
  'Create or update system announcements for the dashboard': {
    zh: '创建或更新仪表盘系统公告',
  },
  'Enable Data Dashboard': {
    zh: '启用数据仪表盘',
  },
  'Dashboards, tokens, and usage analytics.': {
    zh: '仪表盘、令牌和使用分析。',
  },
  'How to reset my quota?': {
    zh: '如何重置我的额度？',
  },
  'Visit Settings → General and adjust quota options...': {
    zh: '前往「设置 → 通用」调整额度选项…',
  },
  'Record quota usage': {
    zh: '记录额度使用量',
  },
  'User dashboard and quota controls.': {
    zh: '用户仪表盘和额度控制。',
  },
  'Quota reminder (tokens)': {
    zh: '额度提醒（令牌）',
  },
  'Send email alerts when a user falls below this quota': {
    zh: '当用户额度低于此阈值时发送邮件提醒',
  },
  'Enter API Key': {
    zh: '请输入 API 密钥',
  },
  'Client ID': {
    zh: '客户端 ID',
  },
  'Client Secret': {
    zh: '客户端密钥',
  },
  'OAuth Client Secret': {
    ru: 'Секрет клиента OAuth',
  },
  'Settings groups': {
    fr: 'Groupes de paramètres',
    vi: 'Nhóm cài đặt',
  },
  'Waffo Pancake Dashboard': {
    fr: 'Tableau de bord Waffo Pancake',
    ja: 'Waffo Pancake ダッシュボード',
    ru: 'Панель Waffo Pancake',
    vi: 'Bảng điều khiển Waffo Pancake',
  },
  End: {
    fr: 'Fin',
    ru: 'Конец',
    vi: 'Kết thúc',
  },
  Store: {
    fr: 'Boutique',
    ja: 'ストア',
    ru: 'Магазин',
    vi: 'Cửa hàng',
  },
  Add: {
    vi: 'Thêm',
  },
  Header: {
    vi: 'Tiêu đề',
  },
  Slug: {
    vi: 'Slug',
  },
  off: {
    vi: 'tắt',
  },
  'Webhook URL (Production):': {
    vi: 'URL Webhook (Production) :',
  },
  'Webhook URL (Test):': {
    vi: 'URL Webhook (Test) :',
  },
  'Default Max Tokens': {
    zh: '默认最大令牌数',
  },
  'Display Token Statistics': {
    zh: '显示令牌统计',
  },
  'Enter token counts to preview the estimated cost (excluding group multipliers).': {
    zh: '输入令牌数量以预览预估费用（不含用户组倍率）。',
  },
  'Hit criteria: If cached tokens exist in usage, it counts as a hit.': {
    zh: '命中判定：usage 中存在缓存令牌即视为命中。',
  },
  'Input tokens': {
    zh: '输入令牌',
  },
  'Output tokens': {
    zh: '输出令牌',
  },
  'Per-token': {
    zh: '按令牌',
  },
  'Priority order for automatic group assignment. New tokens rotate through this list.': {
    zh: '自动分组分配的优先级顺序。新令牌将按此列表轮换。',
  },
  'Server Token': {
    zh: '服务器令牌',
  },
  'This model has both fixed-price and token-price settings. Saving the current mode will rewrite the conflicting fields.': {
    zh: '该模型同时存在固定价格和按令牌计价设置。保存当前模式将覆盖冲突字段。',
  },
  'Token Endpoint (Optional)': {
    zh: '令牌端点（可选）',
  },
  'Token estimator': {
    zh: '令牌估算器',
  },
  'Token prices': {
    zh: '令牌价格',
  },
  'Tokens Only': {
    zh: '仅令牌',
  },
  'USD price per 1M input tokens.': {
    zh: '每 100 万输入令牌的美元价格。',
  },
  'USD price per 1M tokens.': {
    zh: '每 100 万令牌的美元价格。',
  },
  'Only the last {{value}} log files will be retained; the rest will be deleted.': {
    zh: '仅保留最近 {{value}} 个日志文件，其余将删除。',
  },
  'Requests will be forwarded to this worker. Trailing slashes are removed automatically.': {
    zh: '请求将转发至此 Worker，末尾斜杠会自动移除。',
  },
  'Well-Known URL': {
    fr: 'URL Well-Known',
    vi: 'URL Well-Known',
  },
  'Disabled lanes are omitted on save.': {
    zh: '保存时将省略已禁用的价格档位。',
  },
  'Worker URL': {
    fr: 'URL du worker',
    ru: 'URL Worker',
    vi: 'URL Worker',
  },
  'Worker Access Key': {
    zh: 'Worker 访问密钥',
  },
}

async function buildBatchKeyMap() {
  const batchKeys = {}

  async function addKeys(batch, keys) {
    if (!batchKeys[batch]) batchKeys[batch] = new Set()
    for (const k of keys) batchKeys[batch].add(k)
  }

  for (const [batch, patterns] of Object.entries(BATCH_FILES)) {
    for (const pattern of patterns) {
      const full = path.join(FEATURE_DIR, pattern)
      try {
        const stat = await fs.stat(full)
        if (stat.isDirectory()) {
          for (const file of await walkDir(full)) {
            const content = await fs.readFile(file, 'utf8')
            await addKeys(batch, extractKeys(content))
          }
        } else {
          const content = await fs.readFile(full, 'utf8')
          await addKeys(batch, extractKeys(content))
        }
      } catch {
        // missing path
      }
    }
  }

  const intDir = path.join(FEATURE_DIR, 'integrations')
  for (const file of await walkDir(intDir)) {
    const name = path.basename(file)
    if (CLAIMED_INTEGRATIONS.has(name)) continue
    const content = await fs.readFile(file, 'utf8')
    await addKeys('integrations', extractKeys(content))
  }

  const genDir = path.join(FEATURE_DIR, 'general')
  for (const file of await walkDir(genDir)) {
    const rel = path.relative(genDir, file)
    const top = rel.split(path.sep)[0]
    if (CLAIMED_GENERAL.has(top) || CLAIMED_GENERAL.has(path.basename(file))) continue
    const content = await fs.readFile(file, 'utf8')
    await addKeys('general', extractKeys(content))
  }

  const modelsDir = path.join(FEATURE_DIR, 'models')
  for (const file of await walkDir(modelsDir)) {
    const name = path.basename(file)
    if (CLAIMED_MODELS_BILLING.has(name)) continue
    const content = await fs.readFile(file, 'utf8')
    await addKeys('models', extractKeys(content))
  }

  const maintDir = path.join(FEATURE_DIR, 'maintenance')
  for (const file of await walkDir(maintDir)) {
    const name = path.basename(file)
    if (CLAIMED_MAINTENANCE.has(name)) continue
    const content = await fs.readFile(file, 'utf8')
    await addKeys('maintenance', extractKeys(content))
  }

  const rootEntries = await fs.readdir(FEATURE_DIR, { withFileTypes: true })
  for (const entry of rootEntries) {
    if (!entry.isFile() || !/\.(tsx?|jsx?)$/.test(entry.name)) continue
    const content = await fs.readFile(path.join(FEATURE_DIR, entry.name), 'utf8')
    await addKeys('general', extractKeys(content))
  }

  return Object.fromEntries(
    Object.entries(batchKeys).map(([batch, keys]) => [batch, [...keys].sort()])
  )
}

function buildBatchPayload(keys) {
  const payload = { zh: {}, fr: {}, ja: {}, ru: {}, vi: {} }
  for (const key of keys) {
    const improved = IMPROVED[key]
    if (!improved) continue
    for (const [locale, value] of Object.entries(improved)) {
      payload[locale][key] = value
    }
  }
  for (const locale of Object.keys(payload)) {
    if (!Object.keys(payload[locale]).length) delete payload[locale]
  }
  return payload
}

async function main() {
  const batchKeyMap = await buildBatchKeyMap()
  await fs.mkdir(BATCHES_DIR, { recursive: true })

  const batchOrder = [
    'billing',
    'models',
    'auth',
    'content',
    'maintenance',
    'site',
    'operations',
    'security',
    'integrations',
    'general',
  ]

  const summary = []

  for (const batch of batchOrder) {
    const keys = batchKeyMap[batch] ?? []
    const payload = buildBatchPayload(keys)
    const localeCounts = Object.fromEntries(
      ['zh', 'fr', 'ja', 'ru', 'vi'].map((l) => [l, Object.keys(payload[l] ?? {}).length])
    )
    const totalUpdates = Object.values(localeCounts).reduce((a, b) => a + b, 0)

    if (totalUpdates === 0) continue

    const filename = `module-system-settings-${batch}.json`
    const filePath = path.join(BATCHES_DIR, filename)
    await fs.writeFile(filePath, JSON.stringify(payload, null, 2) + '\n', 'utf8')

    summary.push({
      file: filename,
      keysInModule: keys.length,
      fixKeys: new Set(
        ['zh', 'fr', 'ja', 'ru', 'vi'].flatMap((l) => Object.keys(payload[l] ?? {}))
      ).size,
      localeCounts,
      totalUpdates,
    })
  }

  console.log('System-settings translation batches:\n')
  let grandTotal = 0
  const grandByLocale = { zh: 0, fr: 0, ja: 0, ru: 0, vi: 0 }
  for (const row of summary) {
    console.log(`  ${row.file}`)
    console.log(`    module keys: ${row.keysInModule}, fixes: ${row.fixKeys}`)
    console.log(
      `    updates: zh=${row.localeCounts.zh} fr=${row.localeCounts.fr} ja=${row.localeCounts.ja} ru=${row.localeCounts.ru} vi=${row.localeCounts.vi} (total ${row.totalUpdates})`
    )
    grandTotal += row.totalUpdates
    for (const l of Object.keys(grandByLocale)) grandByLocale[l] += row.localeCounts[l]
  }
  console.log(`\nGrand total: ${grandTotal} translation updates`)
  console.log('Per locale:', grandByLocale)
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})