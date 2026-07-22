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
