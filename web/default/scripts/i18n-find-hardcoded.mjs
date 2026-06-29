import fs from 'node:fs/promises'
import path from 'node:path'

const SRC_DIR = path.resolve('src')
const SKIP_DIRS = new Set(['node_modules', '.git', 'locales', '_reports', '_extras', 'design-lab'])

const patterns = [
  { name: 'aria-label', regex: /aria-label=['"]([^'"]+)['"]/g },
  { name: 'sr-only', regex: /<span[^>]*className=['"][^'"]*sr-only[^'"]*['"][^>]*>([^<]+)</g },
  { name: 'title-prop', regex: /\btitle=['"]([^'"]{2,})['"]/g },
]

async function walkDir(dir) {
  const files = []
  const entries = await fs.readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue
      files.push(...(await walkDir(fullPath)))
    } else if (/\.(tsx?|jsx?)$/.test(entry.name)) {
      files.push(fullPath)
    }
  }
  return files
}

function isLikelyHardcoded(value, line) {
  if (line.includes(`t('${value}')`) || line.includes(`t("${value}")`)) return false
  if (line.includes('{t(')) return false
  if (/^[\d$%./:?#@_-]+$/.test(value)) return false
  if (value.length < 2) return false
  return /[A-Za-z]{2,}/.test(value)
}

async function main() {
  const files = await walkDir(SRC_DIR)
  const findings = []

  for (const file of files) {
    const content = await fs.readFile(file, 'utf8')
    const rel = path.relative(SRC_DIR, file)
    const lines = content.split('\n')

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      for (const { name, regex } of patterns) {
        regex.lastIndex = 0
        let match
        while ((match = regex.exec(line)) !== null) {
          const value = match[1].trim()
          if (isLikelyHardcoded(value, line)) {
            findings.push({ file: rel, line: i + 1, type: name, value })
          }
        }
      }
    }
  }

  console.log(`Found ${findings.length} likely hardcoded user-facing strings:\n`)
  for (const f of findings) {
    console.log(`  ${f.file}:${f.line} [${f.type}] ${JSON.stringify(f.value)}`)
  }

  const outPath = path.resolve('src/i18n/locales/_reports/hardcoded-strings.json')
  await fs.writeFile(outPath, JSON.stringify(findings, null, 2) + '\n')
  console.log(`\nReport: ${outPath}`)
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})