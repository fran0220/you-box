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
import { type ColumnDef } from '@tanstack/react-table'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getLobeIcon } from '@/lib/lobe-icon'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { GroupBadge } from '@/components/group-badge'
import { StatusBadge, StatusBadgeList } from '@/components/status-badge'
import {
  DEFAULT_TOKEN_UNIT,
  QUOTA_TYPE_VALUES,
  SORT_OPTIONS,
  type SortOption,
} from '../constants'
import {
  getDynamicDisplayGroupRatio,
  getDynamicPricingSummary,
} from '../lib/dynamic-price'
import { parseTags } from '../lib/filters'
import { isTokenBasedModel } from '../lib/model-helpers'
import { formatTokenCount } from '../lib/model-metadata'
import {
  formatPrice,
  formatRequestPrice,
  stripTrailingZeros,
} from '../lib/price'
import type { EnrichedPricingModel, TokenUnit } from '../types'

// ----------------------------------------------------------------------------
// Pricing Table Columns
//
// Sorting is GENUINELY wired to the catalog's external sort state (the same
// `useFilters().sortBy` that drives the list/cards) rather than TanStack's own
// client sort. Clicking a sortable header dispatches the matching SORT_OPTIONS
// value; the data passed to the table is already sorted by the hook.
// ----------------------------------------------------------------------------

export interface PricingColumnsOptions {
  tokenUnit?: TokenUnit
  priceRate?: number
  usdExchangeRate?: number
  showRechargePrice?: boolean
  sortBy: string
  onSortChange: (value: string) => void
}

/** Header button wired to the external sort. For price-low/price-high it cycles
 * low → high; for the others it toggles ascending/descending where a partner
 * sort exists, else just applies the single sort. */
function SortableHeader(props: {
  title: string
  /** The sort option(s) this column owns, in toggle order. */
  options: SortOption[]
  sortBy: string
  onSortChange: (value: string) => void
}) {
  const activeIndex = props.options.indexOf(props.sortBy as SortOption)
  const isActive = activeIndex >= 0
  const next =
    props.options[(activeIndex + 1) % props.options.length] ?? props.options[0]

  return (
    <button
      type='button'
      onClick={() => props.onSortChange(next)}
      className={cn(
        'hover:text-foreground -ml-1 inline-flex items-center gap-1 rounded px-1 py-0.5 font-medium transition-colors',
        isActive ? 'text-foreground' : 'text-muted-foreground'
      )}
    >
      {props.title}
      {isActive &&
        (props.sortBy === SORT_OPTIONS.PRICE_HIGH ||
        props.sortBy === SORT_OPTIONS.CONTEXT_HIGH ? (
          <ArrowDown className='size-3.5' />
        ) : (
          <ArrowUp className='size-3.5' />
        ))}
    </button>
  )
}

function renderLimitedTags(
  items: string[],
  maxDisplay: number = 3
): React.ReactNode {
  return (
    <StatusBadgeList
      items={items}
      max={maxDisplay}
      getKey={(item) => item}
      renderItem={(item) => (
        <StatusBadge label={item} autoColor={item} size='sm' copyable={false} />
      )}
    />
  )
}

function renderLimitedGroupBadges(
  groups: string[],
  maxDisplay: number = 2
): React.ReactNode {
  return (
    <StatusBadgeList
      items={groups}
      max={maxDisplay}
      getKey={(group) => group}
      renderItem={(group) => <GroupBadge group={group} size='sm' />}
    />
  )
}

