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
