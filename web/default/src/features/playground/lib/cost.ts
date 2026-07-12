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
import type { TokenUsage } from '../types'

/**
 * Per-model pricing inputs needed to derive a USD cost from token usage.
 * Mirrors the fields the `/api/pricing` endpoint returns for each model.
 */
export interface ModelPricing {
  /** 0 = per-token billing, 1 = per-request billing. */
  quotaType: number
  modelRatio: number
  completionRatio: number
  /** USD per request, used when quotaType === 1. */
  modelPrice?: number
  /** Cached-prompt discount multiplier (applied to cached input tokens). */
  cacheRatio?: number | null
  /** Endpoint types from /api/pricing (for chat/audio modality filtering). */
  supportedEndpointTypes?: string[]
  /** Free-form admin tags (e.g. "reasoning"). */
  tags?: string
  /** Groups that may use this model. */
  enableGroups?: string[]
  audioRatio?: number | null
  audioCompletionRatio?: number | null
}

/**
 * Compute the USD cost of a single response.
 *
 * Token pricing follows the gateway's convention where input price per 1M
 * tokens = `model_ratio * 2 * group_ratio` and output = input * completion_ratio
 * (see features/pricing/lib/price.ts). Per-request models bill a flat
 * `model_price * group_ratio`.
 *
 * Returns undefined when cost cannot be determined (missing pricing/usage).
 */
export function computeCostUsd(
  usage: TokenUsage | undefined,
  pricing: ModelPricing | undefined,
  groupRatio: number
): number | undefined {
  if (!pricing) return undefined
  const ratio = Number.isFinite(groupRatio) && groupRatio > 0 ? groupRatio : 1

  // Per-request pricing.
  if (pricing.quotaType === 1) {
    if (pricing.modelPrice == null) return undefined
    return pricing.modelPrice * ratio
  }

  if (!usage) return undefined

  const inputPerM = pricing.modelRatio * 2 * ratio
  const outputPerM = inputPerM * pricing.completionRatio

  const cached = usage.prompt_tokens_details?.cached_tokens ?? 0
  const nonCached = Math.max(0, usage.prompt_tokens - cached)
  const cacheRatio =
    pricing.cacheRatio != null && Number.isFinite(pricing.cacheRatio)
      ? pricing.cacheRatio
      : 1

  const inputCost =
    (nonCached * inputPerM + cached * inputPerM * cacheRatio) / 1_000_000
  const outputCost = (usage.completion_tokens * outputPerM) / 1_000_000
  return inputCost + outputCost
}

/**
 * Format a USD cost compactly, scaling precision to the magnitude so tiny
 * playground costs stay readable (e.g. $0.00042, $0.013, $1.20).
 */
export function formatCostUsd(cost: number | undefined): string {
  if (cost == null || !Number.isFinite(cost)) return '—'
  if (cost === 0) return '$0'
  const abs = Math.abs(cost)
  let digits = 2
  if (abs < 0.0001) digits = 7
  else if (abs < 0.001) digits = 6
  else if (abs < 0.01) digits = 5
  else if (abs < 1) digits = 4
  return `$${cost.toFixed(digits)}`
}
