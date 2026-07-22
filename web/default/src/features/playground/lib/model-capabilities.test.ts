import { describe, expect, it } from 'vitest'
import type { ModelPricing } from './cost'
import {
  isChatModel,
  pickGroupForModel,
  supportsReasoning,
} from './model-capabilities'

describe('isChatModel', () => {
  it('keeps openai chat endpoints', () => {
    const row: ModelPricing = {
      quotaType: 0,
      modelRatio: 1,
      completionRatio: 1,
      supportedEndpointTypes: ['openai'],
    }
    expect(isChatModel('gpt-4o', row)).toBe(true)
  })

  it('drops pure audio endpoints', () => {
    const row: ModelPricing = {
      quotaType: 0,
      modelRatio: 1,
      completionRatio: 1,
      supportedEndpointTypes: ['audio-tts'],
    }
    expect(isChatModel('tts-1', row)).toBe(false)
  })

  it('keeps multimodal chat+audio', () => {
    const row: ModelPricing = {
      quotaType: 0,
      modelRatio: 1,
      completionRatio: 1,
      supportedEndpointTypes: ['openai', 'audio'],
      audioRatio: 1,
    }
    expect(isChatModel('gpt-4o-audio-preview', row)).toBe(true)
  })

  it('falls back to name filter without pricing', () => {
    expect(isChatModel('gpt-4o-mini')).toBe(true)
    expect(isChatModel('whisper-1')).toBe(false)
    expect(isChatModel('eleven_turbo_v2')).toBe(false)
  })
})

describe('supportsReasoning', () => {
  it('detects by name', () => {
    expect(supportsReasoning('o3-mini')).toBe(true)
    expect(supportsReasoning('deepseek-r1')).toBe(true)
    expect(supportsReasoning('gpt-4o-mini')).toBe(false)
  })

  it('detects by tags', () => {
    expect(
      supportsReasoning('custom-model', {
        quotaType: 0,
        modelRatio: 1,
        completionRatio: 1,
        tags: 'reasoning,experimental',
      })
    ).toBe(true)
  })
})

describe('pickGroupForModel', () => {
  const groups = [
    { label: 'default', value: 'default', ratio: 1 },
    { label: 'vip', value: 'vip', ratio: 0.8 },
  ]

  it('keeps current when valid', () => {
    expect(pickGroupForModel('vip', ['vip', 'default'], groups)).toBe('vip')
  })

  it('falls back to default when current invalid', () => {
    expect(pickGroupForModel('gone', ['default', 'vip'], groups)).toBe(
      'default'
    )
  })
})
