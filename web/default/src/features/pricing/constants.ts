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
import { type TFunction } from 'i18next'
import type { TokenUnit } from './types'

// ----------------------------------------------------------------------------
// Pricing Constants
// ----------------------------------------------------------------------------

/** Sort options for pricing models (real fields only). */
export const SORT_OPTIONS = {
  NAME: 'name',
  PRICE_LOW: 'price-low',
  PRICE_HIGH: 'price-high',
} as const

export type SortOption = (typeof SORT_OPTIONS)[keyof typeof SORT_OPTIONS]

export const DEFAULT_SORT: SortOption = SORT_OPTIONS.NAME

export function getSortLabels(t: TFunction): Record<SortOption, string> {
  return {
    [SORT_OPTIONS.NAME]: t('Name'),
    [SORT_OPTIONS.PRICE_LOW]: t('Price: Low to High'),
    [SORT_OPTIONS.PRICE_HIGH]: t('Price: High to Low'),
  }
}

export const SORT_OPTION_ORDER: SortOption[] = [
  SORT_OPTIONS.NAME,
  SORT_OPTIONS.PRICE_LOW,
  SORT_OPTIONS.PRICE_HIGH,
]

/** Input-modality filter options (what a model can accept). */
export const MODALITY_FILTERS = {
  ALL: 'all',
  TEXT: 'text',
  IMAGE: 'image',
  AUDIO: 'audio',
  VIDEO: 'video',
  FILE: 'file',
} as const

export type ModalityFilterOption =
  (typeof MODALITY_FILTERS)[keyof typeof MODALITY_FILTERS]

export function getModalityLabels(
  t: TFunction
): Record<ModalityFilterOption, string> {
  return {
    [MODALITY_FILTERS.ALL]: t('All Modalities'),
    [MODALITY_FILTERS.TEXT]: t('Text'),
    [MODALITY_FILTERS.IMAGE]: t('Image'),
    [MODALITY_FILTERS.AUDIO]: t('Audio'),
    [MODALITY_FILTERS.VIDEO]: t('Video'),
    [MODALITY_FILTERS.FILE]: t('File'),
  }
}

/** Filter values */
export const FILTER_ALL = 'all'

/** Quota type options */
export const QUOTA_TYPES = {
  ALL: 'all',
  TOKEN: 'token',
  REQUEST: 'request',
} as const

export type QuotaTypeOption = (typeof QUOTA_TYPES)[keyof typeof QUOTA_TYPES]

/** Quota type labels */
export function getQuotaTypeLabels(
  t: TFunction
): Record<QuotaTypeOption, string> {
  return {
    [QUOTA_TYPES.ALL]: t('All Models'),
    [QUOTA_TYPES.TOKEN]: t('Token-based'),
    [QUOTA_TYPES.REQUEST]: t('Per Request'),
  }
}

/** Endpoint type options */
export const ENDPOINT_TYPES = {
  ALL: 'all',
  OPENAI: 'openai',
  OPENAI_RESPONSE: 'openai-response',
  ANTHROPIC: 'anthropic',
  GEMINI: 'gemini',
  JINA_RERANK: 'jina-rerank',
  IMAGE_GENERATION: 'image-generation',
  EMBEDDINGS: 'embeddings',
  OPENAI_VIDEO: 'openai-video',
} as const

export type EndpointTypeOption =
  (typeof ENDPOINT_TYPES)[keyof typeof ENDPOINT_TYPES]

/** Endpoint type labels */
export function getEndpointTypeLabels(
  t: TFunction
): Record<EndpointTypeOption, string> {
  return {
    [ENDPOINT_TYPES.ALL]: t('All Types'),
    [ENDPOINT_TYPES.OPENAI]: t('Chat'),
    [ENDPOINT_TYPES.OPENAI_RESPONSE]: t('Response'),
    [ENDPOINT_TYPES.ANTHROPIC]: t('Anthropic'),
    [ENDPOINT_TYPES.GEMINI]: t('Gemini'),
    [ENDPOINT_TYPES.JINA_RERANK]: t('Rerank'),
    [ENDPOINT_TYPES.IMAGE_GENERATION]: t('Image'),
    [ENDPOINT_TYPES.EMBEDDINGS]: t('Embeddings'),
    [ENDPOINT_TYPES.OPENAI_VIDEO]: t('Video'),
  }
}

