import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const batchesDir = path.resolve('scripts/batches')
const files = fs
  .readdirSync(batchesDir)
  .filter((f) => f.startsWith('module-') && f.endsWith('.json'))
  .sort()

for (const file of files) {
  console.log(`\n=== ${file} ===`)
  execSync(`node scripts/i18n-apply-translations.mjs scripts/batches/${file}`, {
    stdio: 'inherit',
  })
}

console.log('\nRunning i18n:sync...')
execSync('node scripts/sync-i18n.mjs', { stdio: 'inherit' })