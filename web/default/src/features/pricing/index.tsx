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
import { PublicLayout } from '@/components/layout'
import { PageTransition } from '@/components/page-transition'
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
    contextRange,
    promptPriceRange,
    setSearchInput,
    setSortBy,
    setContextRange,
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
    facetState,
    toggleFacetValue,
    vendorIcons,
    groupRatios: groupRatio,
    contextRange,
    promptPriceRange,
    priceCeiling,
    onContextRangeChange: setContextRange,
    onPromptPriceRangeChange: setPromptPriceRange,
    hasActiveFilters,
    onClearFilters: clearFilters,
  }

  const renderPricingContent = () => {
    if (showFavoritesOnly && displayedModels.length === 0) {
      return (
        <div className='flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed px-6 py-12 text-center'>
          <Star className='text-muted-foreground/40 mb-3 size-10' />
          <h3 className='text-foreground mb-1 text-base font-semibold'>
            {t('No favorite models yet')}
          </h3>
          <p className='text-muted-foreground mb-5 max-w-xs text-sm'>
            {favorites.size === 0
              ? t('Tap the star on a model to pin it here.')
              : t('No favorites match your current filters.')}
          </p>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setShowFavoritesOnly(false)}
          >
            {t('Show all models')}
          </Button>
        </div>
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
      <PublicLayout showMainContainer={false}>
        <div className='mx-auto w-full max-w-[1600px] px-3 pt-8 pb-8 sm:px-6 sm:pt-10 xl:px-8'>
          <LoadingSkeleton viewMode={viewMode} />
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout showMainContainer={false}>
      <PageTransition className='mx-auto w-full max-w-[1600px] px-3 pt-8 pb-10 sm:px-6 sm:pt-10 xl:px-8'>
        {/* Slim, left-aligned header */}
        <header className='mb-4 flex flex-wrap items-end justify-between gap-3'>
          <div>
            <h1 className='font-display text-2xl font-bold tracking-[-0.02em] sm:text-3xl'>
              {t('Models')}
            </h1>
            <p className='text-muted-foreground mt-1 text-sm'>
              {t('{{count}} models from {{vendors}} providers', {
                count: models.length,
                vendors: vendors.length,
              })}
            </p>
          </div>
          <Button
            render={
              <Link to='/pricing/compare' search={{ models: undefined }} />
            }
            variant='outline'
            size='sm'
            className='gap-1.5'
          >
            <Scale className='size-4' />
            {t('Compare models')}
          </Button>
        </header>

        {/* Sticky control strip: search + toolbar + pills */}
        <div className='bg-background/80 supports-[backdrop-filter]:bg-background/70 sticky top-0 z-10 -mx-3 mb-4 space-y-2.5 px-3 py-2.5 backdrop-blur sm:-mx-6 sm:px-6 xl:-mx-8 xl:px-8'>
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
            className='hover-scrollbar sticky top-20 hidden max-h-[calc(100dvh-6rem)] self-start overflow-y-auto pr-1 xl:flex'
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
    </PublicLayout>
  )
}
