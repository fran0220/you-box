import { useCallback, useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Scale, Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { PageTransition } from '@/components/page-transition'
import { PageHeader } from '@/components/youbox'
import { EmptyState as YouboxEmptyState } from '@/components/youbox/empty-state'
import {
  EmptyState,
  LoadingSkeleton,
  ModelGrid,
  PricingFilterPills,
  PricingToolbar,
  SearchBar,
} from './components'
import { computePromptPriceCeiling } from './constants'
import { useFavorites } from './hooks/use-favorites'
import { useFilters } from './hooks/use-filters'
import { usePricingData } from './hooks/use-pricing-data'

export function Pricing() {
  const { t } = useTranslation()
  // Favorites filter: local-only star set; narrows whatever the regular
  // filters produced.
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const { favorites, isFavorite } = useFavorites()

  const { models, vendors, groupRatio, isLoading, priceRate, usdExchangeRate } =
    usePricingData()

  const {
    searchInput,
    sortBy,
    tokenUnit,
    showRechargePrice,
    facetState,
    toggleFacetValue,
    promptPriceRange,
    setSearchInput,
    setSortBy,
    setPromptPriceRange,
    setTokenUnit,
    setShowRechargePrice,
    filteredModels,
    activeFilters,
    hasActiveFilters,
    clearAll,
    clearSearch,
  } = useFilters(models)

  // Vendor name -> icon key, for the provider facet dropdown.
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

    return (
      <ModelGrid
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
        <LoadingSkeleton />
      </PageTransition>
    )
  }

  return (
    <PageTransition className='pb-10'>
      <PageHeader
        className='mb-6'
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

      {/* Filter bar: search + one dropdown per facet (Cloudflare catalog
          pattern), active-filter pills below. */}
      <div data-pricing-control-strip className='mb-4 space-y-2.5'>
        <div className='flex flex-col gap-2.5 xl:flex-row xl:items-center'>
          <SearchBar
            value={searchInput}
            onChange={setSearchInput}
            onClear={clearSearch}
            placeholder={t('Search models by name, provider, or capability…')}
            className='xl:max-w-md xl:flex-1'
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
            models={models}
            vendors={vendors}
            facetState={facetState}
            toggleFacetValue={toggleFacetValue}
            vendorIcons={vendorIcons}
            groupRatios={groupRatio}
            promptPriceRange={promptPriceRange}
            priceCeiling={priceCeiling}
            onPromptPriceRangeChange={setPromptPriceRange}
          />
        </div>
        <PricingFilterPills
          activeFilters={activeFilters}
          searchInput={searchInput}
          onClearSearch={clearSearch}
          onClearAll={handleClearAll}
        />
      </div>

      <main className='min-w-0'>
        <div className='text-muted-foreground mb-3 text-sm'>
          {t('We found {{count}} models', {
            count: displayedModels.length,
          })}
          {(hasActiveFilters || showFavoritesOnly) && models.length > 0 && (
            <span className='text-muted-foreground/60'>
              {' / '}
              {models.length.toLocaleString()}
            </span>
          )}
        </div>
        {renderPricingContent()}
      </main>
    </PageTransition>
  )
}
