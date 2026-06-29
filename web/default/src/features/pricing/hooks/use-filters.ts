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
import { useCallback, useMemo } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import {
  DEFAULT_SORT,
  DEFAULT_TOKEN_UNIT,
  FILTER_SECTIONS,
  PROMPT_PRICE_MAX_USD_PER_M,
  SORT_OPTIONS,
  VIEW_MODES,
  type FilterSection,
  type ViewMode,
} from '../constants'
import {
  filterAndSortModels,
  type ModelFilters,
} from '../lib/filters'
import type { ModelTypeValue } from '../lib/model-type'
import type { EnrichedPricingModel, TokenUnit } from '../types'

const ARRAY_SEPARATOR = ','

function parseList(value: unknown): string[] {
  if (typeof value !== 'string' || value.length === 0) return []
  return value
    .split(ARRAY_SEPARATOR)
    .map((s) => s.trim())
    .filter(Boolean)
}

function serializeList(values: string[]): string | undefined {
  const cleaned = values.map((s) => s.trim()).filter(Boolean)
  return cleaned.length > 0 ? cleaned.join(ARRAY_SEPARATOR) : undefined
}

function normalizeViewMode(value: unknown): ViewMode {
  if (value === VIEW_MODES.TABLE) return VIEW_MODES.TABLE
  if (value === VIEW_MODES.CARD) return VIEW_MODES.CARD
  return VIEW_MODES.LIST
}

function toNumberOr(value: unknown, fallback: number): number {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : fallback
}

export type ActiveFilter = {
  facet: FilterSection | 'search' | 'promptPriceRange'
  value: string
  label: string
  onRemove: () => void
}

export type UseFiltersResult = ReturnType<typeof useFilters>

