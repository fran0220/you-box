/*
Copyright (C) 2023-2026 QuantumNous
*/
import { describe, expect, it } from 'vitest'
import { CHANNEL_STATUS } from '../constants'
import {
  channelStatusShowsDangerBadge,
  getChannelStatusBadge,
} from './channel-utils'

describe('channel status danger badge mapping', () => {
  it('uses danger variant for manual and auto disabled', () => {
    expect(getChannelStatusBadge(CHANNEL_STATUS.MANUAL_DISABLED).variant).toBe(
      'danger'
    )
    expect(getChannelStatusBadge(CHANNEL_STATUS.AUTO_DISABLED).variant).toBe(
      'danger'
    )
    expect(channelStatusShowsDangerBadge(CHANNEL_STATUS.MANUAL_DISABLED)).toBe(
      true
    )
    expect(channelStatusShowsDangerBadge(CHANNEL_STATUS.AUTO_DISABLED)).toBe(
      true
    )
  })

  it('does not show danger badge for enabled', () => {
    expect(getChannelStatusBadge(CHANNEL_STATUS.ENABLED).variant).toBe('success')
    expect(channelStatusShowsDangerBadge(CHANNEL_STATUS.ENABLED)).toBe(false)
  })
})
