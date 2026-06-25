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
  CONTEXT_LENGTH_MIN,
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
import type { EnrichedPricingModel, Modality, TokenUnit } from '../types'

// ----------------------------------------------------------------------------
// URL <-> state serialization
// ----------------------------------------------------------------------------
//
// Array facets are serialized as a SINGLE comma-joined string per param
// (e.g. `?providers=OpenAI,Anthropic`). This keeps URLs short and the zod
// schema simple (each facet is `z.string().optional()`). The hook owns parse/
// serialize so components only ever see/produce `string[]`.
//
// Ranges are serialized as two numeric params: `ctxMin`/`ctxMax` (tokens) and
// `priceMin`/`priceMax` (USD per 1M input tokens). Absent param == open bound.

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
  // Absent / unknown => the default dense list (URL param omitted).
  return VIEW_MODES.LIST
}

function toNumberOr(value: unknown, fallback: number): number {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : fallback
}

/** A removable active-filter pill descriptor. */
export type ActiveFilter = {
  /** Facet key this pill belongs to (FILTER_SECTIONS value, or 'search'/range). */
  facet: FilterSection | 'search' | 'contextRange' | 'promptPriceRange'
  /** The selected value (for array facets), or '' for search/range pills. */
  value: string
  /** Human-readable label for the pill (already localized by the hook). */
  label: string
  /** Remove just this selection. */
  onRemove: () => void
}

export type UseFiltersResult = ReturnType<typeof useFilters>

