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
import { useCallback, useState } from 'react'
import { ArrowUpDown, Check, Filter, Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  sideDrawerContentClassName,
  sideDrawerFormClassName,
  sideDrawerHeaderClassName,
} from '@/components/drawer-layout-classes'
import { SegmentedControl } from '@/components/patterns'
import {
  SORT_OPTION_ORDER,
  getSortLabels,
  type FilterSection,
  type SortOption,
} from '../constants'
import type { EnrichedPricingModel, PricingVendor, TokenUnit } from '../types'
import { PricingSidebar } from './pricing-sidebar'

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
  activeFilterCount: number
  // The filter Sheet hosts the full facet sidebar — pass the contract through.
  models: EnrichedPricingModel[]
  facetState: Record<FilterSection, string[]>
  toggleFacetValue: (facet: FilterSection, value: string) => void
  vendorIcons: Record<string, string | undefined>
  groupRatios?: Record<string, number>
  vendors: PricingVendor[]
  promptPriceRange: [number, number]
  priceCeiling: number
  onPromptPriceRangeChange: (value: [number, number]) => void
  hasActiveFilters: boolean
  onClearFilters: () => void
}

export function PricingToolbar(props: PricingToolbarProps) {
  const { t } = useTranslation()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const sortLabels = getSortLabels(t)

  const handleTokenUnitChange = useCallback(
    (value: string) => props.onTokenUnitChange(value as TokenUnit),
    [props]
  )

  const handleRechargePriceChange = useCallback(
    (value: string) => props.onRechargePriceChange(value === 'recharge'),
    [props]
  )

  return (
    <div className='flex flex-wrap items-center gap-2'>
      <Button
        type='button'
        variant='outline'
        size='sm'
        onClick={() => setFiltersOpen(true)}
        className='h-8 gap-1.5 px-3 text-xs'
      >
        <Filter className='size-3.5' />
        {t('Filters')}
        {props.activeFilterCount > 0 && (
          <Badge className='ml-0.5 size-4 justify-center p-0 text-[10px]'>
            {props.activeFilterCount}
          </Badge>
        )}
      </Button>

      <button
        type='button'
        onClick={() => props.onShowFavoritesOnlyChange(!props.showFavoritesOnly)}
        aria-pressed={props.showFavoritesOnly}
        className={cn(
          'inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors',
          props.showFavoritesOnly
            ? 'border-brand-border/50 bg-brand-subtle text-brand'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted bg-muted/60'
        )}
      >
        <Star
          className={cn('size-3.5', props.showFavoritesOnly && 'fill-current')}
          aria-hidden='true'
        />
        {t('Favorites')}
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='h-8 gap-1.5 px-3 text-xs'
            />
          }
        >
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

      {/* Filter Sheet: full facet sidebar + display options (all breakpoints) */}
      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent
          side='right'
          className={sideDrawerContentClassName('sm:max-w-md')}
        >
          <SheetHeader className={sideDrawerHeaderClassName()}>
            <SheetTitle>{t('Filters')}</SheetTitle>
            <SheetDescription>
              {t('Refine the catalog by provider, model type, price, and more.')}
            </SheetDescription>
          </SheetHeader>
          <div className={sideDrawerFormClassName('gap-0')}>
            <div className='border-border/60 mb-4 flex flex-col gap-3 border-b pb-4'>
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
                  onChange={handleRechargePriceChange}
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
                  onChange={handleTokenUnitChange}
                  ariaLabel={t('Token unit')}
                />
              </div>
            </div>
            <PricingSidebar
              models={props.models}
              vendors={props.vendors}
              facetState={props.facetState}
              toggleFacetValue={props.toggleFacetValue}
              vendorIcons={props.vendorIcons}
              groupRatios={props.groupRatios}
              promptPriceRange={props.promptPriceRange}
              priceCeiling={props.priceCeiling}
              onPromptPriceRangeChange={props.onPromptPriceRangeChange}
              hasActiveFilters={props.hasActiveFilters}
              onClearFilters={props.onClearFilters}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
