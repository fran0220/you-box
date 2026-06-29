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
import { loginFormSchema } from './constants'

describe('loginFormSchema', () => {
  it('rejects empty username and password', () => {
    const result = loginFormSchema.safeParse({ username: '', password: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path[0])
      expect(paths).toContain('username')
      expect(paths).toContain('password')
    }
  })

  it('rejects empty password when username is set', () => {
    const result = loginFormSchema.safeParse({
      username: 'root',
      password: '',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === 'password')).toBe(
        true
      )
    }
  })

  it('rejects empty username when password is set', () => {
    const result = loginFormSchema.safeParse({
      username: '',
      password: 'secret',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === 'username')).toBe(
        true
      )
    }
  })

  it('accepts non-empty credentials', () => {
    const result = loginFormSchema.safeParse({
      username: 'root',
      password: 'rootpassword42',
    })
    expect(result.success).toBe(true)
  })
})
