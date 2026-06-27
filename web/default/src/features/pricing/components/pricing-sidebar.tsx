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
import { useMemo, useState } from 'react'
import { ChevronDown, RotateCcw, Search, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getLobeIcon } from '@/lib/lobe-icon'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  FILTER_SECTIONS,
  FILTER_SECTION_ORDER,
  MAX_FILTER_ITEMS,
  QUOTA_TYPES,
  getEndpointTypeLabels,
  getModelTypeLabels,
  getQuotaTypeLabels,
  type FilterSection,
} from '../constants'
import {
  extractEndpointTypes,
  extractGroups,
  extractModelTypeFacets,
  extractProviders,
  extractTagFacets,
  type FacetOption,
} from '../lib/filters'
import type { EnrichedPricingModel, PricingVendor } from '../types'
import { PromptPriceSlider } from './pricing-range-filters'

export interface PricingSidebarProps {
  models: EnrichedPricingModel[]
  vendors: PricingVendor[]
  facetState: Record<FilterSection, string[]>
  toggleFacetValue: (facet: FilterSection, value: string) => void
  vendorIcons: Record<string, string | undefined>
  groupRatios?: Record<string, number>
  promptPriceRange: [number, number]
  priceCeiling: number
  onPromptPriceRangeChange: (value: [number, number]) => void
  hasActiveFilters: boolean
  onClearFilters: () => void
  className?: string
}

const SECTION_TITLES: Record<FilterSection, string> = {
  [FILTER_SECTIONS.PROVIDER]: 'Providers',
  [FILTER_SECTIONS.MODEL_TYPE]: 'Model type',
  [FILTER_SECTIONS.CATEGORY]: 'Categories',
  [FILTER_SECTIONS.PRICING_TYPE]: 'Pricing Type',
  [FILTER_SECTIONS.ENDPOINT_TYPE]: 'Endpoint Type',
  [FILTER_SECTIONS.GROUP]: 'Groups',
}

function formatGroupRatio(ratio: number | undefined): string | undefined {
  if (ratio == null) return undefined
  const formatted = Number.isInteger(ratio)
    ? ratio.toString()
    : ratio.toFixed(3).replace(/0+$/, '').replace(/\.$/, '')
  return `x${formatted}`
}

export function PricingSidebar(props: PricingSidebarProps) {
  const { t } = useTranslation()
  const [filterQuery, setFilterQuery] = useState('')
  const modelTypeLabels = getModelTypeLabels(t)
  const endpointLabels = getEndpointTypeLabels(t)
  const quotaLabels = getQuotaTypeLabels(t)

  const facetOptions = useMemo<
    Record<FilterSection, Array<FacetOption & { iconKey?: string; suffix?: string }>>
  >(() => {
    const models = props.models

    const providers = extractProviders(models, props.vendors).map((o) => ({
      ...o,
      iconKey: props.vendorIcons[o.value],
    }))
    const modelTypes = extractModelTypeFacets(models).map((o) => ({
      ...o,
      label: modelTypeLabels[o.value] ?? o.value,
    }))
    const groups = extractGroups(models).map((o) => ({
      ...o,
      suffix: formatGroupRatio(props.groupRatios?.[o.value]),
    }))
    const endpoints = extractEndpointTypes(models).map((o) => ({
      ...o,
      label:
        (endpointLabels as Record<string, string>)[o.value] ?? o.value,
    }))
    const pricing: FacetOption[] = [
      {
        value: QUOTA_TYPES.TOKEN,
        label: quotaLabels[QUOTA_TYPES.TOKEN],
        count: models.filter((m) => m.quota_type === 0).length,
      },
      {
        value: QUOTA_TYPES.REQUEST,
        label: quotaLabels[QUOTA_TYPES.REQUEST],
        count: models.filter((m) => m.quota_type === 1).length,
      },
    ].filter((o) => o.count > 0)

    return {
      [FILTER_SECTIONS.PROVIDER]: providers,
      [FILTER_SECTIONS.MODEL_TYPE]: modelTypes,
      [FILTER_SECTIONS.CATEGORY]: extractTagFacets(models),
      [FILTER_SECTIONS.PRICING_TYPE]: pricing,
      [FILTER_SECTIONS.ENDPOINT_TYPE]: endpoints,
      [FILTER_SECTIONS.GROUP]: groups,
    }
  }, [
    props.models,
    props.vendors,
    props.vendorIcons,
    props.groupRatios,
    modelTypeLabels,
    endpointLabels,
    quotaLabels,
  ])

  const q = filterQuery.trim().toLowerCase()

  return (
    <aside className={cn('flex flex-col', props.className)}>
      <div className='mb-3 flex items-center justify-between gap-2'>
        <h2 className='text-foreground text-sm font-bold'>{t('Filters')}</h2>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={props.onClearFilters}
          disabled={!props.hasActiveFilters}
          className='h-7 gap-1.5 px-2 text-xs'
        >
          <RotateCcw className='size-3.5' />
          {t('Reset')}
        </Button>
      </div>

      {/* In-rail filter search */}
      <div className='relative mb-2'>
        <Search className='text-muted-foreground/60 pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2' />
        <input
          type='text'
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          placeholder={t('Filter options...')}
          className='border-border/60 bg-background placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-primary/20 h-8 w-full rounded-md border pr-7 pl-8 text-xs outline-none focus:ring-2'
          aria-label={t('Filter options')}
        />
        {filterQuery && (
          <button
            type='button'
            onClick={() => setFilterQuery('')}
            className='text-muted-foreground/60 hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2'
            aria-label={t('Clear')}
          >
            <X className='size-3.5' />
          </button>
        )}
      </div>

      <div className='space-y-1'>
        <RangeSection title={t('Prompt pricing')}>
          <PromptPriceSlider
            value={props.promptPriceRange}
            ceiling={props.priceCeiling}
            onChange={props.onPromptPriceRangeChange}
          />
        </RangeSection>

        {/* Multi-select facets (OpenRouter order) */}
        {FILTER_SECTION_ORDER.map((facet) => {
          const options = facetOptions[facet] ?? []
          if (options.length === 0) return null
          return (
            <CheckboxFacetSection
              key={facet}
              title={t(SECTION_TITLES[facet])}
              options={options}
              selected={props.facetState[facet] ?? []}
              onToggle={(value) => props.toggleFacetValue(facet, value)}
              query={q}
            />
          )
        })}
      </div>
    </aside>
  )
}

