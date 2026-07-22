import { describe, expect, it } from 'vitest'
import { REDEMPTION_STATUS } from '../constants'
import { isRedemptionExpired, isTimestampExpired } from './utils'

describe('isTimestampExpired', () => {
  it('returns false when timestamp is 0 (never expires)', () => {
    expect(isTimestampExpired(0)).toBe(false)
  })

  it('returns true when timestamp is in the past', () => {
    const past = Math.floor(Date.now() / 1000) - 60
    expect(isTimestampExpired(past)).toBe(true)
  })

  it('returns false when timestamp is in the future', () => {
    const future = Math.floor(Date.now() / 1000) + 3600
    expect(isTimestampExpired(future)).toBe(false)
  })
})

describe('isRedemptionExpired', () => {
  it('only treats enabled codes with past expiry as expired', () => {
    const past = Math.floor(Date.now() / 1000) - 10
    expect(isRedemptionExpired(past, REDEMPTION_STATUS.ENABLED)).toBe(true)
    expect(isRedemptionExpired(past, REDEMPTION_STATUS.DISABLED)).toBe(false)
    expect(isRedemptionExpired(past, REDEMPTION_STATUS.USED)).toBe(false)
  })

  it('returns false when expiry is 0', () => {
    expect(isRedemptionExpired(0, REDEMPTION_STATUS.ENABLED)).toBe(false)
  })
})
