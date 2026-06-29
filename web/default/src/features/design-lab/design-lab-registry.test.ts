/*
Copyright (C) 2023-2026 QuantumNous
*/
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, test } from 'vitest'
import { DESIGN_LAB_GALLERY_MARKER_IDS } from './design-lab-markers'
import { DESIGN_LAB_GROUPS } from './registry'

const demosDir = dirname(fileURLToPath(import.meta.url))

const REQUIRED_GROUP_IDS = [
  'foundations',
  'ui-primitives',
  'youbox-compositions',
] as const

describe('design-lab registry', () => {
  test('includes ui-primitives and youbox-compositions acceptance sections', () => {
    const ids = DESIGN_LAB_GROUPS.map((g) => g.id)
    for (const id of REQUIRED_GROUP_IDS) {
      expect(ids).toContain(id)
    }
  })

  test('gallery defines all data-design-lab markers in demo sources', () => {
    const sources = ['ui-primitives.tsx', 'youbox-compositions.tsx'].map(
      (name) => readFileSync(join(demosDir, 'demos', name), 'utf8')
    )
    const combined = sources.join('\n')
    const found = new Set<string>()
    const re = /data-design-lab=['"]([^'"]+)['"]/g
    let match: RegExpExecArray | null
    while ((match = re.exec(combined)) !== null) {
      found.add(match[1])
    }
    for (const id of DESIGN_LAB_GALLERY_MARKER_IDS) {
      expect(
        combined.includes(`data-design-lab='${id}'`) ||
          combined.includes(`data-design-lab="${id}"`),
        `missing data-design-lab marker for id "${id}"`
      ).toBe(true)
      expect(found, `regex did not capture marker id "${id}"`).toContain(id)
    }
    expect(DESIGN_LAB_GALLERY_MARKER_IDS).toHaveLength(24)
    expect(found.size).toBe(DESIGN_LAB_GALLERY_MARKER_IDS.length)
  })
})
