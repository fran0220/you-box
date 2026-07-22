import { describe, expect, it } from 'vitest'
import { loginFormSchema, registerFormSchema, forgotPasswordFormSchema } from './constants'

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

describe('registerFormSchema', () => {
  it('rejects empty fields', () => {
    const result = registerFormSchema.safeParse({
      username: '',
      password: '',
      confirmPassword: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejects password shorter than 8 characters', () => {
    const result = registerFormSchema.safeParse({
      username: 'newuser',
      password: 'short',
      confirmPassword: 'short',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === 'password')).toBe(
        true
      )
    }
  })

  it('rejects password longer than 20 characters', () => {
    const result = registerFormSchema.safeParse({
      username: 'newuser',
      password: 'a'.repeat(21),
      confirmPassword: 'a'.repeat(21),
    })
    expect(result.success).toBe(false)
  })

  it('rejects mismatched confirm password', () => {
    const result = registerFormSchema.safeParse({
      username: 'newuser',
      password: 'password12',
      confirmPassword: 'password13',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(
        result.error.issues.some((i) => i.path[0] === 'confirmPassword')
      ).toBe(true)
    }
  })

  it('accepts valid registration payload', () => {
    const result = registerFormSchema.safeParse({
      username: 'newuser',
      password: 'ValidPass1!',
      confirmPassword: 'ValidPass1!',
    })
    expect(result.success).toBe(true)
  })
})

describe('forgotPasswordFormSchema', () => {
  it('rejects invalid email', () => {
    const result = forgotPasswordFormSchema.safeParse({ email: 'not-an-email' })
    expect(result.success).toBe(false)
  })

  it('accepts valid email', () => {
    const result = forgotPasswordFormSchema.safeParse({
      email: 'user@example.com',
    })
    expect(result.success).toBe(true)
  })
})
