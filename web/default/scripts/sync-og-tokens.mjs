#!/usr/bin/env node
/*
 * Mirror the OriginGame "Amp × Arcade" design tokens into this repo.
 *
 * SSOT: <origingame>/packages/tokens/tokens.json (sibling repo, not vendored —
 * only token VALUES are copied; no source crossing in either direction).
 *
 * Usage:
 *   bun run tokens:sync            # regenerate src/products/og-tokens.css
 *   bun run tokens:check           # verify the committed mirror is up to date
 *   OG_TOKENS_PATH=/path/tokens.json bun run tokens:sync
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const webDefaultRoot = path.resolve(__dirname, '..')
const repoRoot = path.resolve(webDefaultRoot, '../..')

const DEFAULT_SOURCE = path.resolve(
  repoRoot,
  '../origingame/packages/tokens/tokens.json'
)
const SOURCE = process.env.OG_TOKENS_PATH || DEFAULT_SOURCE
const TARGET = path.resolve(webDefaultRoot, 'src/products/og-tokens.css')

const checkMode = process.argv.includes('--check')

function cssVars(obj, prefix, indent) {
  return Object.entries(obj)
    .map(([key, value]) => `${indent}--${prefix}${key}: ${value};`)
    .join('\n')
}

function generate(tokens) {
  const lines = []
  lines.push('/*')
  lines.push(
    ' * AUTO-GENERATED — OriginGame Amp × Arcade token mirror. Do not edit by hand.'
  )
  lines.push(' *')
  lines.push(' * Source of truth: origingame/packages/tokens/tokens.json')
  lines.push(' * Regenerate:      bun run tokens:sync   (web/default/)')
  lines.push(' * Verify:          bun run tokens:check')
  lines.push(' *')
  lines.push(
    ' * Semantic tokens in styles/theme.css must reference these --og-* values'
  )
  lines.push(' * instead of introducing a parallel palette.')
  lines.push(' */')
  lines.push('')
  lines.push(':root {')
  lines.push(cssVars(tokens.color, 'og-', '  '))
  lines.push('')
  lines.push(cssVars(tokens.radius, 'og-radius-', '  '))
  lines.push('')
  lines.push(cssVars(tokens.motion.duration, 'og-dur-', '  '))
  lines.push(cssVars(tokens.motion.easing, 'og-ease-', '  '))
  lines.push('')
  lines.push(cssVars(tokens.font, 'og-font-', '  '))
  lines.push('}')
  lines.push('')
  lines.push('/* Warm dark remap (portal parity: only these keys change;')
  lines.push(' * accent + screen family stay constant). */')
  lines.push('html.dark {')
  lines.push(cssVars(tokens.dark.color, 'og-', '  '))
  lines.push('}')
  lines.push('')
  return lines.join('\n')
}

function main() {
  if (!fs.existsSync(SOURCE)) {
    if (checkMode) {
      console.log(
        `[og-tokens] source not found (${SOURCE}); skipping check (no sibling repo).`
      )
      process.exit(0)
    }
    console.error(`[og-tokens] tokens.json not found at ${SOURCE}`)
    console.error(
      '[og-tokens] clone origingame next to this repo or set OG_TOKENS_PATH.'
    )
    process.exit(1)
  }

  const tokens = JSON.parse(fs.readFileSync(SOURCE, 'utf8'))
  const next = generate(tokens)

  if (checkMode) {
    const current = fs.existsSync(TARGET) ? fs.readFileSync(TARGET, 'utf8') : ''
    if (current !== next) {
      console.error(
        '[og-tokens] src/products/og-tokens.css is out of sync with origingame tokens.json.'
      )
      console.error('[og-tokens] run: bun run tokens:sync')
      process.exit(1)
    }
    console.log('[og-tokens] mirror is up to date.')
    return
  }

  fs.writeFileSync(TARGET, next)
  console.log(`[og-tokens] wrote ${path.relative(webDefaultRoot, TARGET)}`)
}

main()
