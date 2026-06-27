/*
Copyright (C) 2023-2026 QuantumNous
*/
import { describe, expect, test } from 'vitest'
import {
  DEFAULT_THEME_CUSTOMIZATION,
  MONOCHROME_THEME_PRESET,
  resolveThemeFont,
  THEME_PRESET_VALUES,
} from './theme-customization'

describe('theme-customization', () => {
  test('only monochrome preset is selectable at runtime', () => {
    expect(THEME_PRESET_VALUES.has(MONOCHROME_THEME_PRESET)).toBe(true)
    expect(THEME_PRESET_VALUES.size).toBe(1)
    expect(THEME_PRESET_VALUES.has('anthropic' as never)).toBe(false)
    expect(THEME_PRESET_VALUES.has('ocean-breeze' as never)).toBe(false)
  })

  test('default customization uses monochrome preset', () => {
    expect(DEFAULT_THEME_CUSTOMIZATION.preset).toBe(MONOCHROME_THEME_PRESET)
  })

  test('resolveThemeFont maps default to sans on monochrome canvas', () => {
    expect(resolveThemeFont('default')).toBe('sans')
    expect(resolveThemeFont('serif')).toBe('serif')
  })
})
