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
import { memo, useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { Copy, Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getLobeIcon } from '@/lib/lobe-icon'
import { cn } from '@/lib/utils'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { DEFAULT_TOKEN_UNIT, getModelTypeLabels } from '../constants'
import { useFavorites } from '../hooks/use-favorites'
import { isTokenBasedModel } from '../lib/model-helpers'
import { deriveModelTypes } from '../lib/model-type'
import {
  formatPrice,
  formatRequestPrice,
  stripTrailingZeros,
} from '../lib/price'
import type { EnrichedPricingModel, TokenUnit } from '../types'

export interface ModelCardProps {
  model: EnrichedPricingModel
  priceRate?: number
  usdExchangeRate?: number
  tokenUnit?: TokenUnit
  showRechargePrice?: boolean
}

/**
 * Cloudflare-catalog-style model card: identity, task badges, description,
 * price chips, and a hairline footer with favorite + copy-ID actions. The
 * whole card links to the model detail page.
 */
export const ModelCard = memo(function ModelCard(props: ModelCardProps) {
  const { t } = useTranslation()
  const { copyToClipboard } = useCopyToClipboard()
  const { isFavorite, toggleFavorite } = useFavorites()

  const model = props.model
  const tokenUnit = props.tokenUnit ?? DEFAULT_TOKEN_UNIT
  const priceRate = props.priceRate ?? 1
  const usdExchangeRate = props.usdExchangeRate ?? 1
  const showRechargePrice = props.showRechargePrice ?? false
  const tokenUnitLabel = tokenUnit === 'K' ? '1K' : '1M'

  const isTokenBased = isTokenBasedModel(model)
  const favorited = isFavorite(model.model_name)
  const iconKey = model.icon || model.vendor_icon
  const icon = iconKey ? getLobeIcon(iconKey, 24) : null
  const initial = model.model_name?.charAt(0).toUpperCase() || '?'

  const typeLabels = useMemo(() => getModelTypeLabels(t), [t])
  const modelTypes = useMemo(() => deriveModelTypes(model).slice(0, 2), [model])

  const free =
    isTokenBased &&
    Number.isFinite(model.promptPriceUsdPerM) &&
    model.promptPriceUsdPerM <= 0

  const inputPrice = isTokenBased
    ? stripTrailingZeros(
        formatPrice(
          model,
          'input',
          tokenUnit,
          showRechargePrice,
          priceRate,
          usdExchangeRate
        )
      )
    : null
  const outputPrice = isTokenBased
    ? stripTrailingZeros(
        formatPrice(
          model,
          'output',
          tokenUnit,
          showRechargePrice,
          priceRate,
          usdExchangeRate
        )
      )
    : null
  const requestPrice = !isTokenBased
    ? stripTrailingZeros(
        formatRequestPrice(model, showRechargePrice, priceRate, usdExchangeRate)
      )
    : null

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    copyToClipboard(model.model_name || '')
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(model.model_name)
  }

  return (
    <Link
      to='/pricing/$modelId'
      params={{ modelId: model.model_name }}
      search={(prev: Record<string, unknown>) => prev}
      className='group border-border bg-card hover:border-foreground/25 focus-visible:ring-ring/40 flex h-full flex-col rounded-lg border transition-colors outline-none focus-visible:ring-2'
    >
      <div className='flex-1 p-4'>
        <div className='flex items-center gap-2.5'>
          <div className='bg-muted/40 flex size-8 shrink-0 items-center justify-center rounded-md'>
            {icon || (
              <span className='text-muted-foreground text-sm font-bold'>
                {initial}
              </span>
            )}
          </div>
          <h3
            className='text-foreground min-w-0 flex-1 truncate text-[15px] leading-tight font-semibold'
            title={model.model_name}
          >
            {model.model_name}
          </h3>
        </div>

        <div className='mt-2.5 flex flex-wrap items-center gap-1.5'>
          {model.vendor_name && (
            <span className='text-muted-foreground text-xs font-medium'>
              {model.vendor_name}
            </span>
          )}
          {modelTypes.map((type) => (
            <span
              key={type}
              className='border-border/70 text-muted-foreground rounded-full border px-2 py-0.5 text-[10px] font-medium'
            >
              {typeLabels[type] ?? type}
            </span>
          ))}
          {free && (
            <span className='bg-success-subtle text-success rounded-full px-2 py-0.5 text-[10px] font-medium'>
              {t('Free')}
            </span>
          )}
        </div>

        <p className='text-muted-foreground mt-2.5 line-clamp-2 text-[13px] leading-relaxed'>
          {model.description || t('No description available.')}
        </p>

        <div className='mt-3 flex flex-wrap items-center gap-1.5 font-mono text-[11px] tabular-nums'>
          {isTokenBased ? (
            <>
              <span className='bg-muted/60 text-foreground/80 rounded px-1.5 py-0.5'>
                {inputPrice}{' '}
                <span className='text-muted-foreground/60'>
                  {t('Input')} / {tokenUnitLabel}
                </span>
              </span>
              <span className='bg-muted/60 text-foreground/80 rounded px-1.5 py-0.5'>
                {outputPrice}{' '}
                <span className='text-muted-foreground/60'>
                  {t('Output')} / {tokenUnitLabel}
                </span>
              </span>
            </>
          ) : (
            <span className='bg-muted/60 text-foreground/80 rounded px-1.5 py-0.5'>
              {requestPrice}{' '}
              <span className='text-muted-foreground/60'>/ {t('request')}</span>
            </span>
          )}
        </div>
      </div>

      <div className='border-border/60 flex items-center justify-between border-t px-4 py-2'>
        <button
          type='button'
          onClick={handleToggleFavorite}
          aria-pressed={favorited}
          aria-label={
            favorited ? t('Remove from favorites') : t('Add to favorites')
          }
          title={favorited ? t('Remove from favorites') : t('Add to favorites')}
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
          className='text-muted-foreground hover:text-foreground hover:bg-muted inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs transition-colors'
          title={t('Copy model name')}
        >
          <Copy className='size-3.5' aria-hidden='true' />
          {t('Copy ID')}
        </button>
      </div>
    </Link>
  )
})
