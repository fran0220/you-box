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
import { useCallback, useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Scale, Star } from 'lucide-react'
import { m, useReducedMotion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { MOTION_TRANSITION } from '@/lib/motion'
import { Button } from '@/components/ui/button'
import { PageTransition } from '@/components/page-transition'
import { EmptyState as YouboxEmptyState } from '@/components/youbox/empty-state'
import { PageHeader } from '@/components/youbox'
import {
  EmptyState,
  LoadingSkeleton,
  ModelCardGrid,
  ModelList,
  PricingFilterPills,
  PricingSidebar,
  PricingTable,
  PricingToolbar,
  SearchBar,
} from './components'
import { VIEW_MODES, computePromptPriceCeiling } from './constants'
import { useFavorites } from './hooks/use-favorites'
import { useFilters } from './hooks/use-filters'
import { usePricingData } from './hooks/use-pricing-data'

export function Pricing() {
  const { t } = useTranslation()
  const reduceMotion = useReducedMotion()
  // Favorites filter: local-only star set; narrows whatever the regular
  // filters produced.
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const { favorites, isFavorite } = useFavorites()

  const {
    models,
    vendors,
    groupRatio,
    isLoading,
    priceRate,
    usdExchangeRate,
  } = usePricingData()

  const {
    searchInput,
    sortBy,
    tokenUnit,
    viewMode,
    showRechargePrice,
    facetState,
    toggleFacetValue,
    promptPriceRange,
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
    clearFilters,
    clearAll,
    clearSearch,
  } = useFilters(models)

  // Vendor name -> icon key, for the sidebar provider checkboxes.
  const vendorIcons = useMemo(() => {
    const map: Record<string, string | undefined> = {}
    for (const v of vendors) map[v.name] = v.icon
    return map
  }, [vendors])

  // Prompt-price slider ceiling adapts to the live catalog.
  const priceCeiling = useMemo(
    () => computePromptPriceCeiling(models.map((m) => m.promptPriceUsdPerM)),
    [models]
  )

  const displayedModels = useMemo(
    () =>
      showFavoritesOnly
        ? filteredModels.filter((model) => isFavorite(model.model_name))
        : filteredModels,
    [filteredModels, isFavorite, showFavoritesOnly]
  )

  const handleClearAll = useCallback(() => {
    clearAll()
    setShowFavoritesOnly(false)
  }, [clearAll])

  // The toolbar and sidebar share the same facet contract.
  const sidebarProps = {
    models,
    vendors,
    facetState,
    toggleFacetValue,
    vendorIcons,
    groupRatios: groupRatio,
    promptPriceRange,
    priceCeiling,
    onPromptPriceRangeChange: setPromptPriceRange,
    hasActiveFilters,
    onClearFilters: clearFilters,
  }

  const renderPricingContent = () => {
    if (showFavoritesOnly && displayedModels.length === 0) {
      return (
        <YouboxEmptyState
          icon={Star}
          title={t('No favorite models yet')}
          description={
            favorites.size === 0
              ? t('Tap the star on a model to pin it here.')
              : t('No favorites match your current filters.')
          }
          className='border-border bg-card min-h-[320px] rounded-lg border border-dashed'
          action={
            <Button
              variant='outline'
              size='sm'
              onClick={() => setShowFavoritesOnly(false)}
            >
              {t('Show all models')}
            </Button>
          }
        />
      )
    }

    if (displayedModels.length === 0) {
      return (
        <EmptyState
          searchQuery={searchInput}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={handleClearAll}
        />
      )
    }

    if (viewMode === VIEW_MODES.CARD) {
      return (
        <ModelCardGrid
          models={displayedModels}
          priceRate={priceRate}
          usdExchangeRate={usdExchangeRate}
          tokenUnit={tokenUnit}
          showRechargePrice={showRechargePrice}
        />
      )
    }

    if (viewMode === VIEW_MODES.TABLE) {
      return (
        <PricingTable
          models={displayedModels}
          priceRate={priceRate}
          usdExchangeRate={usdExchangeRate}
          tokenUnit={tokenUnit}
          showRechargePrice={showRechargePrice}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
      )
    }

    // Default: the dense, OpenRouter-style virtualized list.
    return (
      <ModelList
        models={displayedModels}
        priceRate={priceRate}
        usdExchangeRate={usdExchangeRate}
        tokenUnit={tokenUnit}
        showRechargePrice={showRechargePrice}
      />
    )
  }

  if (isLoading) {
    return (
      <PageTransition className='pb-10'>
        <LoadingSkeleton viewMode={viewMode} />
      </PageTransition>
    )
  }

  return (
    <PageTransition className='pb-10'>
        <PageHeader
          className='mb-5'
          eyebrow={t('Model Plaza')}
          title={t('Models')}
          subtitle={t('{{count}} models from {{vendors}} providers', {
            count: models.length,
            vendors: vendors.length,
          })}
          actions={
            <Button
              render={
                <Link to='/pricing/compare' search={{ models: undefined }} />
              }
              variant='outline'
              size='sm'
              className='gap-1.5'
            >
              <Scale className='size-4' aria-hidden='true' />
              {t('Compare models')}
            </Button>
          }
        />

        {/* Sticky control strip: search + toolbar + pills */}
        <div
          data-pricing-control-strip
          className='bg-background/80 supports-[backdrop-filter]:bg-background/60 border-border/60 sticky top-[var(--app-header-height,3rem)] z-10 -mx-4 mb-4 space-y-2.5 border-b px-4 py-2.5 backdrop-blur md:-mx-6 md:px-6'
        >
          <div className='flex flex-col gap-2.5 lg:flex-row lg:items-center'>
            <SearchBar
              value={searchInput}
              onChange={setSearchInput}
              onClear={clearSearch}
              placeholder={t('Search models by name, provider, or capability…')}
              className='lg:flex-1'
            />
            <PricingToolbar
              showFavoritesOnly={showFavoritesOnly}
              onShowFavoritesOnlyChange={setShowFavoritesOnly}
              sortBy={sortBy}
              onSortChange={setSortBy}
              tokenUnit={tokenUnit}
              onTokenUnitChange={setTokenUnit}
              showRechargePrice={showRechargePrice}
              onRechargePriceChange={setShowRechargePrice}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              activeFilterCount={activeFilterCount}
              {...sidebarProps}
            />
          </div>
          <PricingFilterPills
            activeFilters={activeFilters}
            searchInput={searchInput}
            onClearSearch={clearSearch}
            onClearAll={handleClearAll}
          />
        </div>

        <div className='grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]'>
          <PricingSidebar
            {...sidebarProps}
            className='hover-scrollbar sticky top-[var(--app-header-height,3rem)] hidden max-h-[calc(100dvh-var(--app-header-height,3rem)-1rem)] self-start overflow-y-auto pr-1 xl:flex'
          />

          <main className='min-w-0'>
            <div className='text-muted-foreground mb-2.5 text-sm'>
              <span className='text-foreground font-semibold tabular-nums'>
                {displayedModels.length.toLocaleString()}
              </span>{' '}
              {displayedModels.length === 1 ? t('model') : t('models')}
              {(hasActiveFilters || showFavoritesOnly) &&
                models.length > 0 && (
                  <span className='text-muted-foreground/60'>
                    {' / '}
                    {models.length.toLocaleString()}
                  </span>
                )}
            </div>
            {/* Crossfade on view switch (keyed on viewMode so it fires on
                switch, not on every search/filter change). */}
            <m.div
              key={viewMode}
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={reduceMotion ? { duration: 0 } : MOTION_TRANSITION.fast}
            >
              {renderPricingContent()}
            </m.div>
          </main>
      </div>
    </PageTransition>
  )
}
