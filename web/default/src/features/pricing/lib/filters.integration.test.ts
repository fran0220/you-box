/*
Copyright (C) 2023-2026 QuantumNous
*/
import { describe, expect, it } from 'vitest'
import { QUOTA_TYPES, SORT_OPTIONS } from '../constants'
import { MODEL_TYPE_VALUES } from './model-type'
import {
  extractGroups,
  filterAndSortModels,
  sortModels,
  type ModelFilters,
} from './filters'
import type { EnrichedPricingModel } from '../types'

/** Mirrors mission seed ground-truth (GET /api/pricing). */
const SEED_MODELS: EnrichedPricingModel[] = [
  {
    id: 1,
    model_name: 'gpt-4o',
    vendor_id: 1,
    vendor_name: 'OpenAI',
    quota_type: 0,
    model_ratio: 1,
    completion_ratio: 1,
    enable_groups: ['default'],
    supported_endpoint_types: ['openai', 'openai-response'],
    promptPriceUsdPerM: 1,
    completionPriceUsdPerM: 1,
  },
  {
    id: 2,
    model_name: 'gpt-4o-mini',
    vendor_id: 1,
    vendor_name: 'OpenAI',
    quota_type: 0,
    model_ratio: 1,
    completion_ratio: 1,
    enable_groups: ['default'],
    supported_endpoint_types: ['openai'],
    promptPriceUsdPerM: 1,
    completionPriceUsdPerM: 1,
  },
  {
    id: 3,
    model_name: 'text-embedding-3-small',
    vendor_id: 1,
    vendor_name: 'OpenAI',
    quota_type: 0,
    model_ratio: 1,
    completion_ratio: 1,
    enable_groups: ['default'],
    supported_endpoint_types: ['embeddings'],
    promptPriceUsdPerM: 1,
    completionPriceUsdPerM: 1,
  },
  {
    id: 4,
    model_name: 'dall-e-3',
    vendor_id: 1,
    vendor_name: 'OpenAI',
    quota_type: 1,
    model_ratio: 0,
    model_price: 0.04,
    completion_ratio: 1,
    enable_groups: ['default'],
    supported_endpoint_types: ['image-generation'],
    promptPriceUsdPerM: Number.NaN,
    completionPriceUsdPerM: Number.NaN,
  },
  {
    id: 5,
    model_name: 'claude-3-5-sonnet-20241022',
    vendor_id: 2,
    vendor_name: 'Anthropic',
    quota_type: 0,
    model_ratio: 1,
    completion_ratio: 1,
    enable_groups: ['default'],
    supported_endpoint_types: ['anthropic'],
    promptPriceUsdPerM: 1,
    completionPriceUsdPerM: 1,
  },
  {
    id: 6,
    model_name: 'claude-3-5-haiku-20241022',
    vendor_id: 2,
    vendor_name: 'Anthropic',
    quota_type: 0,
    model_ratio: 1,
    completion_ratio: 1,
    enable_groups: ['default'],
    supported_endpoint_types: ['anthropic'],
    promptPriceUsdPerM: 1,
    completionPriceUsdPerM: 1,
  },
  {
    id: 7,
    model_name: 'gemini-1.5-pro',
    vendor_id: 3,
    vendor_name: 'Google',
    quota_type: 0,
    model_ratio: 1,
    completion_ratio: 1,
    enable_groups: ['default'],
    supported_endpoint_types: ['gemini'],
    promptPriceUsdPerM: 1,
    completionPriceUsdPerM: 1,
  },
  {
    id: 8,
    model_name: 'gemini-1.5-flash',
    vendor_id: 3,
    vendor_name: 'Google',
    quota_type: 0,
    model_ratio: 1,
    completion_ratio: 1,
    enable_groups: ['default'],
    supported_endpoint_types: ['gemini'],
    promptPriceUsdPerM: 1,
    completionPriceUsdPerM: 1,
  },
]

function baseFilters(overrides: Partial<ModelFilters> = {}): ModelFilters {
  return {
    search: '',
    providers: [],
    modelTypes: [],
    groups: [],
    categories: [],
    endpointTypes: [],
    quotaTypes: [],
    promptPriceRange: [0, -1],
    sortBy: 'name',
    ...overrides,
  }
}

function names(models: EnrichedPricingModel[]): string[] {
  return models.map((m) => m.model_name).sort()
}

