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
