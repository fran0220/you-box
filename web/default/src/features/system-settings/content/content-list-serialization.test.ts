import { describe, expect, it } from 'vitest'

/** Mirrors system-info ServerAddress normalization on save (VAL-SET-025). */
function normalizeServerAddress(value: string): string {
  return value.replace(/\/+$/, '')
}

describe('site system-info ServerAddress normalization', () => {
  it('strips trailing slashes before persist', () => {
    expect(normalizeServerAddress('https://example.com/')).toBe(
      'https://example.com'
    )
    expect(normalizeServerAddress('https://example.com///')).toBe(
      'https://example.com'
    )
    expect(normalizeServerAddress('https://example.com')).toBe(
      'https://example.com'
    )
  })
})
