import fs from 'node:fs/promises'
import path from 'node:path'

const LOCALES_DIR = path.resolve('src/i18n/locales')
const REPORTS_DIR = path.join(LOCALES_DIR, '_reports')
const LOCALES = ['en', 'zh', 'fr', 'ja', 'ru', 'vi']

const feature = process.argv.find((a) => a.startsWith('--feature='))?.split('=')[1]
const route = process.argv.find((a) => a.startsWith('--route='))?.split('=')[1]
const output = process.argv.find((a) => a.startsWith('--output='))?.split('=')[1]

const ROUTE_TO_FEATURE = {
  '/': 'home',
  '/pricing': 'pricing',
  '/playground': 'playground',
  '/keys': 'keys',
  '/wallet': 'wallet',
  '/usage-logs': 'usage-logs',
  '/channels': 'channels',
  '/system-settings': 'system-settings',
  '/models': 'models',
  '/users': 'users',
  '/dashboard': 'dashboard',
  '/profile': 'profile',
  '/subscriptions': 'subscriptions',
  '/redemption-codes': 'redemption-codes',
  '/setup': 'setup',
  '/docs': 'api-docs',
  '/api-tools': 'api-tools',
  '/status': 'status',
  '/rankings': 'rankings',
  '/apps': 'apps',
  '/about': 'about',
  '/legal': 'legal',
}

async function loadLocales() {
  const data = {}
  for (const locale of LOCALES) {
    const raw = await fs.readFile(path.join(LOCALES_DIR, `${locale}.json`), 'utf8')
    data[locale] = JSON.parse(raw).translation
  }
  return data
}

async function main() {
  const moduleName = feature ?? (route ? ROUTE_TO_FEATURE[route] : null)
  if (!moduleName) {
    console.error('Usage: node scripts/i18n-page-audit.mjs --feature=channels [--output=path]')
    console.error('   or: node scripts/i18n-page-audit.mjs --route=/channels')
    process.exit(1)
  }

  const keysReport = JSON.parse(await fs.readFile(path.join(REPORTS_DIR, 'keys-by-feature.json'), 'utf8'))
  const moduleKeys = keysReport[moduleName]?.keys
  if (!moduleKeys) {
    console.error(`Unknown module "${moduleName}". Run: bun run i18n:keys-by-feature`)
    process.exit(1)
  }

  const locales = await loadLocales()
  const en = locales.en
  const audit = {}

  for (const key of moduleKeys) {
    const entry = { en: en[key] ?? null }
    let untranslated = []
    for (const locale of LOCALES) {
      if (locale === 'en') continue
      const val = locales[locale][key]
      entry[locale] = val ?? null
      if (val === en[key] && typeof val === 'string' && val.length > 5 && /[A-Za-z]{3,}/.test(val)) {
        untranslated.push(locale)
      }
    }
    if (untranslated.length) entry._untranslated = untranslated
    audit[key] = entry
  }

  const summary = {
    module: moduleName,
    keyCount: moduleKeys.length,
    untranslatedKeys: Object.keys(audit).filter((k) => audit[k]._untranslated?.length).length,
  }

  const result = { summary, keys: audit }
  const text = JSON.stringify(result, null, 2) + '\n'

  if (output) {
    await fs.writeFile(output, text)
    console.log(`Audit written to ${output}`)
  } else {
    console.log(text)
  }
  console.error(`\n${summary.keyCount} keys, ${summary.untranslatedKeys} with untranslated values`)
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})