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
import {
  SORT_OPTIONS,
  FILTER_ALL,
  QUOTA_TYPES,
  QUOTA_TYPE_VALUES,
  ENDPOINT_TYPES,
  MODALITY_FILTERS,
  CONTEXT_LENGTH_MIN,
} from '../constants'
import type { EnrichedPricingModel, Modality, PricingModel } from '../types'

// ----------------------------------------------------------------------------
// Filter Utilities
// ----------------------------------------------------------------------------

/**
 * Filter models by search query
 */
export function filterBySearch(
  models: PricingModel[],
  query: string
): PricingModel[] {
  if (!query) return models

  const lowerQuery = query.toLowerCase()
  return models.filter(
    (m) =>
      m.model_name?.toLowerCase().includes(lowerQuery) ||
      m.description?.toLowerCase().includes(lowerQuery) ||
      m.tags?.toLowerCase().includes(lowerQuery) ||
      m.vendor_name?.toLowerCase().includes(lowerQuery)
  )
}

/**
 * Filter models by vendor
 */
export function filterByVendor(
  models: PricingModel[],
  vendor: string
): PricingModel[] {
  if (vendor === FILTER_ALL) return models
  return models.filter((m) => m.vendor_name === vendor)
}

/**
 * Filter models by group
 */
export function filterByGroup(
  models: PricingModel[],
  group: string
): PricingModel[] {
  if (group === FILTER_ALL) return models
  return models.filter((m) => m.enable_groups?.includes(group))
}

/**
 * Filter models by quota type
 */
export function filterByQuotaType(
  models: PricingModel[],
  quotaType: string
): PricingModel[] {
  if (quotaType === QUOTA_TYPES.ALL) return models
  const targetType =
    quotaType === QUOTA_TYPES.TOKEN
      ? QUOTA_TYPE_VALUES.TOKEN
      : QUOTA_TYPE_VALUES.REQUEST
  return models.filter((m) => m.quota_type === targetType)
}

/**
 * Filter models by endpoint type
 */
export function filterByEndpointType(
  models: PricingModel[],
  endpointType: string
): PricingModel[] {
  if (endpointType === ENDPOINT_TYPES.ALL) return models
  return models.filter((m) =>
    m.supported_endpoint_types?.includes(endpointType)
  )
}

/**
 * Filter models by accepted input modality. Models with no declared input
 * modalities are treated as text-only.
 */
export function filterByInputModality(
  models: PricingModel[],
  modality: string
): PricingModel[] {
  if (modality === MODALITY_FILTERS.ALL) return models
  return models.filter((m) => {
    const modalities: Modality[] = m.input_modalities?.length
      ? m.input_modalities
      : ['text']
    return modalities.includes(modality as Modality)
  })
}

/**
 * Get model price for sorting (raw ratio / per-request price). Prefer the
 * USD/M `promptPriceUsdPerM` on enriched models; falls back to the raw ratio.
 */
function getModelSortPrice(model: EnrichedPricingModel): number {
  const usd = model.promptPriceUsdPerM
  if (Number.isFinite(usd)) return usd
  return model.quota_type === 0 ? model.model_ratio : model.model_price || 0
}

/**
 * Sort enriched models by the given sort key. Default is `top-weekly`
 * (descending tokens/week). Falls back to name ordering as a tiebreaker so the
 * order is fully deterministic.
 */
export function sortModels(
  models: EnrichedPricingModel[],
  sortBy: string
): EnrichedPricingModel[] {
  const sorted = [...models]
  const byName = (a: EnrichedPricingModel, b: EnrichedPricingModel) =>
    (a.model_name || '').localeCompare(b.model_name || '')

  switch (sortBy) {
    case SORT_OPTIONS.NAME:
      sorted.sort(byName)
      break
    case SORT_OPTIONS.PRICE_LOW:
      sorted.sort(
        (a, b) => getModelSortPrice(a) - getModelSortPrice(b) || byName(a, b)
      )
      break
    case SORT_OPTIONS.PRICE_HIGH:
      sorted.sort(
        (a, b) => getModelSortPrice(b) - getModelSortPrice(a) || byName(a, b)
      )
      break
    case SORT_OPTIONS.CONTEXT_HIGH:
      sorted.sort(
        (a, b) => b.meta.contextLength - a.meta.contextLength || byName(a, b)
      )
      break
    case SORT_OPTIONS.NEWEST:
      sorted.sort(
        (a, b) =>
          new Date(b.meta.releaseDate || 0).getTime() -
            new Date(a.meta.releaseDate || 0).getTime() || byName(a, b)
      )
      break
    case SORT_OPTIONS.TOP_WEEKLY:
    default:
      sorted.sort(
        (a, b) => b.stats.tokensPerWeek - a.stats.tokensPerWeek || byName(a, b)
      )
      break
  }

  return sorted
}

