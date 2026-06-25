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
// ----------------------------------------------------------------------------
// Pricing Types
// ----------------------------------------------------------------------------

export type PricingVendor = {
  id: number
  name: string
  icon?: string
  description?: string
}

export type PricingModel = {
  id: number
  model_name: string
  description?: string
  icon?: string
  vendor_id?: number
  vendor_name?: string
  vendor_icon?: string
  vendor_description?: string
  quota_type: number
  model_ratio: number
  completion_ratio: number
  model_price?: number
  cache_ratio?: number | null
  create_cache_ratio?: number | null
  image_ratio?: number | null
  audio_ratio?: number | null
  audio_completion_ratio?: number | null
  enable_groups: string[]
  tags?: string
  supported_endpoint_types?: string[]
  key?: string
  group_ratio?: Record<string, number>
  /** Billing mode (e.g. "tiered_expr") used to flag dynamic pricing */
  billing_mode?: string
  /** Raw expression describing dynamic / tiered billing */
  billing_expr?: string
  /** Pricing version returned by backend, useful for cache busting */
  pricing_version?: string
  /**
   * Optional model metadata fields. These are not yet returned by the backend
   * and are populated client-side from {@link inferModelMetadata}.
   * When the backend ships these fields, the inference layer becomes a
   * fallback rather than the source of truth.
   */
  context_length?: number
  max_output_tokens?: number
  knowledge_cutoff?: string
  release_date?: string
  parameter_count?: string
  input_modalities?: Modality[]
  output_modalities?: Modality[]
  capabilities?: ModelCapability[]
}

/** Input/output modalities supported by a model. */
export type Modality = 'text' | 'image' | 'audio' | 'video' | 'file'

/** Functional capabilities a model exposes. */
export type ModelCapability =
  | 'function_calling'
  | 'streaming'
  | 'vision'
  | 'json_mode'
  | 'structured_output'
  | 'reasoning'
  | 'tools'
  | 'system_prompt'
  | 'web_search'
  | 'code_interpreter'
  | 'caching'
  | 'embeddings'

export type PricingData = {
  success: boolean
  message?: string
  data: PricingModel[]
  vendors: PricingVendor[]
  group_ratio: Record<string, number>
  usable_group: Record<string, { desc: string; ratio: number }>
  supported_endpoint: Record<string, string>
  auto_groups: string[]
}

export type TokenUnit = 'M' | 'K'
export type PriceType =
  | 'input'
  | 'output'
  | 'cache'
  | 'create_cache'
  | 'image'
  | 'audio_input'
  | 'audio_output'
export type QuotaType = 0 | 1 // 0: token-based, 1: per-request

// ----------------------------------------------------------------------------
// Derived (client-side / placeholder) shapes
// ----------------------------------------------------------------------------

/**
 * Per-model headline statistics shown in the catalog list/row.
 *
 * PLACEHOLDER DATA: the backend has no usage-metrics endpoint yet. These
 * values are generated deterministically from the model name (see
 * {@link buildModelStats} in `lib/mock-stats.ts`) so SSR/refresh is stable.
 * When the backend ships real metrics, swap the builder for the real API.
 */
export type ModelStats = {
  /** Tokens processed in the trailing 7 days (placeholder). */
  tokensPerWeek: number
  /** Week-over-week growth percentage; can be negative (placeholder). */
  weeklyGrowthPct: number
  /** Median time-to-first-token in milliseconds (placeholder). */
  latencyMs: number
  /** Median output throughput in tokens/sec; 0 for non-streaming models. */
  throughputTps?: number
}

/**
 * Derived, display-oriented metadata for a model. Distinct from the optional
 * raw fields on {@link PricingModel}: this shape is always fully populated
 * (inferred + seeded fallbacks) so the UI never has to deal with undefined.
 * Built by {@link deriveModelMetadata} in `lib/model-metadata.ts`.
 */
export type DerivedModelMetadata = {
  /** Model family / series, e.g. "GPT", "Claude", "Gemini", "Llama". */
  series: string
  /** Effective context window in tokens (explicit value or seeded fallback). */
  contextLength: number
  /** Effective max output tokens. */
  maxOutputTokens: number
  /** Accepted input modalities (never empty; defaults to ['text']). */
  inputModalities: Modality[]
  /** Produced output modalities (never empty; defaults to ['text']). */
  outputModalities: Modality[]
  /** Canonical supported-parameter names, e.g. ['temperature','tools']. */
  supportedParameters: string[]
  /** Functional capability flags. */
  capabilities: ModelCapability[]
  /** Knowledge cutoff (YYYY-MM) — explicit or seeded. */
  knowledgeCutoff: string
  /** Release date (YYYY-MM-DD) — explicit or seeded. Drives 'newest' sort. */
  releaseDate: string
  /** Parameter-count bucket, e.g. "70B" (display only). */
  parameterCount: string
}

/**
 * A {@link PricingModel} enriched with derived metadata + placeholder stats.
 * The raw `PricingModel` fields are preserved verbatim (spread), so every
 * existing consumer that reads `model.model_name`, `model.model_ratio`, etc.
 * continues to work unchanged. New consumers read `model.stats` / `model.meta`
 * (and the flattened convenience fields) for the OpenRouter-style row.
 */
export type EnrichedPricingModel = PricingModel & {
  /** Placeholder usage stats (see {@link ModelStats}). */
  stats: ModelStats
  /** Fully-resolved derived metadata (see {@link DerivedModelMetadata}). */
  meta: DerivedModelMetadata
  /**
   * Input price in USD per 1M tokens (Standard, min group ratio, no recharge).
   * Used for the prompt-price range slider + 'price-low/high' sort. NaN for
   * per-request models. Computed in `use-pricing-data.ts`.
   */
  promptPriceUsdPerM: number
  /** Output price in USD per 1M tokens (parallel to {@link promptPriceUsdPerM}). */
  completionPriceUsdPerM: number
}
