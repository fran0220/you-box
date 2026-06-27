/*
Copyright (C) 2023-2026 QuantumNous
*/
import { render } from '@testing-library/react'
import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest'
import { ThemeSwitch } from './theme-switch'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

const setTheme = vi.fn()
const themeState = vi.hoisted(() => ({
  theme: 'dark' as 'dark' | 'light' | 'system',
  resolvedTheme: 'dark' as 'dark' | 'light',
}))

vi.mock('@/context/theme-provider', () => ({
  useTheme: () => ({
    theme: themeState.theme,
    resolvedTheme: themeState.resolvedTheme,
    setTheme,
  }),
}))

describe('ThemeSwitch', () => {
  beforeEach(() => {
    document.documentElement.className = 'dark'
    document.documentElement.style.setProperty('--background', '#0b0b0f')
    const meta = document.createElement('meta')
    meta.setAttribute('name', 'theme-color')
    meta.setAttribute('content', '#020817')
    document.head.appendChild(meta)
    themeState.theme = 'dark'
    themeState.resolvedTheme = 'dark'
  })

  afterEach(() => {
    document.querySelectorAll("meta[name='theme-color']").forEach((el) => {
      el.remove()
    })
    vi.clearAllMocks()
  })

  test('sets meta theme-color from --background, not legacy #020817', () => {
    render(<ThemeSwitch />)
    const meta = document.querySelector("meta[name='theme-color']")
    expect(meta?.getAttribute('content')).toBe('#0b0b0f')
    expect(meta?.getAttribute('content')).not.toBe('#020817')
  })
})
