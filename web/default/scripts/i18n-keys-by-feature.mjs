import fs from 'node:fs/promises'
import path from 'node:path'

const SRC_DIR = path.resolve('src')
const FEATURES_DIR = path.join(SRC_DIR, 'features')
const COMPONENTS_DIR = path.join(SRC_DIR, 'components')
const HOOKS_DIR = path.join(SRC_DIR, 'hooks')

const tCallRegex = /\bt\(\s*['"`]([^'"`\n]+?)['"`]\s*[,)]/g

async function walkDir(dir, skip = new Set()) {
  const files = []
  const entries = await fs.readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (skip.has(entry.name)) continue
      files.push(...(await walkDir(fullPath, skip)))
    } else if (/\.(tsx?|jsx?)$/.test(entry.name)) {
      files.push(fullPath)
    }
  }
  return files
}

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

async function countModule(dir, label) {
  const files = await walkDir(dir)
  const keys = new Set()
  let callCount = 0
  for (const file of files) {
    const content = await fs.readFile(file, 'utf8')
    const matches = content.match(/\bt\(/g)
    callCount += matches?.length ?? 0
    for (const k of extractKeys(content)) keys.add(k)
  }
  return { label, files: files.length, callCount, uniqueKeys: keys.size, keys }
}

async function main() {
  const featureEntries = await fs.readdir(FEATURES_DIR, { withFileTypes: true })
  const modules = []

  for (const entry of featureEntries) {
    if (!entry.isDirectory()) continue
    const result = await countModule(path.join(FEATURES_DIR, entry.name), entry.name)
    modules.push(result)
  }

  modules.push(await countModule(COMPONENTS_DIR, 'components'))
  modules.push(await countModule(HOOKS_DIR, 'hooks'))

  modules.sort((a, b) => b.callCount - a.callCount)

  console.log('Feature module t() usage (sorted by call count):\n')
  for (const m of modules) {
    console.log(`  ${m.label.padEnd(22)} calls: ${String(m.callCount).padStart(5)}  unique keys: ${m.uniqueKeys}`)
  }

  const outDir = path.resolve('src/i18n/locales/_reports')
  await fs.mkdir(outDir, { recursive: true })
  const report = Object.fromEntries(
    modules.map((m) => [m.label, { callCount: m.callCount, uniqueKeys: m.uniqueKeys, keys: [...m.keys].sort() }]),
  )
  await fs.writeFile(path.join(outDir, 'keys-by-feature.json'), JSON.stringify(report, null, 2) + '\n')
  console.log(`\nReport written to src/i18n/locales/_reports/keys-by-feature.json`)
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})