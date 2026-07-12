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
