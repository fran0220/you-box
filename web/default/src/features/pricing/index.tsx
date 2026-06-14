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
  LoadingSkeleton,
  EmptyState,
  SearchBar,
  PricingTable,
  PricingSidebar,
  PricingToolbar,
  ModelCardGrid,
  ModelDetailsDrawer,
} from './components'
import { EXCLUDED_GROUPS, VIEW_MODES } from './constants'
import { useFavorites } from './hooks/use-favorites'
import { useFilters } from './hooks/use-filters'
import { usePricingData } from './hooks/use-pricing-data'

export function Pricing() {
  const { t } = useTranslation()
  const reduceMotion = useReducedMotion()
  const [selectedModelName, setSelectedModelName] = useState<string | null>(
    null
  )
  // Favorites filter (R2-B14 #1): local-only star set; the toggle lives in
  // the toolbar and narrows whatever the regular filters produced. Table
  // view intentionally has no per-row star (cards are the favoriting
  // surface; the table stays a dense comparison grid).
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const { favorites, isFavorite } = useFavorites()

  const {
    models,
    vendors,
    groupRatio,
    usableGroup,
    endpointMap,
    autoGroups,
    isLoading,
    priceRate,
    usdExchangeRate,
  } = usePricingData()

  const {
    searchInput,
    sortBy,
    vendorFilter,
    groupFilter,
    quotaTypeFilter,
    endpointTypeFilter,
    modalityFilter,
    tagFilter,
    tokenUnit,
    viewMode,
    showRechargePrice,
    setSearchInput,
    setSortBy,
    setVendorFilter,
    setGroupFilter,
    setQuotaTypeFilter,
    setEndpointTypeFilter,
    setModalityFilter,
    setTagFilter,
    setTokenUnit,
    setViewMode,
    setShowRechargePrice,
    filteredModels,
    hasActiveFilters,
    activeFilterCount,
    availableTags,
    clearFilters,
    clearSearch,
  } = useFilters(models || [])

  const handleModelClick = useCallback((modelName: string) => {
    setSelectedModelName(modelName)
  }, [])

  const selectedModel = useMemo(
    () =>
      selectedModelName
        ? (models || []).find(
            (model) => model.model_name === selectedModelName
          ) || null
        : null,
    [models, selectedModelName]
  )

  const availableGroups = useMemo(
    () =>
      Object.keys(usableGroup || {}).filter(
        (g) => !EXCLUDED_GROUPS.includes(g)
      ),
    [usableGroup]
  )

  const handleClearAll = useCallback(() => {
    clearFilters()
    clearSearch()
  }, [clearFilters, clearSearch])

  const displayedModels = useMemo(
    () =>
      showFavoritesOnly
        ? filteredModels.filter((model) => isFavorite(model.model_name))
        : filteredModels,
    [filteredModels, isFavorite, showFavoritesOnly]
  )

  const renderPricingContent = () => {
    if (showFavoritesOnly && displayedModels.length === 0) {
      return (
        <div className='flex min-h-[320px] flex-col items-center justify-center rounded-lg border border-dashed px-6 py-12 text-center'>
          <Star className='text-muted-foreground/40 mb-3 size-10' />
          <h3 className='text-foreground mb-1 text-base font-semibold'>
            {t('No favorite models yet')}
          </h3>
          <p className='text-muted-foreground mb-5 max-w-xs text-sm'>
            {favorites.size === 0
              ? t('Tap the star on a model card to pin it here.')
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

    if (filteredModels.length === 0) {
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
          onModelClick={handleModelClick}
          priceRate={priceRate}
          usdExchangeRate={usdExchangeRate}
          tokenUnit={tokenUnit}
          showRechargePrice={showRechargePrice}
        />
      )
    }

    return (
      <PricingTable
        models={displayedModels}
        priceRate={priceRate}
        usdExchangeRate={usdExchangeRate}
        tokenUnit={tokenUnit}
        showRechargePrice={showRechargePrice}
        onModelClick={handleModelClick}
      />
    )
  }

  if (isLoading) {
    return (
      <PublicLayout showMainContainer={false}>
        <div className='mx-auto w-full max-w-[1800px] px-3 pt-16 pb-8 sm:px-6 sm:pt-20 sm:pb-10 xl:px-8'>
          <LoadingSkeleton viewMode={viewMode} />
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout showMainContainer={false}>
      <div className='relative'>
        <div
          aria-hidden
          className='pointer-events-none absolute -top-48 left-1/2 size-[560px] -translate-x-1/2 rounded-full blur-[10px]'
          style={{
            background:
              'radial-gradient(circle, color-mix(in oklch, var(--brand) 14%, transparent), transparent 62%)',
          }}
        />
        <PageTransition className='relative mx-auto w-full max-w-[1800px] px-3 pt-16 pb-8 sm:px-6 sm:pt-20 sm:pb-10 xl:px-8'>
          <header className='mx-auto mb-5 max-w-3xl pt-5 text-center sm:mb-10 sm:pt-10'>
            <p className='yb-eyebrow mb-3'>
              {'// '}
              {t('This site currently has {{count}} models enabled', {
                count: models?.length || 0,
              })}
            </p>
            <h1 className='font-display text-[clamp(2rem,5vw,3.25rem)] leading-[1.08] font-bold tracking-[-0.035em]'>
              {t('Model Square')}
            </h1>
            <p className='text-muted-foreground/60 mx-auto mt-2 max-w-2xl text-xs leading-relaxed sm:text-sm'>
              {t(
                'Discover curated AI models, compare pricing and capabilities, and choose the right model for every scenario.'
              )}
            </p>
            <SearchBar
              value={searchInput}
              onChange={setSearchInput}
              onClear={clearSearch}
              placeholder={t(
                'Search model name, provider, endpoint, or tag...'
              )}
              className='mx-auto mt-4 max-w-2xl sm:mt-6'
            />
            <div className='mt-3 flex justify-center'>
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
            </div>
          </header>

          <div className='grid gap-4 xl:grid-cols-[330px_minmax(0,1fr)]'>
            <PricingSidebar
              quotaTypeFilter={quotaTypeFilter}
              endpointTypeFilter={endpointTypeFilter}
              modalityFilter={modalityFilter}
              vendorFilter={vendorFilter}
              groupFilter={groupFilter}
              tagFilter={tagFilter}
              onQuotaTypeChange={setQuotaTypeFilter}
              onEndpointTypeChange={setEndpointTypeFilter}
              onModalityChange={setModalityFilter}
              onVendorChange={setVendorFilter}
              onGroupChange={setGroupFilter}
              onTagChange={setTagFilter}
              vendors={vendors || []}
              groups={availableGroups}
              groupRatios={groupRatio}
              tags={availableTags}
              models={models || []}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={clearFilters}
              className='hover-scrollbar sticky top-4 hidden max-h-[calc(100dvh-2rem)] self-start overflow-y-auto xl:block'
            />

            <main className='min-w-0 space-y-4'>
              <PricingToolbar
                filteredCount={displayedModels.length}
                totalCount={models?.length}
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
                quotaTypeFilter={quotaTypeFilter}
                endpointTypeFilter={endpointTypeFilter}
                modalityFilter={modalityFilter}
                vendorFilter={vendorFilter}
                groupFilter={groupFilter}
                tagFilter={tagFilter}
                onQuotaTypeChange={setQuotaTypeFilter}
                onEndpointTypeChange={setEndpointTypeFilter}
                onModalityChange={setModalityFilter}
                onVendorChange={setVendorFilter}
                onGroupChange={setGroupFilter}
                onTagChange={setTagFilter}
                vendors={vendors || []}
                groups={availableGroups}
                groupRatios={groupRatio}
                tags={availableTags}
                models={models || []}
                hasActiveFilters={hasActiveFilters}
                activeFilterCount={activeFilterCount}
                onClearFilters={clearFilters}
              />

              {/* Crossfade card ↔ table on view switch (keyed on viewMode so
                  it fires on switch, not on every search/filter change). */}
              <m.div
                key={viewMode}
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={
                  reduceMotion ? { duration: 0 } : MOTION_TRANSITION.fast
                }
              >
                {renderPricingContent()}
              </m.div>
            </main>
          </div>

          {selectedModel && (
            <ModelDetailsDrawer
              open={Boolean(selectedModel)}
              onOpenChange={(open) => {
                if (!open) setSelectedModelName(null)
              }}
              model={selectedModel}
              groupRatio={groupRatio || {}}
              usableGroup={usableGroup || {}}
              endpointMap={
                (endpointMap as Record<
                  string,
                  { path?: string; method?: string }
                >) || {}
              }
              autoGroups={autoGroups || []}
              priceRate={priceRate ?? 1}
              usdExchangeRate={usdExchangeRate ?? 1}
              tokenUnit={tokenUnit}
              showRechargePrice={showRechargePrice}
            />
          )}
        </PageTransition>
      </div>
    </PublicLayout>
  )
}