/** OR-within-facet membership test. Empty selection => facet inactive (pass). */
function matchesAny(selected: string[], values: string[]): boolean {
  if (selected.length === 0) return true
  const set = new Set(values)
  return selected.some((s) => set.has(s))
}

/**
 * Multi-select filter state. Every array facet uses OR within the facet and AND
 * across facets. Empty array / unset range == facet disabled.
 */
export type ModelFilters = {
  search: string
  /** Vendor names (model owners). */
  providers: string[]
  /** Usable group names. */
  groups: string[]
  /** Lowercased model tags. */
  categories: string[]
  /** Accepted input modalities. */
  inputModalities: Modality[]
  /** Produced output modalities. */
  outputModalities: Modality[]
  /** Series / family labels (e.g. "GPT"). */
  series: string[]
  /** Canonical supported-parameter names. */
  supportedParameters: string[]
  /** Endpoint type values (e.g. "openai", "anthropic"). */
  endpointTypes: string[]
  /** Quota-type values ("token" | "request"). */
  quotaTypes: string[]
  /** [minTokens, maxTokens]; min<=0 means "no lower bound", max<=0 "no upper". */
  contextRange: [number, number]
  /** [minUsdPerM, maxUsdPerM]; max<0 means "no upper bound". */
  promptPriceRange: [number, number]
  sortBy: string
}

function inContextRange(
  model: EnrichedPricingModel,
  [min, max]: [number, number]
): boolean {
  const ctx = model.meta.contextLength
  if (min > CONTEXT_LENGTH_MIN && ctx < min) return false
  if (max > 0 && ctx > max) return false
  return true
}

function inPromptPriceRange(
  model: EnrichedPricingModel,
  [min, max]: [number, number]
): boolean {
  // Per-request models have no per-M prompt price; only filter them out when an
  // explicit upper bound below the ceiling is set.
  const price = model.promptPriceUsdPerM
  if (!Number.isFinite(price)) return !(max >= 0 && min > 0)
  if (min > 0 && price < min) return false
  if (max >= 0 && price > max) return false
  return true
}

/**
 * Apply all multi-select facets, ranges, search and sort to enriched models.
 * OR within each facet, AND across facets.
 */
export function filterAndSortModels(
  models: EnrichedPricingModel[],
  filters: ModelFilters
): EnrichedPricingModel[] {
  const q = filters.search.trim().toLowerCase()

  const result = models.filter((m) => {
    // Search across name, description, tags, vendor and series.
    if (q) {
      const hay =
        `${m.model_name ?? ''} ${m.description ?? ''} ${m.tags ?? ''} ` +
        `${m.vendor_name ?? ''} ${m.meta.series ?? ''}`
      if (!hay.toLowerCase().includes(q)) return false
    }

    if (!matchesAny(filters.providers, m.vendor_name ? [m.vendor_name] : []))
      return false
    if (!matchesAny(filters.groups, m.enable_groups ?? [])) return false
    if (
      !matchesAny(
        filters.categories,
        parseTags(m.tags).map((t) => t.toLowerCase())
      )
    )
      return false
    if (!matchesAny(filters.inputModalities, m.meta.inputModalities))
      return false
    if (!matchesAny(filters.outputModalities, m.meta.outputModalities))
      return false
    if (!matchesAny(filters.series, m.meta.series ? [m.meta.series] : []))
      return false
    if (!matchesAny(filters.supportedParameters, m.meta.supportedParameters))
      return false
    if (
      !matchesAny(filters.endpointTypes, m.supported_endpoint_types ?? [])
    )
      return false
    if (
      !matchesAny(
        filters.quotaTypes,
        m.quota_type === QUOTA_TYPE_VALUES.TOKEN
          ? [QUOTA_TYPES.TOKEN]
          : [QUOTA_TYPES.REQUEST]
      )
    )
      return false

    if (!inContextRange(m, filters.contextRange)) return false
    if (!inPromptPriceRange(m, filters.promptPriceRange)) return false

    return true
  })

  return sortModels(result, filters.sortBy)
}

/**
 * Parse tags from comma-separated string
 */
export function parseTags(tagsString?: string): string[] {
  if (!tagsString) return []
  return tagsString
    .split(/[,;|\s]+/)
    .map((t) => t.trim())
    .filter(Boolean)
}

/**
 * Extract all unique tags from models
 */