/**
 * Filter section / facet keys. These double as the URL param names for the
 * multi-select array facets (see `hooks/use-filters.ts`). OpenRouter-style
 * ordering: Providers → modalities → series → categories → params → pricing →
 * endpoint → groups.
 */
export const FILTER_SECTIONS = {
  PROVIDER: 'providers',
  MODEL_TYPE: 'modelTypes',
  CATEGORY: 'categories',
  PRICING_TYPE: 'quotaTypes',
  ENDPOINT_TYPE: 'endpointTypes',
  GROUP: 'groups',
} as const

export type FilterSection =
  (typeof FILTER_SECTIONS)[keyof typeof FILTER_SECTIONS]

export const FILTER_SECTION_ORDER: FilterSection[] = [
  FILTER_SECTIONS.MODEL_TYPE,
  FILTER_SECTIONS.PROVIDER,
  FILTER_SECTIONS.CATEGORY,
  FILTER_SECTIONS.PRICING_TYPE,
  FILTER_SECTIONS.ENDPOINT_TYPE,
  FILTER_SECTIONS.GROUP,
]

export function getModelTypeLabels(t: TFunction): Record<string, string> {
  return {
    Chat: t('Chat'),
    Embedding: t('Embedding'),
    Image: t('Image'),
    Rerank: t('Rerank'),
    Video: t('Video'),
    Audio: t('Audio'),
  }
}

/** Maximum number of tags to display in model row */
export const MAX_TAGS_DISPLAY = 5

/** Maximum number of filter items to display before showing "More..." */
export const MAX_FILTER_ITEMS = 5

/** Sidebar width */
export const SIDEBAR_WIDTH = 'w-64'

/** Excluded groups */
export const EXCLUDED_GROUPS = ['', 'auto']

/** Quota type values */
export const QUOTA_TYPE_VALUES = {
  TOKEN: 0,
  REQUEST: 1,
} as const

/** Token unit divisors */
export const TOKEN_UNIT_DIVISORS = {
  M: 1,
  K: 1000,
} as const

/** Default token unit for pricing display */
export const DEFAULT_TOKEN_UNIT: TokenUnit = 'M'

/**
 * @deprecated Pagination was removed in favour of a continuous/virtualized
 * list. Kept exported only so any lingering importer still compiles; do not
 * use in new code.
 */
export const DEFAULT_PRICING_PAGE_SIZE = 20

/** Maximum number of models that can be compared side by side. */
export const MAX_COMPARE_MODELS = 5

// ----------------------------------------------------------------------------
// Range-slider bounds
// ----------------------------------------------------------------------------

/** Upper bound for the prompt-price slider, in USD per 1M input tokens. */
export const PROMPT_PRICE_MAX_USD_PER_M = 100

/** Number of discrete steps on the prompt-price slider (FREE → max). */
export const PROMPT_PRICE_STEP = 0.5

/**
 * Compute the max prompt price (USD/M, rounded up) across the given values so
 * the slider's upper bound can adapt to the catalog. Falls back to
 * {@link PROMPT_PRICE_MAX_USD_PER_M} when there is no finite data.
 */
export function computePromptPriceCeiling(pricesUsdPerM: number[]): number {
  let max = 0
  for (const p of pricesUsdPerM) {
    if (Number.isFinite(p) && p > max) max = p
  }
  if (max <= 0) return PROMPT_PRICE_MAX_USD_PER_M
  return Math.min(PROMPT_PRICE_MAX_USD_PER_M, Math.ceil(max))
}
