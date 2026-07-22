import { describe, expect, it } from 'vitest'

/** Mirrors pricing-section onSubmit serialization for changed option keys. */
function serializeChangedOptionValue(value: unknown): string {
  if (value === undefined || value === null) {
    return ''
  }
  if (typeof value === 'boolean') {
    return String(value)
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : '0'
  }
  return String(value)
}

describe('pricing settings option persistence', () => {
  it('serializes nested general_setting keys for PUT /api/option/', () => {
    const changedFields = {
      'general_setting.quota_display_type': 'CUSTOM',
      'general_setting.custom_currency_symbol': '¥',
      'general_setting.custom_currency_exchange_rate': 7.2,
      DisplayInCurrencyEnabled: true,
      QuotaPerUnit: 500000,
    }

    const payloads = Object.entries(changedFields).map(([key, value]) => ({
      key,
      value: serializeChangedOptionValue(value),
    }))

    expect(payloads).toContainEqual({
      key: 'general_setting.quota_display_type',
      value: 'CUSTOM',
    })
    expect(payloads).toContainEqual({
      key: 'general_setting.custom_currency_exchange_rate',
      value: '7.2',
    })
    expect(payloads).toContainEqual({
      key: 'DisplayInCurrencyEnabled',
      value: 'true',
    })
  })
})
