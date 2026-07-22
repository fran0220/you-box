import { describe, expect, it } from 'vitest'

/** Mirrors PasswordStrength scorePassword for unit testing. */
function scorePassword(password: string): number {
  if (!password) return 0
  let score = 0
  if (password.length >= 8) score += 1
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1
  if (/\d/.test(password)) score += 1
  if (/[^a-zA-Z0-9]/.test(password)) score += 1
  return score
}

describe('password strength scoring', () => {
  it('returns 0 for empty password', () => {
    expect(scorePassword('')).toBe(0)
  })

  it('increases score as complexity grows', () => {
    expect(scorePassword('short')).toBe(0)
    expect(scorePassword('longenough')).toBe(1)
    expect(scorePassword('Longenough')).toBe(2)
    expect(scorePassword('Longenough1')).toBe(3)
    expect(scorePassword('Longenough1!')).toBe(4)
  })
})
