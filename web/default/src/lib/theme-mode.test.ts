import { describe, expect, it } from 'vitest'
import { resolveThemeMode } from './theme-mode'

describe('resolveThemeMode', () => {
  it('forces light when product disables dark mode', () => {
    expect(resolveThemeMode('dark', false)).toBe('light')
    expect(resolveThemeMode('system', false)).toBe('light')
    expect(resolveThemeMode('light', false)).toBe('light')
  })

  it('honors explicit light/dark when dark mode enabled', () => {
    expect(resolveThemeMode('light', true)).toBe('light')
    expect(resolveThemeMode('dark', true)).toBe('dark')
  })
})
