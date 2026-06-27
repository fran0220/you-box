/*
Copyright (C) 2023-2026 QuantumNous
*/
import { describe, expect, it } from 'vitest'
import { resolveAuthRedirectPath } from './auth-redirect-path'

describe('resolveAuthRedirectPath', () => {
  it('returns fallback when empty', () => {
    expect(resolveAuthRedirectPath(undefined)).toBe('/dashboard')
    expect(resolveAuthRedirectPath('')).toBe('/dashboard')
  })

  it('keeps pathname-only redirects', () => {
    expect(resolveAuthRedirectPath('/wallet')).toBe('/wallet')
  })

  it('parses full same-origin URLs to pathname', () => {
    expect(
      resolveAuthRedirectPath('http://localhost:3001/wallet?tab=1')
    ).toBe('/wallet?tab=1')
  })

  it('rejects sign-in loops', () => {
    expect(resolveAuthRedirectPath('/sign-in')).toBe('/dashboard')
  })
})
