import fs from 'node:fs/promises'
import path from 'node:path'

const LOCALES_DIR = path.resolve('src/i18n/locales')
const LOCALES = ['en', 'zh', 'fr', 'ja', 'ru', 'vi']

function stableStringify(obj) {
  return JSON.stringify(obj, null, 2) + '\n'
}

async function main() {
  const batchPath = process.argv[2]
  if (!batchPath) {
    console.error('Usage: node scripts/i18n-apply-translations.mjs <batch.json>')
    console.error('  batch.json: { "zh": { "key": "value", ... }, "fr": { ... }, ... }')
    process.exit(1)
  }

  const batch = JSON.parse(await fs.readFile(batchPath, 'utf8'))
  let total = 0

  for (const locale of LOCALES) {
    const translations = batch[locale]
    if (!translations || !Object.keys(translations).length) continue

    const filePath = path.join(LOCALES_DIR, `${locale}.json`)
    const json = JSON.parse(await fs.readFile(filePath, 'utf8'))
    let count = 0

    for (const [key, value] of Object.entries(translations)) {
      const exists = Object.prototype.hasOwnProperty.call(json.translation, key)
      if (!exists && locale !== 'en') {
        const enPath = path.join(LOCALES_DIR, 'en.json')
        const enJson = JSON.parse(await fs.readFile(enPath, 'utf8'))
        if (!Object.prototype.hasOwnProperty.call(enJson.translation, key)) {
          console.warn(`  [${locale}] missing key in en.json: ${JSON.stringify(key)}`)
          continue
        }
      }
      if (!exists || json.translation[key] !== value) {
        json.translation[key] = value
        count++
      }
    }

    if (count > 0) {
      json.translation = Object.fromEntries(
        Object.entries(json.translation).sort(([a], [b]) => a.localeCompare(b)),
      )
      await fs.writeFile(filePath, stableStringify(json), 'utf8')
    }

    console.log(`${locale}: ${count} updated`)
    total += count
  }

  console.log(`\nTotal: ${total} translations applied`)
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})