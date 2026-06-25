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
import { memo } from 'react'
import { Link } from '@tanstack/react-router'
import { Copy, Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getLobeIcon } from '@/lib/lobe-icon'
import { cn } from '@/lib/utils'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { Metric } from '@/components/patterns'
import { StatusBadge } from '@/components/status-badge'
import { DEFAULT_TOKEN_UNIT } from '../constants'
import { useFavorites } from '../hooks/use-favorites'
import {
  getDynamicDisplayGroupRatio,
  getDynamicPricingSummary,
} from '../lib/dynamic-price'
import { parseTags } from '../lib/filters'
import { isTokenBasedModel } from '../lib/model-helpers'
import { formatPrice, formatRequestPrice } from '../lib/price'
import type { EnrichedPricingModel, TokenUnit } from '../types'
import { ModelPerfBadge, type ModelPerfBadgeData } from './model-perf-badge'

export interface ModelCardProps {
  model: EnrichedPricingModel
  priceRate?: number
  usdExchangeRate?: number
  tokenUnit?: TokenUnit
  showRechargePrice?: boolean
  perf?: ModelPerfBadgeData
}

export const ModelCard = memo(function ModelCard(props: ModelCardProps) {
  const { t } = useTranslation()
  const { copyToClipboard } = useCopyToClipboard()
  const { isFavorite, toggleFavorite } = useFavorites()
  const tokenUnit = props.tokenUnit ?? DEFAULT_TOKEN_UNIT
  const priceRate = props.priceRate ?? 1
  const usdExchangeRate = props.usdExchangeRate ?? 1
  const showRechargePrice = props.showRechargePrice ?? false
  const isTokenBased = isTokenBasedModel(props.model)
  const tokenUnitLabel = tokenUnit === 'K' ? '1K' : '1M'
  const tags = parseTags(props.model.tags)
  const groups = props.model.enable_groups || []
  const endpoints = props.model.supported_endpoint_types || []
  const modelIconKey = props.model.icon || props.model.vendor_icon
  const modelIcon = modelIconKey ? getLobeIcon(modelIconKey, 28) : null
  const initial = props.model.model_name?.charAt(0).toUpperCase() || '?'
  const isDynamicPricing =
    props.model.billing_mode === 'tiered_expr' &&
    Boolean(props.model.billing_expr)
  const hasCachedPrice = isTokenBased && props.model.cache_ratio != null
  const dynamicSummary = isDynamicPricing
    ? getDynamicPricingSummary(props.model, {
        tokenUnit,
        showRechargePrice,
        priceRate,
        usdExchangeRate,
        groupRatioMultiplier: getDynamicDisplayGroupRatio(props.model),
      })
    : null

  const favorited = isFavorite(props.model.model_name)
  const primaryGroup = groups[0]
  const bottomTags = [...endpoints.slice(0, 2), ...tags.slice(0, 2)]
  const hiddenCount =
    Math.max(groups.length - 1, 0) +
    Math.max(endpoints.length - 2, 0) +
    Math.max(tags.length - 2, 0)

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    copyToClipboard(props.model.model_name || '')
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(props.model.model_name)
  }

  const renderPriceMetrics = () => {
    if (dynamicSummary) {
      if (dynamicSummary.isSpecialExpression) {
        return (
          <span className='min-w-0 text-xs'>
            <span className='text-warning'>
              {t('Special billing expression')}
            </span>
            <code className='text-muted-foreground/70 mt-0.5 line-clamp-1 block font-mono text-[11px] break-all'>
              {dynamicSummary.rawExpression}
            </code>
          </span>
        )
      }
      if (dynamicSummary.primaryEntries.length === 0) {
        return (
          <span className='text-muted-foreground text-xs'>
            {t('Dynamic Pricing')}
          </span>
        )
      }
      return dynamicSummary.primaryEntries.map((entry) => (
        <Metric
          key={entry.key}
          k={`${t(entry.shortLabel)} / ${tokenUnitLabel}`}
          v={entry.formatted}
        />
      ))
    }

    if (!isTokenBased) {
      return (
        <Metric
          k={t('Per request')}
          v={formatRequestPrice(
            props.model,
            showRechargePrice,
            priceRate,
            usdExchangeRate
          )}
        />
      )
    }

    return (
      <>
        <Metric
          k={`${t('Input')} / ${tokenUnitLabel}`}
          v={formatPrice(
            props.model,
            'input',
            tokenUnit,
            showRechargePrice,
            priceRate,
            usdExchangeRate
          )}
        />
        <Metric
          k={`${t('Output')} / ${tokenUnitLabel}`}
          v={formatPrice(
            props.model,
            'output',
            tokenUnit,
            showRechargePrice,
            priceRate,
            usdExchangeRate
          )}
        />
        {hasCachedPrice && (
          <Metric
            k={`${t('Cached')} / ${tokenUnitLabel}`}
            v={formatPrice(
              props.model,
              'cache',
              tokenUnit,
              showRechargePrice,
              priceRate,
              usdExchangeRate
            )}
          />
        )}
      </>
    )
  }

  return (
    <Link
      to='/pricing/$modelId'
      params={{ modelId: props.model.model_name }}
      // Retain catalog filter/sort/view/unit URL state across navigation.
      search={(prev) => prev}
      className={cn(
        'group bg-card border-border duration-base focus-visible:ring-ring/40 relative flex flex-col rounded-lg border p-3 transition-all ease-out outline-none focus-visible:ring-2 sm:p-4',
        'hover:border-brand-border hover:shadow-[var(--glow-brand)] motion-safe:hover:-translate-y-0.5'
      )}
    >
      {/* Header: icon + name + meta + hover actions (star / copy) */}
      <div className='flex items-start justify-between gap-2.5 sm:gap-3'>
        <div className='flex min-w-0 items-start gap-2.5 sm:gap-3'>
          <div className='bg-muted/40 flex size-9 shrink-0 items-center justify-center rounded-lg sm:size-10 sm:rounded-xl'>
            {modelIcon || (
              <span className='text-muted-foreground text-sm font-bold'>
                {initial}
              </span>
            )}
          </div>
          <div className='min-w-0'>
            <h3 className='text-foreground truncate font-mono text-[15px] leading-tight font-bold'>
              {props.model.model_name}
            </h3>
            <div className='mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5'>
              {props.model.vendor_name && (
                <span className='text-muted-foreground/80 text-xs'>
                  {t('by {{vendor}}', { vendor: props.model.vendor_name })}
                </span>
              )}
              {primaryGroup && (
                <span className='text-muted-foreground text-xs font-medium'>
                  {primaryGroup}
                </span>
              )}
              {isDynamicPricing && (
                <StatusBadge
                  label={t('Dynamic Pricing')}
                  variant='warning'
                  copyable={false}
                  size='sm'
                />
              )}
            </div>
          </div>
        </div>

        <div className='flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100'>
          <button
            type='button'
            onClick={handleToggleFavorite}
            aria-pressed={favorited}
            aria-label={
              favorited ? t('Remove from favorites') : t('Add to favorites')
            }
            title={
              favorited ? t('Remove from favorites') : t('Add to favorites')
            }
            className={cn(
              'rounded-md p-1.5 transition-colors',
              favorited
                ? 'text-brand hover:bg-brand-subtle'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            <Star
              className={cn('size-3.5', favorited && 'fill-current')}
              aria-hidden='true'
            />
          </button>
          <button
            type='button'
            onClick={handleCopy}
            className='text-muted-foreground hover:text-foreground hover:bg-muted rounded-md p-1.5 transition-colors'
            title={t('Copy model name')}
            aria-label={t('Copy model name')}
          >
            <Copy className='size-3.5' />
          </button>
        </div>
      </div>

      {/* Description */}
      <p className='text-muted-foreground mt-2 line-clamp-2 flex-1 text-[13px] leading-relaxed sm:mt-3 sm:min-h-[2.5rem]'>
        {props.model.description || t('No description available.')}
      </p>

      {/* Footer: price Metrics + perf summary; endpoint/tag chips below. */}
      <div className='mt-2 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-2 gap-y-1.5 sm:mt-3'>
        <div className='flex min-w-0 flex-wrap items-start gap-x-4 gap-y-1.5 sm:gap-x-5'>
          {renderPriceMetrics()}
        </div>
        <ModelPerfBadge perf={props.perf} className='row-span-2 self-start' />

        <div className='flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-0.5 sm:gap-x-3'>
          {bottomTags.map((item) => (
            <span key={item} className='text-muted-foreground/70 text-xs'>
              {item}
            </span>
          ))}
          {hiddenCount > 0 && (
            <span className='text-muted-foreground/40 text-xs'>
              +{hiddenCount}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
})
