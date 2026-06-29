/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.
*/
import { describe, expect, it } from 'vitest'
import {
  chatLinkRequiresApiKey,
  detectChatLinkType,
  parseChatConfig,
  resolveChatUrl,
} from './chat-links'

describe('parseChatConfig', () => {
  it('maps array entries to indexed preset ids', () => {
    const presets = parseChatConfig([{ 'Web UI': 'https://example.com/chat' }])
    expect(presets).toHaveLength(1)
    expect(presets[0]?.id).toBe('0')
    expect(presets[0]?.name).toBe('Web UI')
    expect(presets[0]?.type).toBe('web')
  })

  it('returns empty for invalid config', () => {
    expect(parseChatConfig(null)).toEqual([])
    expect(parseChatConfig('not-json')).toEqual([])
  })
})

describe('detectChatLinkType', () => {
  it('classifies http as web and fluent prefix', () => {
    expect(detectChatLinkType('https://a.test')).toBe('web')
    expect(detectChatLinkType('fluent://open')).toBe('fluent')
    expect(detectChatLinkType('myapp://x')).toBe('custom-protocol')
  })
})

describe('chatLinkRequiresApiKey', () => {
  it('detects key placeholders', () => {
    expect(chatLinkRequiresApiKey('https://x?k={key}')).toBe(true)
    expect(chatLinkRequiresApiKey('https://x')).toBe(false)
  })
})

describe('resolveChatUrl', () => {
  it('substitutes address and key tokens', () => {
    const url = resolveChatUrl({
      template: 'https://host/?addr={address}&k={key}',
      apiKey: 'abc',
      serverAddress: 'http://localhost:3000',
    })
    expect(url).toContain('localhost')
    expect(url).toContain('sk-abc')
  })
})
