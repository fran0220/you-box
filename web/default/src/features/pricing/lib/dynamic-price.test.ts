import { describe, expect, it } from 'vitest'
import type { PricingModel } from '../types'
import { getDynamicPricingSummary } from './dynamic-price'
import {
  createDefaultVisualConfig,
  evalExprLocally,
  generateExprFromVisualConfig,
  tryParseVisualConfig,
} from './tier-expr'

describe('Gemini Embedding 2 dynamic pricing', () => {
  it('exposes every multimodal input price from a v2 expression', () => {
    const model: PricingModel = {
      id: 1,
      model_name: 'gemini-embedding-2',
      quota_type: 0,
      model_ratio: 0.1,
      completion_ratio: 1,
      enable_groups: [],
      billing_mode: 'tiered_expr',
      billing_expr:
        'v2:tier("standard", p * 0.20 + img * 0.45 + doc * 0.45 + ai * 6.50 + vid * 12.00)',
    }

    const summary = getDynamicPricingSummary(model, { tokenUnit: 'M' })

    expect(summary?.entries.map((entry) => [entry.key, entry.value])).toEqual([
      ['p', 0.2],
      ['img', 0.45],
      ['ai', 6.5],
      ['doc', 0.45],
      ['vid', 12],
    ])
    expect(summary?.isSpecialExpression).toBe(false)
  })

  it('preserves v2 when a visual expression is parsed and regenerated', () => {
    const expression =
      'v2:tier("standard", p * 0.2 + c * 0 + img * 0.45 + ai * 6.5 + doc * 0.45 + vid * 12)'

    const config = tryParseVisualConfig(expression)

    expect(config?.version).toBe(2)
    expect(generateExprFromVisualConfig(config)).toBe(expression)
  })

  it('promotes new document/video visual prices to v2', () => {
    const config = createDefaultVisualConfig()
    config.tiers[0].document_input_unit_cost = 0.45
    config.tiers[0].video_input_unit_cost = 12

    expect(generateExprFromVisualConfig(config)).toMatch(/^v2:/)
  })

  it('evaluates a v2 multimodal expression locally', () => {
    const result = evalExprLocally(
      'v2:tier("standard", p * 0.2 + doc * 0.45 + vid * 12)',
      10,
      0,
      {
        cacheReadTokens: 0,
        cacheCreateTokens: 0,
        cacheCreate1hTokens: 0,
        imageTokens: 0,
        imageOutputTokens: 0,
        audioInputTokens: 0,
        documentInputTokens: 20,
        videoInputTokens: 30,
        audioOutputTokens: 0,
      }
    )

    expect(result).toEqual({ cost: 371, matchedTier: 'standard', error: null })
  })
})