export function extractAllTags(models: PricingModel[]): string[] {
  const tagSet = new Set<string>()

  models.forEach((model) => {
    if (model.tags) {
      const tags = parseTags(model.tags)
      tags.forEach((tag) => {
        tagSet.add(tag.toLowerCase())
      })
    }
  })

  return Array.from(tagSet).sort((a, b) => a.localeCompare(b))
}

/**
 * Filter models by tag
 */
export function filterByTag(
  models: PricingModel[],
  tag: string
): PricingModel[] {
  if (tag === FILTER_ALL) return models

  const tagLower = tag.toLowerCase()
  return models.filter((m) => {
    if (!m.tags) return false
    const modelTags = parseTags(m.tags).map((t) => t.toLowerCase())
    return modelTags.includes(tagLower)
  })
}

// ----------------------------------------------------------------------------
// Facet option extractors (for sidebar option lists)
// ----------------------------------------------------------------------------

/** A selectable facet option with the live count of matching models. */
export type FacetOption = {
  value: string
  /** Display label (defaults to value at the call site if absent). */
  label: string
  count: number
}

/** Unique vendor / provider names, sorted, with counts. */
export function extractProviders(
  models: EnrichedPricingModel[]
): FacetOption[] {
  const counts = new Map<string, number>()
  for (const m of models) {
    const v = m.vendor_name
    if (v) counts.set(v, (counts.get(v) ?? 0) + 1)
  }
  return Array.from(counts.entries())
    .map(([value, count]) => ({ value, label: value, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
}

/** Unique series / family labels, sorted by count then name. */
export function extractSeries(models: EnrichedPricingModel[]): FacetOption[] {
  const counts = new Map<string, number>()
  for (const m of models) {
    const s = m.meta.series
    if (s) counts.set(s, (counts.get(s) ?? 0) + 1)
  }
  return Array.from(counts.entries())
    .map(([value, count]) => ({ value, label: value, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
}

/** Unique supported-parameter names across all models, sorted by count. */
export function extractSupportedParameters(
  models: EnrichedPricingModel[]
): FacetOption[] {
  const counts = new Map<string, number>()
  for (const m of models) {
    for (const p of m.meta.supportedParameters) {
      counts.set(p, (counts.get(p) ?? 0) + 1)
    }
  }
  return Array.from(counts.entries())
    .map(([value, count]) => ({ value, label: value, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
}

/** Distinct input modalities present in the catalog, with counts. */
export function extractInputModalities(
  models: EnrichedPricingModel[]
): FacetOption[] {
  return extractModalityFacet(models, 'inputModalities')
}

/** Distinct output modalities present in the catalog, with counts. */
export function extractOutputModalities(
  models: EnrichedPricingModel[]
): FacetOption[] {
  return extractModalityFacet(models, 'outputModalities')
}

const MODALITY_ORDER: Modality[] = ['text', 'image', 'audio', 'video', 'file']

function extractModalityFacet(
  models: EnrichedPricingModel[],
  key: 'inputModalities' | 'outputModalities'
): FacetOption[] {
  const counts = new Map<Modality, number>()
  for (const m of models) {
    for (const mod of m.meta[key]) {
      counts.set(mod, (counts.get(mod) ?? 0) + 1)
    }
  }
  return MODALITY_ORDER.filter((m) => counts.has(m)).map((value) => ({
    value,
    label: value,
    count: counts.get(value) ?? 0,
  }))
}

/** Distinct endpoint types present in the catalog, with counts. */
export function extractEndpointTypes(
  models: EnrichedPricingModel[]
): FacetOption[] {
  const counts = new Map<string, number>()
  for (const m of models) {
    for (const e of m.supported_endpoint_types ?? []) {
      counts.set(e, (counts.get(e) ?? 0) + 1)
    }
  }
  return Array.from(counts.entries())
    .map(([value, count]) => ({ value, label: value, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
}

/** Distinct usable groups present in the catalog, with counts (excludes auto). */
export function extractGroups(models: EnrichedPricingModel[]): FacetOption[] {
  const counts = new Map<string, number>()
  for (const m of models) {
    for (const g of m.enable_groups ?? []) {
      if (!g || g === 'auto') continue
      counts.set(g, (counts.get(g) ?? 0) + 1)
    }
  }
  return Array.from(counts.entries())
    .map(([value, count]) => ({ value, label: value, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
}

/** Tag options (categories) as FacetOption[] with counts. */
export function extractTagFacets(
  models: EnrichedPricingModel[]
): FacetOption[] {
  const counts = new Map<string, number>()
  for (const m of models) {
    for (const t of parseTags(m.tags).map((x) => x.toLowerCase())) {
      counts.set(t, (counts.get(t) ?? 0) + 1)
    }
  }
  return Array.from(counts.entries())
    .map(([value, count]) => ({ value, label: value, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
}