export function useFilters(models: EnrichedPricingModel[]) {
  const search = useSearch({ from: '/pricing/' })
  const navigate = useNavigate({ from: '/pricing/' })

  // ---- read state from URL (single source of truth) ----
  const searchInput = (search.search as string) || ''
  const sortBy = (search.sort as string) || DEFAULT_SORT

  const providers = useMemo(() => parseList(search.providers), [search.providers])
  const groups = useMemo(() => parseList(search.groups), [search.groups])
  const categories = useMemo(
    () => parseList(search.categories),
    [search.categories]
  )
  const inputModalities = useMemo(
    () => parseList(search.inputModalities) as Modality[],
    [search.inputModalities]
  )
  const outputModalities = useMemo(
    () => parseList(search.outputModalities) as Modality[],
    [search.outputModalities]
  )
  const series = useMemo(() => parseList(search.series), [search.series])
  const supportedParameters = useMemo(
    () => parseList(search.supportedParameters),
    [search.supportedParameters]
  )
  const endpointTypes = useMemo(
    () => parseList(search.endpointTypes),
    [search.endpointTypes]
  )
  const quotaTypes = useMemo(
    () => parseList(search.quotaTypes),
    [search.quotaTypes]
  )

  const contextRange = useMemo<[number, number]>(
    () => [
      toNumberOr(search.ctxMin, CONTEXT_LENGTH_MIN),
      toNumberOr(search.ctxMax, 0),
    ],
    [search.ctxMin, search.ctxMax]
  )
  const promptPriceRange = useMemo<[number, number]>(
    () => [toNumberOr(search.priceMin, 0), toNumberOr(search.priceMax, -1)],
    [search.priceMin, search.priceMax]
  )

  const tokenUnit: TokenUnit = search.tokenUnit === 'K' ? 'K' : DEFAULT_TOKEN_UNIT
  const viewMode = normalizeViewMode(search.view)
  const showRechargePrice = search.rechargePrice === true

  // ---- URL writers ----
  const updateFilters = useCallback(
    (updates: Record<string, unknown>) => {
      navigate({
        replace: true,
        search: (prev) => {
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

  // Map facet key -> URL param + current array (keeps toggle generic).
  const facetState: Record<FilterSection, string[]> = useMemo(
    () => ({
      [FILTER_SECTIONS.PROVIDER]: providers,
      [FILTER_SECTIONS.GROUP]: groups,
      [FILTER_SECTIONS.CATEGORY]: categories,
      [FILTER_SECTIONS.INPUT_MODALITY]: inputModalities,
      [FILTER_SECTIONS.OUTPUT_MODALITY]: outputModalities,
      [FILTER_SECTIONS.SERIES]: series,
      [FILTER_SECTIONS.SUPPORTED_PARAMETER]: supportedParameters,
      [FILTER_SECTIONS.ENDPOINT_TYPE]: endpointTypes,
      [FILTER_SECTIONS.PRICING_TYPE]: quotaTypes,
    }),
    [
      providers,
      groups,
      categories,
      inputModalities,
      outputModalities,
      series,
      supportedParameters,
      endpointTypes,
      quotaTypes,
    ]
  )

  /** Add or remove a single value within a facet (URL param == facet key). */
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

  /** Replace the entire selection for a facet. */
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
  const setContextRange = useCallback(
    ([min, max]: [number, number]) =>
      updateFilters({
        ctxMin: min > CONTEXT_LENGTH_MIN ? min : undefined,
        ctxMax: max > 0 ? max : undefined,
      }),
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
      // LIST is the default; omit the param so the URL stays clean.
      updateFilters({ view: v === VIEW_MODES.LIST ? undefined : v }),
    [updateFilters]
  )
  const setShowRechargePrice = useCallback(
    (v: boolean) => updateFilters({ rechargePrice: v || undefined }),
    [updateFilters]
  )

  // ---- derived: filtered models ----
  const filters = useMemo<ModelFilters>(
    () => ({
      search: searchInput,
      providers,
      groups,
      categories,
      inputModalities,
      outputModalities,
      series,
      supportedParameters,
      endpointTypes,
      quotaTypes,
      contextRange,
      promptPriceRange,
      sortBy,
    }),
    [
      searchInput,
      providers,
      groups,
      categories,
      inputModalities,
      outputModalities,
      series,
      supportedParameters,
      endpointTypes,
      quotaTypes,
      contextRange,
      promptPriceRange,
      sortBy,
    ]
  )

  const filteredModels = useMemo(() => {
    if (!models || models.length === 0) return []
    return filterAndSortModels(models, filters)
  }, [models, filters])

  // ---- active filter pills ----
  const hasContextRange =
    contextRange[0] > CONTEXT_LENGTH_MIN || contextRange[1] > 0
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
    if (hasContextRange) {
      pills.push({
        facet: 'contextRange',
        value: '',
        label: 'Context length',
        onRemove: () => setContextRange([CONTEXT_LENGTH_MIN, 0]),
      })
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
  }, [
    facetState,
    hasContextRange,
    hasPriceRange,
    toggleFacetValue,
    setContextRange,
    setPromptPriceRange,
  ])

  const activeFilterCount = activeFilters.length
  const hasActiveFilters = activeFilterCount > 0

  /** Clear a single facet's selection (and ranges via the pseudo-facets). */
  const clearFacet = useCallback(
    (
      facet: FilterSection | 'contextRange' | 'promptPriceRange'
    ) => {
      if (facet === 'contextRange') {
        setContextRange([CONTEXT_LENGTH_MIN, 0])
      } else if (facet === 'promptPriceRange') {
        setPromptPriceRange([0, -1])
      } else {
        updateFilters({ [facet]: undefined })
      }
    },
    [updateFilters, setContextRange, setPromptPriceRange]
  )

  /** Clear all facets + ranges (keeps search, sort, view, tokenUnit, recharge). */
  const clearFilters = useCallback(() => {
    updateFilters({
      [FILTER_SECTIONS.PROVIDER]: undefined,
      [FILTER_SECTIONS.GROUP]: undefined,
      [FILTER_SECTIONS.CATEGORY]: undefined,
      [FILTER_SECTIONS.INPUT_MODALITY]: undefined,
      [FILTER_SECTIONS.OUTPUT_MODALITY]: undefined,
      [FILTER_SECTIONS.SERIES]: undefined,
      [FILTER_SECTIONS.SUPPORTED_PARAMETER]: undefined,
      [FILTER_SECTIONS.ENDPOINT_TYPE]: undefined,
      [FILTER_SECTIONS.PRICING_TYPE]: undefined,
      ctxMin: undefined,
      ctxMax: undefined,
      priceMin: undefined,
      priceMax: undefined,
    })
  }, [updateFilters])

  /** Clear everything including search. */
  const clearAll = useCallback(() => {
    clearFilters()
    updateFilters({ search: undefined })
  }, [clearFilters, updateFilters])

  const clearSearch = useCallback(() => {
    updateFilters({ search: undefined })
  }, [updateFilters])

  return {
    // raw search/sort/view/units
    searchInput,
    sortBy,
    tokenUnit,
    viewMode,
    showRechargePrice,
    // per-facet selected arrays
    providers,
    groups,
    categories,
    inputModalities,
    outputModalities,
    series,
    supportedParameters,
    endpointTypes,
    quotaTypes,
    // ranges
    contextRange,
    promptPriceRange,
    // generic facet helpers
    facetState,
    toggleFacetValue,
    setFacetValues,
    // setters
    setSearchInput,
    setSortBy,
    setContextRange,
    setPromptPriceRange,
    setTokenUnit,
    setViewMode,
    setShowRechargePrice,
    // derived
    filteredModels,
    activeFilters,
    activeFilterCount,
    hasActiveFilters,
    // clears
    clearFacet,
    clearFilters,
    clearAll,
    clearSearch,
    // constants re-exported for convenience
    SORT_OPTIONS,
  }
}
