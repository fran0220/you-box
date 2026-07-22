import { EXCLUDED_GROUPS, QUOTA_TYPE_VALUES } from '../constants'
import type { PricingModel } from '../types'

// ----------------------------------------------------------------------------
// Model Helper Utilities
// ----------------------------------------------------------------------------

/**
 * Get available groups for a model
 */
export function getAvailableGroups(
  model: PricingModel,
  usableGroup: Record<string, { desc: string; ratio: number }>
): string[] {
  const modelEnableGroups = Array.isArray(model.enable_groups)
    ? model.enable_groups
    : []

  return Object.keys(usableGroup)
    .filter((g) => !EXCLUDED_GROUPS.includes(g))
    .filter((g) => modelEnableGroups.includes(g))
}

/**
 * Replace model placeholder in endpoint path
 */
export function replaceModelInPath(path: string, modelName: string): string {
  return path.replace(/\{model\}/g, modelName)
}

/**
 * Check if model is token-based pricing
 */
export function isTokenBasedModel(model: PricingModel): boolean {
  return model.quota_type === QUOTA_TYPE_VALUES.TOKEN
}

/** Lowest group ratio across a model's enabled groups (Standard pricing). */
function minGroupRatio(model: PricingModel): number {
  const groups = Array.isArray(model.enable_groups) ? model.enable_groups : []
  const ratios = model.group_ratio || {}
  let min = Number.POSITIVE_INFINITY
  for (const g of groups) {
    const r = ratios[g]
    if (typeof r === 'number' && r < min) min = r
  }
  return Number.isFinite(min) ? min : 1
}

/**
 * Input (prompt) price in USD per 1M tokens for the Standard rate (cheapest
 * group, no recharge). Mirrors `formatPrice(model,'input','M')` numerically:
 * `model_ratio * 2 * minGroupRatio`. Returns NaN for per-request models so the
 * prompt-price slider/sort can skip them. Feeds the range filter + price sort.
 */
export function getInputPriceUsdPerM(model: PricingModel): number {
  if (model.quota_type !== QUOTA_TYPE_VALUES.TOKEN) return NaN
  return model.model_ratio * 2 * minGroupRatio(model)
}

/**
 * Output (completion) price in USD per 1M tokens for the Standard rate.
 * `model_ratio * 2 * completion_ratio * minGroupRatio`. NaN for per-request.
 */
export function getOutputPriceUsdPerM(model: PricingModel): number {
  if (model.quota_type !== QUOTA_TYPE_VALUES.TOKEN) return NaN
  return model.model_ratio * 2 * model.completion_ratio * minGroupRatio(model)
}

/** True when the model's Standard input price is 0 (free prompt tokens). */
export function isFreeModel(model: PricingModel): boolean {
  const p = getInputPriceUsdPerM(model)
  return Number.isFinite(p) && p <= 0
}