function RangeSection(props: { title: string; children: React.ReactNode }) {
  return (
    <Collapsible
      defaultOpen
      className='border-border/60 border-b pb-3 last:border-b-0'
    >
      <CollapsibleTrigger className='group flex w-full items-center justify-between py-2.5 text-left'>
        <span className='text-foreground text-sm font-semibold'>
          {props.title}
        </span>
        <ChevronDown className='text-muted-foreground size-4 transition-transform group-data-[panel-open]:rotate-180' />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className='pt-1.5'>{props.children}</div>
      </CollapsibleContent>
    </Collapsible>
  )
}

function CheckboxFacetSection(props: {
  title: string
  options: Array<FacetOption & { iconKey?: string; suffix?: string }>
  selected: string[]
  onToggle: (value: string) => void
  query: string
}) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)

  const filtered = useMemo(() => {
    if (!props.query) return props.options
    return props.options.filter((o) =>
      o.label.toLowerCase().includes(props.query)
    )
  }, [props.options, props.query])

  // Keep selected-but-filtered-out items visible, and never collapse below the
  // selected set so a checked box is always reachable.
  const visible = useMemo(() => {
    if (expanded || props.query) return filtered
    const selectedSet = new Set(props.selected)
    const head = filtered.slice(0, MAX_FILTER_ITEMS)
    const headSet = new Set(head.map((o) => o.value))
    const extraSelected = filtered.filter(
      (o) => selectedSet.has(o.value) && !headSet.has(o.value)
    )
    return [...head, ...extraSelected]
  }, [expanded, filtered, props.query, props.selected])

  const hiddenCount = filtered.length - visible.length

  if (filtered.length === 0) return null

  return (
    <Collapsible
      defaultOpen
      className='border-border/60 border-b pb-3 last:border-b-0'
    >
      <CollapsibleTrigger className='group flex w-full items-center justify-between py-2.5 text-left'>
        <span className='text-foreground flex items-center gap-1.5 text-sm font-semibold'>
          {props.title}
          {props.selected.length > 0 && (
            <span className='bg-brand text-brand-foreground rounded-full px-1.5 text-[10px] font-medium tabular-nums'>
              {props.selected.length}
            </span>
          )}
        </span>
        <ChevronDown className='text-muted-foreground size-4 transition-transform group-data-[panel-open]:rotate-180' />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className='space-y-0.5 pt-0.5'>
          {visible.map((option) => {
            const checked = props.selected.includes(option.value)
            return (
              <label
                key={option.value}
                className='hover:bg-muted/50 group flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1'
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => props.onToggle(option.value)}
                />
                {option.iconKey && (
                  <span className='shrink-0'>
                    {getLobeIcon(option.iconKey, 14)}
                  </span>
                )}
                <span
                  className={cn(
                    'min-w-0 flex-1 truncate text-xs',
                    checked ? 'text-foreground font-medium' : 'text-muted-foreground'
                  )}
                  title={option.label}
                >
                  {option.label}
                </span>
                {option.suffix && (
                  <span className='text-muted-foreground/60 shrink-0 font-mono text-[10px]'>
                    {option.suffix}
                  </span>
                )}
                <span className='text-muted-foreground/50 shrink-0 text-[11px] tabular-nums'>
                  {option.count}
                </span>
              </label>
            )
          })}
          {!props.query && (hiddenCount > 0 || expanded) && (
            <button
              type='button'
              onClick={() => setExpanded((v) => !v)}
              className='text-brand hover:text-brand-hover px-1.5 py-1 text-xs font-medium'
            >
              {expanded
                ? t('Show less')
                : t('Show {{count}} more', { count: hiddenCount })}
            </button>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