describe('filterAndSortModels (seed catalog)', () => {
  it('OpenAI vendor only → 4 models', () => {
    const out = filterAndSortModels(
      SEED_MODELS,
      baseFilters({ providers: ['OpenAI'] })
    )
    expect(names(out)).toEqual([
      'dall-e-3',
      'gpt-4o',
      'gpt-4o-mini',
      'text-embedding-3-small',
    ])
  })

  it('Anthropic vendor only → 2 claude models', () => {
    const out = filterAndSortModels(
      SEED_MODELS,
      baseFilters({ providers: ['Anthropic'] })
    )
    expect(names(out)).toEqual([
      'claude-3-5-haiku-20241022',
      'claude-3-5-sonnet-20241022',
    ])
  })

  it('Google vendor only → 2 gemini models', () => {
    const out = filterAndSortModels(
      SEED_MODELS,
      baseFilters({ providers: ['Google'] })
    )
    expect(names(out)).toEqual(['gemini-1.5-flash', 'gemini-1.5-pro'])
  })

  it('vendor OR within facet (Anthropic + Google)', () => {
    const out = filterAndSortModels(
      SEED_MODELS,
      baseFilters({ providers: ['Anthropic', 'Google'] })
    )
    expect(out).toHaveLength(4)
    expect(names(out)).toEqual([
      'claude-3-5-haiku-20241022',
      'claude-3-5-sonnet-20241022',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
    ])
  })

  it('Embedding type only → text-embedding-3-small', () => {
    const out = filterAndSortModels(
      SEED_MODELS,
      baseFilters({ modelTypes: [MODEL_TYPE_VALUES.EMBEDDING] })
    )
    expect(names(out)).toEqual(['text-embedding-3-small'])
  })

  it('Image type only → dall-e-3', () => {
    const out = filterAndSortModels(
      SEED_MODELS,
      baseFilters({ modelTypes: [MODEL_TYPE_VALUES.IMAGE] })
    )
    expect(names(out)).toEqual(['dall-e-3'])
  })

  it('Chat type only → 6 chat models', () => {
    const out = filterAndSortModels(
      SEED_MODELS,
      baseFilters({ modelTypes: [MODEL_TYPE_VALUES.CHAT] })
    )
    expect(out).toHaveLength(6)
    expect(names(out)).toEqual([
      'claude-3-5-haiku-20241022',
      'claude-3-5-sonnet-20241022',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gpt-4o',
      'gpt-4o-mini',
    ])
  })

  it('OpenAI AND Image → dall-e-3', () => {
    const out = filterAndSortModels(
      SEED_MODELS,
      baseFilters({
        providers: ['OpenAI'],
        modelTypes: [MODEL_TYPE_VALUES.IMAGE],
      })
    )
    expect(names(out)).toEqual(['dall-e-3'])
  })

  it('OpenAI AND Chat → gpt-4o, gpt-4o-mini', () => {
    const out = filterAndSortModels(
      SEED_MODELS,
      baseFilters({
        providers: ['OpenAI'],
        modelTypes: [MODEL_TYPE_VALUES.CHAT],
      })
    )
    expect(names(out)).toEqual(['gpt-4o', 'gpt-4o-mini'])
  })

  it('Anthropic AND Embedding → empty', () => {
    const out = filterAndSortModels(
      SEED_MODELS,
      baseFilters({
        providers: ['Anthropic'],
        modelTypes: [MODEL_TYPE_VALUES.EMBEDDING],
      })
    )
    expect(out).toHaveLength(0)
  })

  it('Google AND Chat → both gemini models', () => {
    const out = filterAndSortModels(
      SEED_MODELS,
      baseFilters({
        providers: ['Google'],
        modelTypes: [MODEL_TYPE_VALUES.CHAT],
      })
    )
    expect(names(out)).toEqual(['gemini-1.5-flash', 'gemini-1.5-pro'])
  })

  it('group facet default → all models with enable_groups including default', () => {
    const out = filterAndSortModels(
      SEED_MODELS,
      baseFilters({ groups: ['default'] })
    )
    expect(out).toHaveLength(8)
  })

  it('quota type token → excludes per-request dall-e-3', () => {
    const out = filterAndSortModels(
      SEED_MODELS,
      baseFilters({ quotaTypes: [QUOTA_TYPES.TOKEN] })
    )
    expect(out).toHaveLength(7)
    expect(out.every((m) => m.quota_type === 0)).toBe(true)
    expect(names(out)).not.toContain('dall-e-3')
  })

  it('quota type per-request → only dall-e-3', () => {
    const out = filterAndSortModels(
      SEED_MODELS,
      baseFilters({ quotaTypes: [QUOTA_TYPES.REQUEST] })
    )
    expect(names(out)).toEqual(['dall-e-3'])
  })

  it('search claude → two claude models', () => {
    const out = filterAndSortModels(
      SEED_MODELS,
      baseFilters({ search: 'claude' })
    )
    expect(names(out)).toEqual([
      'claude-3-5-haiku-20241022',
      'claude-3-5-sonnet-20241022',
    ])
  })

  it('search zzzznomatch → empty', () => {
    const out = filterAndSortModels(
      SEED_MODELS,
      baseFilters({ search: 'zzzznomatch' })
    )
    expect(out).toHaveLength(0)
  })

  it('prompt price range excludes models above max', () => {
    const priced: EnrichedPricingModel[] = SEED_MODELS.map((m) => ({
      ...m,
      promptPriceUsdPerM:
        m.model_name === 'gemini-1.5-pro' || m.model_name === 'gemini-1.5-flash'
          ? 50
          : m.model_name === 'gpt-4o'
            ? 2
            : 1,
    }))
    const out = filterAndSortModels(
      priced,
      baseFilters({ promptPriceRange: [0, 5] })
    )
    expect(names(out)).not.toContain('gemini-1.5-pro')
    expect(names(out)).not.toContain('gemini-1.5-flash')
    expect(out.length).toBeGreaterThan(0)
  })

  it('extractGroups lists default from seed', () => {
    const groups = extractGroups(SEED_MODELS)
    expect(groups.some((g) => g.value === 'default' && g.count === 8)).toBe(
      true
    )
  })
})

describe('sortModels price tiering', () => {
  it('orders token-based models before per-request on price-low', () => {
    const token: EnrichedPricingModel = {
      ...SEED_MODELS[0],
      quota_type: 0,
      promptPriceUsdPerM: 100,
    }
    const request: EnrichedPricingModel = {
      ...SEED_MODELS[3],
      quota_type: 1,
      promptPriceUsdPerM: Number.NaN,
      model_price: 0.01,
    }
    const sorted = sortModels([request, token], SORT_OPTIONS.PRICE_LOW)
    expect(sorted[0].model_name).toBe(token.model_name)
    expect(sorted[1].model_name).toBe(request.model_name)
  })
})
