import { describe, expect, it } from 'vitest'
import { CHANNEL_STATUS, CHANNEL_STATUS_CONFIG } from './constants'

describe('CHANNEL_STATUS_CONFIG', () => {
  it('maps enabled status to grayscale success variant', () => {
    expect(CHANNEL_STATUS_CONFIG[CHANNEL_STATUS.ENABLED].variant).toBe(
      'success'
    )
  })

  it('maps disabled statuses to danger variant only (monochrome + danger-red)', () => {
    expect(
      CHANNEL_STATUS_CONFIG[CHANNEL_STATUS.MANUAL_DISABLED].variant
    ).toBe('danger')
    expect(CHANNEL_STATUS_CONFIG[CHANNEL_STATUS.AUTO_DISABLED].variant).toBe(
      'danger'
    )
  })
})
