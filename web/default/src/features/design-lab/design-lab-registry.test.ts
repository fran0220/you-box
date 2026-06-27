/*
Copyright (C) 2023-2026 QuantumNous
*/
import { describe, expect, test } from 'vitest'
import { DESIGN_LAB_GROUPS } from './registry'

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
})