export function useFilters(models: EnrichedPricingModel[]) {
  const search = useSearch({ from: '/pricing/' })
  const navigate = useNavigate({ from: '/pricing/' })

  const searchInput = (search.search as string) || ''
  const sortBy = (search.sort as string) || DEFAULT_SORT

  const providers = useMemo(() => parseList(search.providers), [search.providers])
  const modelTypes = useMemo(
    () => parseList(search.modelTypes) as ModelTypeValue[],
    [search.modelTypes]
  )
  const groups = useMemo(() => parseList(search.groups), [search.groups])
  const categories = useMemo(
    () => parseList(search.categories),
    [search.categories]
  )
  const endpointTypes = useMemo(
    () => parseList(search.endpointTypes),
    [search.endpointTypes]
  )
  const quotaTypes = useMemo(
    () => parseList(search.quotaTypes),
    [search.quotaTypes]
  )

  const promptPriceRange = useMemo<[number, number]>(
    () => [toNumberOr(search.priceMin, 0), toNumberOr(search.priceMax, -1)],
    [search.priceMin, search.priceMax]
  )

  const tokenUnit: TokenUnit = search.tokenUnit === 'K' ? 'K' : DEFAULT_TOKEN_UNIT
  const viewMode = normalizeViewMode(search.view)
  const showRechargePrice = search.rechargePrice === true

  const updateFilters = useCallback(
    (updates: Record<string, unknown>) => {
      navigate({
        replace: true,
        search: (prev: Record<string, unknown>) => {
          const next: Record<string, unknown> = { ...prev, ...updates }
          for (const key of Object.keys(next)) {
            if (next[key] === undefined || next[key] === null) {
              delete next[key]
            }
          }
          return next
        },
      })
    },
    [navigate]
  )

  const facetState: Record<FilterSection, string[]> = useMemo(
    () => ({
      [FILTER_SECTIONS.PROVIDER]: providers,
      [FILTER_SECTIONS.MODEL_TYPE]: modelTypes,
      [FILTER_SECTIONS.GROUP]: groups,
      [FILTER_SECTIONS.CATEGORY]: categories,
      [FILTER_SECTIONS.ENDPOINT_TYPE]: endpointTypes,
      [FILTER_SECTIONS.PRICING_TYPE]: quotaTypes,
    }),
    [providers, modelTypes, groups, categories, endpointTypes, quotaTypes]
  )

  const toggleFacetValue = useCallback(
    (facet: FilterSection, value: string) => {
      const current = facetState[facet] ?? []
      const nextValues = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
      updateFilters({ [facet]: serializeList(nextValues) })
    },
    [facetState, updateFilters]
  )

  const setFacetValues = useCallback(
    (facet: FilterSection, values: string[]) => {
      updateFilters({ [facet]: serializeList(values) })
    },
    [updateFilters]
  )

  const setSearchInput = useCallback(
    (v: string) => updateFilters({ search: v || undefined }),
    [updateFilters]
  )
  const setSortBy = useCallback(
    (v: string) =>
      updateFilters({ sort: v === DEFAULT_SORT ? undefined : v }),
    [updateFilters]
  )
  const setPromptPriceRange = useCallback(
    ([min, max]: [number, number]) =>
      updateFilters({
        priceMin: min > 0 ? min : undefined,
        priceMax:
          max >= 0 && max < PROMPT_PRICE_MAX_USD_PER_M ? max : undefined,
      }),
    [updateFilters]
  )
  const setTokenUnit = useCallback(
    (v: TokenUnit) =>
      updateFilters({ tokenUnit: v === DEFAULT_TOKEN_UNIT ? undefined : v }),
    [updateFilters]
  )
  const setViewMode = useCallback(
    (v: ViewMode) =>
      updateFilters({ view: v === VIEW_MODES.LIST ? undefined : v }),
    [updateFilters]
  )
  const setShowRechargePrice = useCallback(
    (v: boolean) => updateFilters({ rechargePrice: v || undefined }),
    [updateFilters]
  )

  const filters = useMemo<ModelFilters>(
    () => ({
      search: searchInput,
      providers,
      modelTypes,
      groups,
      categories,
      endpointTypes,
      quotaTypes,
      promptPriceRange,
      sortBy,
    }),
    [
      searchInput,
      providers,
      modelTypes,
      groups,
      categories,
      endpointTypes,
      quotaTypes,
      promptPriceRange,
      sortBy,
    ]
  )

  const filteredModels = useMemo(() => {
    if (!models || models.length === 0) return []
    return filterAndSortModels(models, filters)
  }, [models, filters])

  const hasPriceRange = promptPriceRange[0] > 0 || promptPriceRange[1] >= 0

  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const pills: ActiveFilter[] = []
    const facetEntries = Object.entries(facetState) as Array<
      [FilterSection, string[]]
    >
    for (const [facet, values] of facetEntries) {
      for (const value of values) {
        pills.push({
          facet,
          value,
          label: value,
          onRemove: () => toggleFacetValue(facet, value),
        })
      }
    }
    if (hasPriceRange) {
      pills.push({
        facet: 'promptPriceRange',
        value: '',
        label: 'Prompt price',
        onRemove: () => setPromptPriceRange([0, -1]),
      })
    }
    return pills
  }, [facetState, hasPriceRange, toggleFacetValue, setPromptPriceRange])

  const activeFilterCount = activeFilters.length
  const hasActiveFilters = activeFilterCount > 0

  const clearFacet = useCallback(
    (facet: FilterSection | 'promptPriceRange') => {
      if (facet === 'promptPriceRange') {
        setPromptPriceRange([0, -1])
      } else {
        updateFilters({ [facet]: undefined })
      }
    },
    [updateFilters, setPromptPriceRange]
  )

  const clearFilters = useCallback(() => {
    updateFilters({
      [FILTER_SECTIONS.PROVIDER]: undefined,
      [FILTER_SECTIONS.MODEL_TYPE]: undefined,
      [FILTER_SECTIONS.GROUP]: undefined,
      [FILTER_SECTIONS.CATEGORY]: undefined,
      [FILTER_SECTIONS.ENDPOINT_TYPE]: undefined,
      [FILTER_SECTIONS.PRICING_TYPE]: undefined,
      priceMin: undefined,
      priceMax: undefined,
    })
  }, [updateFilters])

  const clearAll = useCallback(() => {
    clearFilters()
    updateFilters({ search: undefined })
  }, [clearFilters, updateFilters])

  const clearSearch = useCallback(() => {
    updateFilters({ search: undefined })
  }, [updateFilters])

  return {
    searchInput,
    sortBy,
    tokenUnit,
    viewMode,
    showRechargePrice,
    providers,
    modelTypes,
    groups,
    categories,
    endpointTypes,
    quotaTypes,
    promptPriceRange,
    facetState,
    toggleFacetValue,
    setFacetValues,
    setSearchInput,
    setSortBy,
    setPromptPriceRange,
    setTokenUnit,
    setViewMode,
    setShowRechargePrice,
    filteredModels,
    activeFilters,
    activeFilterCount,
    hasActiveFilters,
    clearFacet,
    clearFilters,
    clearAll,
    clearSearch,
    SORT_OPTIONS,
  }
}