export function usePricingColumns(
  options: PricingColumnsOptions
): ColumnDef<EnrichedPricingModel>[] {
  const { t } = useTranslation()
  const {
    tokenUnit = DEFAULT_TOKEN_UNIT,
    priceRate = 1,
    usdExchangeRate = 1,
    showRechargePrice = false,
    sortBy,
    onSortChange,
  } = options

  const tokenUnitLabel = tokenUnit === 'K' ? '1K' : '1M'

  return [
    // Model column (sortable: name)
    {
      accessorKey: 'model_name',
      meta: { label: t('Model') },
      header: () => (
        <SortableHeader
          title={t('Model')}
          options={[SORT_OPTIONS.NAME]}
          sortBy={sortBy}
          onSortChange={onSortChange}
        />
      ),
      cell: ({ row }) => {
        const model = row.original
        const modelIconKey = model.icon || model.vendor_icon
        const modelIcon = modelIconKey ? getLobeIcon(modelIconKey, 14) : null

        return (
          <div className='flex min-w-[200px] items-center gap-2'>
            {modelIcon}
            <span className='truncate font-mono text-sm font-medium'>
              {model.model_name}
            </span>
          </div>
        )
      },
      minSize: 200,
    },

    // Type column
    {
      accessorKey: 'quota_type',
      meta: { label: t('Type') },
      header: t('Type'),
      cell: ({ row }) => {
        const isTokenBased = row.original.quota_type === QUOTA_TYPE_VALUES.TOKEN
        return (
          <StatusBadge
            label={isTokenBased ? t('Token') : t('Request')}
            variant={isTokenBased ? 'info' : 'neutral'}
            copyable={false}
          />
        )
      },
      size: 80,
      enableSorting: false,
    },

    // Context column (sortable: context-high)
    {
      id: 'context',
      meta: { label: t('Context') },
      header: () => (
        <SortableHeader
          title={t('Context')}
          options={[SORT_OPTIONS.CONTEXT_HIGH]}
          sortBy={sortBy}
          onSortChange={onSortChange}
        />
      ),
      cell: ({ row }) => (
        <span className='font-mono text-sm tabular-nums'>
          {formatTokenCount(row.original.meta.contextLength)}
        </span>
      ),
      size: 100,
      enableSorting: false,
    },

    // Price column (sortable: cycles low → high)
    {
      accessorKey: 'price',
      meta: { label: t('Price') },
      header: () => (
        <SortableHeader
          title={t('Price')}
          options={[SORT_OPTIONS.PRICE_LOW, SORT_OPTIONS.PRICE_HIGH]}
          sortBy={sortBy}
          onSortChange={onSortChange}
        />
      ),
      cell: ({ row }) => {
        const model = row.original
        const dynamicSummary = getDynamicPricingSummary(model, {
          tokenUnit,
          showRechargePrice,
          priceRate,
          usdExchangeRate,
          groupRatioMultiplier: getDynamicDisplayGroupRatio(model),
        })

        if (dynamicSummary) {
          if (dynamicSummary.isSpecialExpression) {
            return (
              <div className='max-w-[320px] min-w-[200px]'>
                <div className='text-warning text-xs font-medium'>
                  {t('Special billing expression')}
                </div>
                <div className='text-muted-foreground text-[11px]'>
                  {t('Unable to parse structured pricing')}
                </div>
                <code className='text-muted-foreground/70 mt-1 line-clamp-2 block font-mono text-[10px] leading-relaxed break-all'>
                  {dynamicSummary.rawExpression}
                </code>
              </div>
            )
          }

          const primaryEntries = dynamicSummary.primaryEntries.slice(0, 2)
          if (primaryEntries.length === 0) {
            return (
              <span className='text-muted-foreground text-xs'>
                {t('Dynamic Pricing')}
              </span>
            )
          }

          return (
            <div className='min-w-[180px]'>
              <span className='font-mono text-sm tabular-nums'>
                {primaryEntries.map((entry, index) => (
                  <span key={entry.key}>
                    {index > 0 && (
                      <span className='text-muted-foreground/40 mx-1'>/</span>
                    )}
                    {stripTrailingZeros(entry.formatted)}
                  </span>
                ))}
              </span>
              <div className='text-muted-foreground/50 text-[10px]'>
                / {tokenUnitLabel} tokens
                {dynamicSummary.tierCount > 1 &&
                  ` · ${t('{{count}} tiers', {
                    count: dynamicSummary.tierCount,
                  })}`}
              </div>
            </div>
          )
        }

        const isTokenBased = isTokenBasedModel(model)

        if (isTokenBased) {
          const inputPrice = stripTrailingZeros(
            formatPrice(
              model,
              'input',
              tokenUnit,
              showRechargePrice,
              priceRate,
              usdExchangeRate
            )
          )
          const outputPrice = stripTrailingZeros(
            formatPrice(
              model,
              'output',
              tokenUnit,
              showRechargePrice,
              priceRate,
              usdExchangeRate
            )
          )

          return (
            <div className='min-w-[160px]'>
              <span className='font-mono text-sm tabular-nums'>
                {inputPrice}
                <span className='text-muted-foreground/40 mx-1'>/</span>
                {outputPrice}
              </span>
              <div className='text-muted-foreground/50 text-[10px]'>
                / {tokenUnitLabel} tokens
              </div>
            </div>
          )
        }

        const price = stripTrailingZeros(
          formatRequestPrice(
            model,
            showRechargePrice,
            priceRate,
            usdExchangeRate
          )
        )

        return (
          <div className='min-w-[100px]'>
            <span className='font-mono text-sm tabular-nums'>{price}</span>
            <div className='text-muted-foreground/50 text-[10px]'>
              / {t('request')}
            </div>
          </div>
        )
      },
      size: 180,
      enableSorting: false,
    },

    // Cached price column
    {
      id: 'cached_price',
      meta: { label: t('Cached') },
      header: t('Cached'),
      cell: ({ row }) => {
        const model = row.original
        const dynamicSummary = getDynamicPricingSummary(model, {
          tokenUnit,
          showRechargePrice,
          priceRate,
          usdExchangeRate,
          groupRatioMultiplier: getDynamicDisplayGroupRatio(model),
        })

        if (dynamicSummary) {
          if (dynamicSummary.isSpecialExpression) {
            return (
              <span className='text-muted-foreground/50 text-xs'>
                {t('Special billing expression')}
              </span>
            )
          }

          const cacheEntry = dynamicSummary.entries.find(
            (entry) => entry.field === 'cacheReadPrice'
          )
          if (!cacheEntry) {
            return <span className='text-muted-foreground/30 text-xs'>—</span>
          }

          return (
            <div className='min-w-[80px]'>
              <span className='font-mono text-sm tabular-nums'>
                {stripTrailingZeros(cacheEntry.formatted)}
              </span>
              <div className='text-muted-foreground/50 text-[10px]'>
                / {tokenUnitLabel}
              </div>
            </div>
          )
        }

        const isTokenBased = isTokenBasedModel(model)

        if (!isTokenBased || model.cache_ratio == null) {
          return <span className='text-muted-foreground/30 text-xs'>—</span>
        }

        const cachedPrice = stripTrailingZeros(
          formatPrice(
            model,
            'cache',
            tokenUnit,
            showRechargePrice,
            priceRate,
            usdExchangeRate
          )
        )

        return (
          <div className='min-w-[80px]'>
            <span className='font-mono text-sm tabular-nums'>
              {cachedPrice}
            </span>
            <div className='text-muted-foreground/50 text-[10px]'>
              / {tokenUnitLabel}
            </div>
          </div>
        )
      },
      size: 110,
      enableSorting: false,
    },

    // Vendor column
    {
      accessorKey: 'vendor_name',
      meta: { label: t('Vendor') },
      header: t('Vendor'),
      cell: ({ row }) => {
        const model = row.original
        if (!model.vendor_name) {
          return <span className='text-muted-foreground/50 text-xs'>—</span>
        }
        const vendorIcon = model.vendor_icon
          ? getLobeIcon(model.vendor_icon, 12)
          : null
        return (
          <span className='flex items-center gap-1.5'>
            {vendorIcon}
            <StatusBadge
              label={model.vendor_name}
              autoColor={model.vendor_name}
              size='sm'
              copyable={false}
            />
          </span>
        )
      },
      size: 130,
      enableSorting: false,
    },

    // Tags column
    {
      accessorKey: 'tags',
      meta: { label: t('Tags') },
      header: t('Tags'),
      cell: ({ row }) => {
        const tags = parseTags(row.original.tags)
        if (tags.length === 0) {
          return <span className='text-muted-foreground/50 text-xs'>—</span>
        }

        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger render={<div />}>
                {renderLimitedTags(tags, 2)}
              </TooltipTrigger>
              {tags.length > 2 && (
                <TooltipContent side='top' className='max-w-[280px] p-2'>
                  <span className='text-xs'>{tags.join(', ')}</span>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        )
      },
      size: 140,
      enableSorting: false,
    },

    // Endpoints column
    {
      accessorKey: 'supported_endpoint_types',
      meta: { label: t('Endpoints') },
      header: t('Endpoints'),
      cell: ({ row }) => {
        const endpoints = row.original.supported_endpoint_types || []
        if (endpoints.length === 0) {
          return <span className='text-muted-foreground/50 text-xs'>—</span>
        }

        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger render={<div />}>
                {renderLimitedTags(endpoints, 2)}
              </TooltipTrigger>
              {endpoints.length > 2 && (
                <TooltipContent side='top' className='max-w-[280px] p-2'>
                  <span className='text-xs'>{endpoints.join(', ')}</span>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        )
      },
      size: 130,
      enableSorting: false,
    },

    // Enable Groups column
    {
      accessorKey: 'enable_groups',
      meta: { label: t('Groups') },
      header: t('Groups'),
      cell: ({ row }) => {
        const groups = row.original.enable_groups || []
        if (groups.length === 0) {
          return <span className='text-muted-foreground/50 text-xs'>—</span>
        }

        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger render={<div />}>
                {renderLimitedGroupBadges(groups, 2)}
              </TooltipTrigger>
              {groups.length > 2 && (
                <TooltipContent side='top' className='max-w-[280px] p-2'>
                  <div className='flex flex-wrap gap-1'>
                    {groups.map((group) => (
                      <GroupBadge key={group} group={group} size='sm' />
                    ))}
                  </div>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        )
      },
      size: 130,
      enableSorting: false,
    },
  ]
}
