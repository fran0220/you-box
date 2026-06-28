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
import { PAYMENT_TYPES } from '../constants'
import type { TopupInfo } from '../types'
import {
  getDefaultPaymentType,
  getMinTopupAmount,
  isStripePayment,
  isWaffoPancakePayment,
  mergePresetAmounts,
} from './payment'

describe('wallet payment helpers', () => {
  it('getMinTopupAmount uses online min when enabled', () => {
    const info = {
      enable_online_topup: true,
      min_topup: 42,
    } as TopupInfo
    expect(getMinTopupAmount(info)).toBe(42)
  })

  it('getDefaultPaymentType prefers first pay method', () => {
    const info = {
      pay_methods: [{ type: 'stripe', name: 'Stripe' }],
      enable_stripe_topup: true,
    } as TopupInfo
    expect(getDefaultPaymentType(info)).toBe('stripe')
  })

  it('mergePresetAmounts attaches discount map entries', () => {
    const merged = mergePresetAmounts([100, 200], { 100: 0.9 })
    expect(merged).toEqual([
      { value: 100, discount: 0.9 },
      { value: 200, discount: 1 },
    ])
  })

  it('classifies stripe and waffo pancake payment types', () => {
    expect(isStripePayment(PAYMENT_TYPES.STRIPE)).toBe(true)
    expect(isWaffoPancakePayment(PAYMENT_TYPES.WAFFO_PANCAKE)).toBe(true)
    expect(isStripePayment(PAYMENT_TYPES.WAFFO_PANCAKE)).toBe(false)
  })
})
