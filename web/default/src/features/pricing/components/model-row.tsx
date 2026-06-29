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
import { DEFAULT_TOKEN_UNIT } from '../constants'
import { useFavorites } from '../hooks/use-favorites'
import { isTokenBasedModel } from '../lib/model-helpers'
import { formatPrice, formatRequestPrice, stripTrailingZeros } from '../lib/price'
import type { EnrichedPricingModel, TokenUnit } from '../types'

export interface ModelRowProps {
  model: EnrichedPricingModel
  priceRate?: number
  usdExchangeRate?: number
  tokenUnit?: TokenUnit
  showRechargePrice?: boolean
}

export const ModelRow = memo(function ModelRow(props: ModelRowProps) {
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
  const icon = iconKey ? getLobeIcon(iconKey, 28) : null
  const initial = model.model_name?.charAt(0).toUpperCase() || '?'

  const free =
    isTokenBased &&
    Number.isFinite(model.promptPriceUsdPerM) &&
    model.promptPriceUsdPerM <= 0

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

  return (
    <Link
      to='/pricing/$modelId'
      params={{ modelId: model.model_name }}
      search={(prev: Record<string, unknown>) => prev}
      className={cn(
        'group hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:ring-ring/40 relative block border-b px-3 py-3.5 transition-colors outline-none focus-visible:ring-2 sm:px-4'
      )}
    >
      <div className='flex items-start gap-3 sm:gap-4'>
        <div className='bg-muted/40 mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg'>
          {icon || (
            <span className='text-muted-foreground text-sm font-bold'>
              {initial}
            </span>
          )}
        </div>

        <div className='min-w-0 flex-1'>
          <div className='flex flex-wrap items-center gap-x-2 gap-y-0.5'>
            <h3 className='text-foreground truncate text-[15px] leading-tight font-semibold'>
              {model.model_name}
            </h3>
            {model.vendor_name && (
              <span className='text-muted-foreground/80 truncate text-xs'>
                {t('by {{vendor}}', { vendor: model.vendor_name })}
              </span>
            )}
            {free && (
              <span className='bg-success-subtle text-success rounded px-1.5 py-0.5 text-[10px] font-medium'>
                {t('Free')}
              </span>
            )}
          </div>

          <p className='text-muted-foreground mt-1 line-clamp-1 text-[13px] leading-relaxed'>
            {model.description || t('No description available.')}
          </p>
        </div>

        <div className='hidden shrink-0 text-right sm:block'>
          {isTokenBased ? (
            <div className='space-y-1'>
              <div className='font-mono text-sm tabular-nums'>
                <span className='text-foreground'>{inputPrice}</span>
                <div className='text-muted-foreground/50 text-[10px]'>
                  {t('Input')} / {tokenUnitLabel}
                </div>
              </div>
              <div className='font-mono text-sm tabular-nums'>
                <span className='text-foreground'>{outputPrice}</span>
                <div className='text-muted-foreground/50 text-[10px]'>
                  {t('Output')} / {tokenUnitLabel}
                </div>
              </div>
            </div>
          ) : (
            <div className='font-mono text-sm tabular-nums'>
              <span className='text-foreground'>{requestPrice}</span>
              <div className='text-muted-foreground/50 text-[10px]'>
                / {t('request')}
              </div>
            </div>
          )}
        </div>

        <div className='flex shrink-0 items-start gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100'>
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
            <Copy className='size-3.5' aria-hidden='true' />
          </button>
        </div>
      </div>

      <div className='text-muted-foreground/80 mt-2 flex items-center gap-4 pl-12 font-mono text-xs tabular-nums sm:hidden'>
        {isTokenBased ? (
          <>
            <span>
              {inputPrice}{' '}
              <span className='text-muted-foreground/50'>
                {t('Input')} / {tokenUnitLabel}
              </span>
            </span>
            <span>
              {outputPrice}{' '}
              <span className='text-muted-foreground/50'>
                {t('Output')} / {tokenUnitLabel}
              </span>
            </span>
          </>
        ) : (
          <span>
            {requestPrice}{' '}
            <span className='text-muted-foreground/50'>/ {t('request')}</span>
          </span>
        )}
      </div>
    </Link>
  )
})
