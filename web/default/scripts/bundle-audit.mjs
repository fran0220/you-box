/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'

const DIST_JS_DIR = path.resolve('dist/static/js')
const MAX_ASYNC_KB = Number(process.env.BUNDLE_AUDIT_MAX_ASYNC_KB ?? 2048)
const TOP_CHUNK_COUNT = Number(process.env.BUNDLE_AUDIT_TOP_CHUNKS ?? 12)

const LOBE_BARREL_MARKERS = [
  'AgentVoice',
  'Apertis',
  'LlamaIndex',
  'NotebookLM',
  'OpenWebUI',
  'Windsurf',
]

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)))
      continue
    }
    if (entry.isFile() && entry.name.endsWith('.js')) files.push(fullPath)
  }

  return files
}

function gzipSize(buffer) {
  return zlib.gzipSync(buffer).byteLength
}

function formatKb(bytes) {
  return `${(bytes / 1024).toFixed(1)} kB`
}

async function main() {
  const files = await walk(DIST_JS_DIR)
  const chunks = []
  const violations = []

  for (const file of files) {
    const buffer = await fs.readFile(file)
    const rel = path.relative(path.resolve('dist'), file)
    const isAsync = rel.includes(`${path.sep}async${path.sep}`)
    const text = buffer.toString('utf8')

    chunks.push({
      rel,
      bytes: buffer.byteLength,
      gzipBytes: gzipSize(buffer),
      isAsync,
    })

    if (isAsync && buffer.byteLength > MAX_ASYNC_KB * 1024) {
      violations.push(
        `${rel} is ${formatKb(buffer.byteLength)}; max async budget is ${MAX_ASYNC_KB} kB`
      )
    }

    const lobeMarkerCount = LOBE_BARREL_MARKERS.filter((marker) =>
      text.includes(marker)
    ).length
    if (lobeMarkerCount >= 3) {
      violations.push(
        `${rel} contains ${lobeMarkerCount} @lobehub/icons barrel markers; use curated per-icon imports`
      )
    }
  }

  chunks.sort((a, b) => b.bytes - a.bytes)

  console.log('Largest JS chunks:')
  for (const chunk of chunks.slice(0, TOP_CHUNK_COUNT)) {
    console.log(
      `  ${chunk.rel.padEnd(56)} ${formatKb(chunk.bytes).padStart(10)} gzip ${formatKb(chunk.gzipBytes).padStart(10)}`
    )
  }

  if (violations.length > 0) {
    console.error('\nBundle audit failed:')
    for (const violation of violations) console.error(`  - ${violation}`)
    process.exitCode = 1
    return
  }

  console.log('\nBundle audit passed.')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
