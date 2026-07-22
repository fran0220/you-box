import { describe, expect, it } from 'vitest'
import { getHttpStatus } from './http-status'

describe('getHttpStatus', () => {
  it('returns undefined for non-object errors', () => {
    expect(getHttpStatus(null)).toBeUndefined()
    expect(getHttpStatus('err')).toBeUndefined()
  })

  it('extracts numeric status from axios-like error shape', () => {
    expect(getHttpStatus({ response: { status: 429 } })).toBe(429)
    expect(getHttpStatus({ response: { status: 502 } })).toBe(502)
  })

  it('returns undefined when response or status is missing', () => {
    expect(getHttpStatus({})).toBeUndefined()
    expect(getHttpStatus({ response: {} })).toBeUndefined()
    expect(getHttpStatus({ response: { status: '500' } })).toBeUndefined()
  })
})
