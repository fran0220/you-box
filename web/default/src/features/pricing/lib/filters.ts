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
} from '../constants'
import {
  deriveModelTypes,
  extractModelTypeFacets,
  extractVendors,
  type ModelTypeValue,
} from './model-type'
import type { EnrichedPricingModel, PricingModel, PricingVendor } from '../types'

// ----------------------------------------------------------------------------
// Filter Utilities
// ----------------------------------------------------------------------------

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

export function filterByVendor(
  models: PricingModel[],
  vendor: string
): PricingModel[] {
  if (vendor === FILTER_ALL) return models
  return models.filter((m) => m.vendor_name === vendor)
}

export function filterByGroup(
  models: PricingModel[],
  group: string
): PricingModel[] {
  if (group === FILTER_ALL) return models
  return models.filter((m) => m.enable_groups?.includes(group))
}

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

export function filterByEndpointType(
  models: PricingModel[],
  endpointType: string
): PricingModel[] {
  if (endpointType === ENDPOINT_TYPES.ALL) return models
  return models.filter((m) =>
    m.supported_endpoint_types?.includes(endpointType)
  )
}

function getModelSortPrice(model: EnrichedPricingModel): number {
  const usd = model.promptPriceUsdPerM
  if (Number.isFinite(usd)) return usd
  if (model.quota_type === QUOTA_TYPE_VALUES.REQUEST) {
    return model.model_price || 0
  }
  return model.model_ratio || 0
}

/** Token-priced models sort before per-request models (VAL-PLAZA-034). */
function priceSortTier(model: EnrichedPricingModel): number {
  return model.quota_type === QUOTA_TYPE_VALUES.REQUEST ? 1 : 0
}

export function sortModels(
  models: EnrichedPricingModel[],
  sortBy: string
): EnrichedPricingModel[] {
  const sorted = [...models]
  const byName = (a: EnrichedPricingModel, b: EnrichedPricingModel) =>
    (a.model_name || '').localeCompare(b.model_name || '')

  const byPriceLow = (a: EnrichedPricingModel, b: EnrichedPricingModel) => {
    const tier = priceSortTier(a) - priceSortTier(b)
    if (tier !== 0) return tier
    return getModelSortPrice(a) - getModelSortPrice(b) || byName(a, b)
  }

  const byPriceHigh = (a: EnrichedPricingModel, b: EnrichedPricingModel) => {
    const tier = priceSortTier(a) - priceSortTier(b)
    if (tier !== 0) return tier
    return getModelSortPrice(b) - getModelSortPrice(a) || byName(a, b)
  }

  switch (sortBy) {
    case SORT_OPTIONS.NAME:
      sorted.sort(byName)
      break
    case SORT_OPTIONS.PRICE_LOW:
      sorted.sort(byPriceLow)
      break
    case SORT_OPTIONS.PRICE_HIGH:
      sorted.sort(byPriceHigh)
      break
    default:
      sorted.sort(byName)
      break
  }

  return sorted
}

function matchesAny(selected: string[], values: string[]): boolean {
  if (selected.length === 0) return true
  const set = new Set(values)
  return selected.some((s) => set.has(s))
}

export type ModelFilters = {
  search: string
  providers: string[]
  modelTypes: ModelTypeValue[]
  groups: string[]
  categories: string[]
  endpointTypes: string[]
  quotaTypes: string[]
  promptPriceRange: [number, number]
  sortBy: string
}

function inPromptPriceRange(
  model: EnrichedPricingModel,
  [min, max]: [number, number]
): boolean {
  const price = model.promptPriceUsdPerM
  if (!Number.isFinite(price)) return !(max >= 0 && min > 0)
  if (min > 0 && price < min) return false
  if (max >= 0 && price > max) return false
  return true
}

export function filterAndSortModels(
  models: EnrichedPricingModel[],
  filters: ModelFilters
): EnrichedPricingModel[] {
  const q = filters.search.trim().toLowerCase()

  const result = models.filter((m) => {
    if (q) {
      const hay =
        `${m.model_name ?? ''} ${m.description ?? ''} ${m.tags ?? ''} ` +
        `${m.vendor_name ?? ''}`
      if (!hay.toLowerCase().includes(q)) return false
    }

    if (!matchesAny(filters.providers, m.vendor_name ? [m.vendor_name] : []))
      return false
    if (
      !matchesAny(filters.modelTypes, deriveModelTypes(m) as string[])
    )
      return false
    if (!matchesAny(filters.groups, m.enable_groups ?? [])) return false
    if (
      !matchesAny(
        filters.categories,
        parseTags(m.tags).map((t) => t.toLowerCase())
      )
    )
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

    if (!inPromptPriceRange(m, filters.promptPriceRange)) return false

    return true
  })

  return sortModels(result, filters.sortBy)
}

export function parseTags(tagsString?: string): string[] {
  if (!tagsString) return []
  return tagsString
    .split(/[,;|\s]+/)
    .map((t) => t.trim())
    .filter(Boolean)
}

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

export type FacetOption = {
  value: string
  label: string
  count: number
}

export function extractProviders(
  models: EnrichedPricingModel[],
  vendors: PricingVendor[]
): FacetOption[] {
  return extractVendors(models, vendors)
}

export { extractModelTypeFacets }

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
