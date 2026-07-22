import { useMemo } from 'react'
import { ArrowUpDown, Check, ChevronDown, Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { SegmentedControl } from '@/components/patterns'
import {
  FILTER_SECTIONS,
  QUOTA_TYPES,
  SORT_OPTION_ORDER,
  getEndpointTypeLabels,
  getModelTypeLabels,
  getQuotaTypeLabels,
  getSortLabels,
  type FilterSection,
  type SortOption,
} from '../constants'
import {
  extractEndpointTypes,
  extractGroups,
  extractModelTypeFacets,
  extractProviders,
  extractTagFacets,
  type FacetOption,
} from '../lib/filters'
import type { EnrichedPricingModel, PricingVendor, TokenUnit } from '../types'
import { FacetDropdown, type FacetDropdownOption } from './facet-dropdown'
import { PromptPriceSlider } from './pricing-range-filters'

export interface PricingToolbarProps {
  /** Favorites-only filter (localStorage-backed). */
  showFavoritesOnly: boolean
  onShowFavoritesOnlyChange: (value: boolean) => void
  sortBy: string
  onSortChange: (value: string) => void
  tokenUnit: TokenUnit
  onTokenUnitChange: (value: TokenUnit) => void
  showRechargePrice: boolean
  onRechargePriceChange: (value: boolean) => void
  models: EnrichedPricingModel[]
  facetState: Record<FilterSection, string[]>
  toggleFacetValue: (facet: FilterSection, value: string) => void
  vendorIcons: Record<string, string | undefined>
  groupRatios?: Record<string, number>
  vendors: PricingVendor[]
  promptPriceRange: [number, number]
  priceCeiling: number
  onPromptPriceRangeChange: (value: [number, number]) => void
}

function formatGroupRatio(ratio: number | undefined): string | undefined {
  if (ratio == null) return undefined
  const formatted = Number.isInteger(ratio)
    ? ratio.toString()
    : ratio.toFixed(3).replace(/0+$/, '').replace(/\.$/, '')
  return `x${formatted}`
}

/**
 * Cloudflare-catalog-style filter bar: one dropdown per major facet (task
 * type, provider, capability), a "More filters" popover for the long tail,
 * plus sort and favorites.
 */
export function PricingToolbar(props: PricingToolbarProps) {
  const { t } = useTranslation()
  const sortLabels = getSortLabels(t)
  const modelTypeLabels = useMemo(() => getModelTypeLabels(t), [t])
  const endpointLabels = useMemo(() => getEndpointTypeLabels(t), [t])
  const quotaLabels = useMemo(() => getQuotaTypeLabels(t), [t])

  const facetOptions = useMemo<
    Record<FilterSection, FacetDropdownOption[]>
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
      label: (endpointLabels as Record<string, string>)[o.value] ?? o.value,
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

  const moreFilterCount =
    (props.facetState[FILTER_SECTIONS.CATEGORY]?.length ?? 0) +
    (props.facetState[FILTER_SECTIONS.PRICING_TYPE]?.length ?? 0) +
    (props.facetState[FILTER_SECTIONS.GROUP]?.length ?? 0)

  return (
    <div className='flex flex-wrap items-center gap-2'>
      <FacetDropdown
        label={t('Task type')}
        options={facetOptions[FILTER_SECTIONS.MODEL_TYPE]}
        selected={props.facetState[FILTER_SECTIONS.MODEL_TYPE] ?? []}
        onToggle={(value) =>
          props.toggleFacetValue(FILTER_SECTIONS.MODEL_TYPE, value)
        }
      />
      <FacetDropdown
        label={t('Providers')}
        options={facetOptions[FILTER_SECTIONS.PROVIDER]}
        selected={props.facetState[FILTER_SECTIONS.PROVIDER] ?? []}
        onToggle={(value) =>
          props.toggleFacetValue(FILTER_SECTIONS.PROVIDER, value)
        }
        searchable
      />
      <FacetDropdown
        label={t('Capabilities')}
        options={facetOptions[FILTER_SECTIONS.ENDPOINT_TYPE]}
        selected={props.facetState[FILTER_SECTIONS.ENDPOINT_TYPE] ?? []}
        onToggle={(value) =>
          props.toggleFacetValue(FILTER_SECTIONS.ENDPOINT_TYPE, value)
        }
      />

      {/* Long-tail facets + price range + display options */}
      <Popover>
        <PopoverTrigger className='border-border bg-background hover:bg-muted text-foreground inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors'>
          {t('More filters')}
          {moreFilterCount > 0 && (
            <span className='bg-brand text-brand-foreground rounded-full px-1.5 text-[10px] font-medium tabular-nums'>
              {moreFilterCount}
            </span>
          )}
          <ChevronDown className='text-muted-foreground size-3.5' />
        </PopoverTrigger>
        <PopoverContent align='start' className='w-72 p-0' sideOffset={6}>
          <div className='max-h-[70vh] space-y-4 overflow-y-auto p-3'>
            <MoreFilterSection title={t('Prompt pricing')}>
              <PromptPriceSlider
                value={props.promptPriceRange}
                ceiling={props.priceCeiling}
                onChange={props.onPromptPriceRangeChange}
              />
            </MoreFilterSection>
            <MoreFilterCheckboxSection
              title={t('Pricing Type')}
              options={facetOptions[FILTER_SECTIONS.PRICING_TYPE]}
              selected={props.facetState[FILTER_SECTIONS.PRICING_TYPE] ?? []}
              onToggle={(value) =>
                props.toggleFacetValue(FILTER_SECTIONS.PRICING_TYPE, value)
              }
            />
            <MoreFilterCheckboxSection
              title={t('Categories')}
              options={facetOptions[FILTER_SECTIONS.CATEGORY]}
              selected={props.facetState[FILTER_SECTIONS.CATEGORY] ?? []}
              onToggle={(value) =>
                props.toggleFacetValue(FILTER_SECTIONS.CATEGORY, value)
              }
            />
            <MoreFilterCheckboxSection
              title={t('Groups')}
              options={facetOptions[FILTER_SECTIONS.GROUP]}
              selected={props.facetState[FILTER_SECTIONS.GROUP] ?? []}
              onToggle={(value) =>
                props.toggleFacetValue(FILTER_SECTIONS.GROUP, value)
              }
            />
            <div className='border-border/60 space-y-3 border-t pt-3'>
              <div className='flex items-center justify-between gap-3'>
                <span className='text-muted-foreground text-xs font-medium'>
                  {t('Price display mode')}
                </span>
                <SegmentedControl
                  options={[
                    { value: 'standard', label: t('Standard') },
                    { value: 'recharge', label: t('Recharge') },
                  ]}
                  value={props.showRechargePrice ? 'recharge' : 'standard'}
                  onChange={(value) =>
                    props.onRechargePriceChange(value === 'recharge')
                  }
                  ariaLabel={t('Price display mode')}
                />
              </div>
              <div className='flex items-center justify-between gap-3'>
                <span className='text-muted-foreground text-xs font-medium'>
                  {t('Token unit')}
                </span>
                <SegmentedControl
                  options={[
                    { value: 'M', label: '/1M' },
                    { value: 'K', label: '/1K' },
                  ]}
                  value={props.tokenUnit}
                  onChange={(value) =>
                    props.onTokenUnitChange(value as TokenUnit)
                  }
                  ariaLabel={t('Token unit')}
                />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <DropdownMenu>
        <DropdownMenuTrigger className='border-border bg-background hover:bg-muted text-foreground inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors'>
          <ArrowUpDown className='size-3.5' />
          <span>{sortLabels[props.sortBy as SortOption] || t('Sort')}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-48'>
          {SORT_OPTION_ORDER.map((value) => (
            <DropdownMenuItem
              key={value}
              onClick={() => props.onSortChange(value)}
              className='gap-2'
            >
              <Check
                className={cn(
                  'size-4 shrink-0',
                  props.sortBy === value ? 'opacity-100' : 'opacity-0'
                )}
              />
              {sortLabels[value]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <button
        type='button'
        onClick={() =>
          props.onShowFavoritesOnlyChange(!props.showFavoritesOnly)
        }
        aria-pressed={props.showFavoritesOnly}
        className={cn(
          'inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors',
          props.showFavoritesOnly
            ? 'border-brand-border/50 bg-brand-subtle text-brand'
            : 'border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted'
        )}
      >
        <Star
          className={cn('size-3.5', props.showFavoritesOnly && 'fill-current')}
          aria-hidden='true'
        />
        {t('Favorites')}
      </button>
    </div>
  )
}

function MoreFilterSection(props: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section>
      <h3 className='text-foreground mb-2 font-mono text-[11px] font-semibold tracking-[0.06em] uppercase'>
        {props.title}
      </h3>
      {props.children}
    </section>
  )
}

function MoreFilterCheckboxSection(props: {
  title: string
  options: FacetDropdownOption[]
  selected: string[]
  onToggle: (value: string) => void
}) {
  if (props.options.length === 0) return null
  return (
    <MoreFilterSection title={props.title}>
      <div className='space-y-0.5'>
        {props.options.map((option) => {
          const checked = props.selected.includes(option.value)
          return (
            <label
              key={option.value}
              className='hover:bg-muted/60 flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1'
            >
              <Checkbox
                checked={checked}
                onCheckedChange={() => props.onToggle(option.value)}
              />
              <span
                className={cn(
                  'min-w-0 flex-1 truncate text-xs',
                  checked
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground'
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
      </div>
    </MoreFilterSection>
  )
}
