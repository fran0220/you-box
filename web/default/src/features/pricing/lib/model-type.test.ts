/*
Copyright (C) 2023-2026 QuantumNous
*/
import { describe, expect, it } from 'vitest'
import type { PricingModel, PricingVendor } from '../types'
import {
  MODEL_TYPE_VALUES,
  deriveModelTypes,
  extractModelTypeFacets,
  extractVendors,
} from './model-type'

function model(
  partial: Partial<PricingModel> & Pick<PricingModel, 'model_name'>
): PricingModel {
  return {
    id: 1,
    quota_type: 0,
    model_ratio: 1,
    completion_ratio: 1,
    enable_groups: [],
    ...partial,
  }
}

describe('deriveModelTypes', () => {
  it('maps image-generation to Image', () => {
    expect(
      deriveModelTypes(
        model({
          model_name: 'dall-e',
          supported_endpoint_types: ['image-generation'],
        })
      )
    ).toEqual([MODEL_TYPE_VALUES.IMAGE])
  })

  it('maps embeddings to Embedding', () => {
    expect(
      deriveModelTypes(
        model({
          model_name: 'embed',
          supported_endpoint_types: ['embeddings'],
        })
      )
    ).toEqual([MODEL_TYPE_VALUES.EMBEDDING])
  })

  it('maps jina-rerank to Rerank', () => {
    expect(
      deriveModelTypes(
        model({
          model_name: 'rerank',
          supported_endpoint_types: ['jina-rerank'],
        })
      )
    ).toEqual([MODEL_TYPE_VALUES.RERANK])
  })

  it('maps openai-video to Video', () => {
    expect(
      deriveModelTypes(
        model({
          model_name: 'sora',
          supported_endpoint_types: ['openai-video'],
        })
      )
    ).toEqual([MODEL_TYPE_VALUES.VIDEO])
  })

  it('maps audio_ratio > 0 to Audio', () => {
    expect(
      deriveModelTypes(
        model({
          model_name: 'tts',
          supported_endpoint_types: ['openai'],
          audio_ratio: 0.5,
        })
      )
    ).toContain(MODEL_TYPE_VALUES.AUDIO)
    expect(
      deriveModelTypes(
        model({
          model_name: 'tts2',
          supported_endpoint_types: [],
          audio_completion_ratio: 1,
        })
      )
    ).toEqual([MODEL_TYPE_VALUES.AUDIO])
  })

  it('maps chat endpoint types to Chat', () => {
    for (const endpoint of [
      'openai',
      'openai-response',
      'anthropic',
      'gemini',
    ] as const) {
      expect(
        deriveModelTypes(
          model({
            model_name: endpoint,
            supported_endpoint_types: [endpoint],
          })
        )
      ).toEqual([MODEL_TYPE_VALUES.CHAT])
    }
  })

  it('supports multi-type membership (chat + image)', () => {
    const types = deriveModelTypes(
      model({
        model_name: 'gpt-vision',
        supported_endpoint_types: ['openai', 'image-generation'],
      })
    )
    expect(types).toContain(MODEL_TYPE_VALUES.CHAT)
    expect(types).toContain(MODEL_TYPE_VALUES.IMAGE)
    expect(types).toHaveLength(2)
  })

  it('supports multi-type membership (chat + audio via ratio)', () => {
    const types = deriveModelTypes(
      model({
        model_name: 'gpt-audio',
        supported_endpoint_types: ['anthropic'],
        audio_ratio: 2,
      })
    )
    expect(types).toContain(MODEL_TYPE_VALUES.CHAT)
    expect(types).toContain(MODEL_TYPE_VALUES.AUDIO)
    expect(types).toHaveLength(2)
  })

  it('returns empty for unknown endpoint types only', () => {
    expect(
      deriveModelTypes(
        model({
          model_name: 'unknown',
          supported_endpoint_types: ['custom-unknown'],
        })
      )
    ).toEqual([])
  })

  it('returns empty when no endpoints and no audio ratios', () => {
    expect(
      deriveModelTypes(
        model({
          model_name: 'bare',
          supported_endpoint_types: [],
        })
      )
    ).toEqual([])
  })

  it('uses deterministic display order for multiple types', () => {
    const types = deriveModelTypes(
      model({
        model_name: 'combo',
        supported_endpoint_types: [
          'openai',
          'image-generation',
          'embeddings',
          'jina-rerank',
          'openai-video',
        ],
        audio_ratio: 1,
      })
    )
    expect(types).toEqual([
      MODEL_TYPE_VALUES.IMAGE,
      MODEL_TYPE_VALUES.EMBEDDING,
      MODEL_TYPE_VALUES.RERANK,
      MODEL_TYPE_VALUES.VIDEO,
      MODEL_TYPE_VALUES.AUDIO,
      MODEL_TYPE_VALUES.CHAT,
    ])
  })
})

describe('extractVendors', () => {
  const vendors: PricingVendor[] = [
    { id: 1, name: 'OpenAI', icon: 'openai' },
    { id: 2, name: 'Anthropic', icon: 'anthropic' },
    { id: 3, name: 'Google', icon: 'google' },
  ]

  it('derives vendor options and counts from vendor_id + catalog', () => {
    const models = [
      model({ model_name: 'a', vendor_id: 1 }),
      model({ model_name: 'b', vendor_id: 1 }),
      model({ model_name: 'c', vendor_id: 2 }),
      model({ model_name: 'orphan', vendor_id: 99 }),
      model({ model_name: 'no-vendor' }),
    ]
    const options = extractVendors(models, vendors)
    expect(options).toEqual([
      { value: 'OpenAI', label: 'OpenAI', count: 2 },
      { value: 'Anthropic', label: 'Anthropic', count: 1 },
    ])
  })
})

describe('extractModelTypeFacets', () => {
  it('counts models per derived model type', () => {
    const models = [
      model({
        model_name: 'chat',
        supported_endpoint_types: ['openai'],
      }),
      model({
        model_name: 'img',
        supported_endpoint_types: ['image-generation'],
      }),
      model({
        model_name: 'both',
        supported_endpoint_types: ['gemini', 'image-generation'],
      }),
    ]
    const facets = extractModelTypeFacets(models)
    const byValue = Object.fromEntries(
      facets.map((f) => [f.value, f.count])
    )
    expect(byValue[MODEL_TYPE_VALUES.CHAT]).toBe(2)
    expect(byValue[MODEL_TYPE_VALUES.IMAGE]).toBe(2)
  })
})
