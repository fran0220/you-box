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
import { memo, type ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { Copy, Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import {
  ModelCard as YouboxModelCard,
  type ModelCardMetric,
} from '@/components/youbox/model-card'
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

  const buildPriceMetrics = (): ModelCardMetric[] => {
    if (dynamicSummary) {
      if (dynamicSummary.isSpecialExpression) {
        return []
      }
      if (dynamicSummary.primaryEntries.length === 0) {
        return []
      }
      return dynamicSummary.primaryEntries.map((entry) => ({
        key: `${t(entry.shortLabel)} / ${tokenUnitLabel}`,
        value: entry.formatted,
      }))
    }

    if (!isTokenBased) {
      return [
        {
          key: t('Per request'),
          value: formatRequestPrice(
            props.model,
            showRechargePrice,
            priceRate,
            usdExchangeRate
          ),
        },
      ]
    }

    const metrics: ModelCardMetric[] = [
      {
        key: `${t('Input')} / ${tokenUnitLabel}`,
        value: formatPrice(
          props.model,
          'input',
          tokenUnit,
          showRechargePrice,
          priceRate,
          usdExchangeRate
        ),
      },
      {
        key: `${t('Output')} / ${tokenUnitLabel}`,
        value: formatPrice(
          props.model,
          'output',
          tokenUnit,
          showRechargePrice,
          priceRate,
          usdExchangeRate
        ),
      },
    ]
    if (hasCachedPrice) {
      metrics.push({
        key: `${t('Cached')} / ${tokenUnitLabel}`,
        value: formatPrice(
          props.model,
          'cache',
          tokenUnit,
          showRechargePrice,
          priceRate,
          usdExchangeRate
        ),
      })
    }
    return metrics
  }

  const priceMetrics = buildPriceMetrics()

  const authorLine = [
    props.model.vendor_name
      ? t('by {{vendor}}', { vendor: props.model.vendor_name })
      : null,
    primaryGroup,
  ]
    .filter(Boolean)
    .join(' · ')

  const dynamicBadge = isDynamicPricing ? (
    <StatusBadge
      label={t('Dynamic Pricing')}
      variant='warning'
      copyable={false}
      size='sm'
    />
  ) : null

  const trailingActions = (
    <div className='flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100'>
      <button
        type='button'
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          toggleFavorite(props.model.model_name)
        }}
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
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          copyToClipboard(props.model.model_name || '')
        }}
        className='text-muted-foreground hover:text-foreground hover:bg-muted rounded-md p-1.5 transition-colors'
        title={t('Copy model name')}
        aria-label={t('Copy model name')}
      >
        <Copy className='size-3.5' aria-hidden='true' />
      </button>
    </div>
  )

  const footerExtras: ReactNode = (
    <>
      {dynamicSummary?.isSpecialExpression && (
        <div className='mt-3 min-w-0 text-xs'>
          <span className='text-warning'>{t('Special billing expression')}</span>
          <code className='text-muted-foreground/70 mt-0.5 line-clamp-1 block font-mono text-[11px] break-all'>
            {dynamicSummary.rawExpression}
          </code>
        </div>
      )}
      {dynamicSummary &&
        !dynamicSummary.isSpecialExpression &&
        dynamicSummary.primaryEntries.length === 0 && (
          <p className='text-muted-foreground mt-3 text-xs'>
            {t('Dynamic Pricing')}
          </p>
        )}
      <div className='mt-3 flex min-w-0 flex-wrap items-center justify-between gap-2'>
        <div className='flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-0.5'>
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
        <ModelPerfBadge perf={props.perf} />
      </div>
    </>
  )

  return (
    <Link
      to='/pricing/$modelId'
      params={{ modelId: props.model.model_name }}
      search={(prev: Record<string, unknown>) => prev}
      className='group block h-full rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]'
    >
      <YouboxModelCard
        interactive
        className='h-full'
        avatarFallback={initial}
        name={
          <span className='truncate font-mono text-[15px] font-bold'>
            {props.model.model_name}
          </span>
        }
        author={authorLine || undefined}
        badge={dynamicBadge}
        description={
          props.model.description || t('No description available.')
        }
        metrics={priceMetrics.length > 0 ? priceMetrics : undefined}
        trailing={trailingActions}
      >
        {footerExtras}
      </YouboxModelCard>
    </Link>
  )
})
