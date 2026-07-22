import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Panel, PanelBody } from '@/components/patterns'
import { getDynamicPricingSummary } from '../lib/dynamic-price'
import { isTokenBasedModel } from '../lib/model-helpers'
import { formatFixedPrice, formatGroupPrice } from '../lib/price'
import type { PricingModel, TokenUnit } from '../types'

// ----------------------------------------------------------------------------
// Spec card — display-font key numbers at the top of Overview.
// ----------------------------------------------------------------------------
//
// Shows base Input/Output (or per-request) price from GET /api/pricing only.
// Context window / max output are not in the pricing API, so they are omitted.

function SpecItem(props: {
  label: React.ReactNode
  value: React.ReactNode
  intent?: 'default' | 'warning' | 'success'
}) {
  const intent = props.intent ?? 'default'
  return (
    <div className='min-w-0'>
      <div className='text-muted-foreground truncate font-mono text-[9px] tracking-[0.06em] uppercase'>
        {props.label}
      </div>
      <div
        className={cn(
          'font-display text-foreground mt-1 truncate text-xl font-bold tracking-[-0.02em] tabular-nums',
          intent === 'warning' && 'text-warning',
          intent === 'success' && 'text-success'
        )}
      >
        {props.value}
      </div>
    </div>
  )
}

export function ModelSpecCard(props: {
  model: PricingModel
  priceRate: number
  usdExchangeRate: number
  tokenUnit: TokenUnit
  showRechargePrice: boolean
}) {
  const { t } = useTranslation()

  const tokenUnitLabel = props.tokenUnit === 'K' ? '1K' : '1M'
  const baseGroupKey = '_base'
  const baseGroupRatioMap = { [baseGroupKey]: 1 }
  const isTokenBased = isTokenBasedModel(props.model)
  const dynamicSummary = getDynamicPricingSummary(props.model, {
    tokenUnit: props.tokenUnit,
    showRechargePrice: props.showRechargePrice,
    priceRate: props.priceRate,
    usdExchangeRate: props.usdExchangeRate,
    groupRatioMultiplier: 1,
  })

  const items: {
    key: string
    label: React.ReactNode
    value: React.ReactNode
    intent?: 'default' | 'warning' | 'success'
  }[] = []

  if (dynamicSummary) {
    if (!dynamicSummary.isSpecialExpression) {
      for (const entry of dynamicSummary.primaryEntries.slice(0, 2)) {
        items.push({
          key: `price-${entry.key}`,
          label: `${t(entry.shortLabel)} / ${tokenUnitLabel}`,
          value: entry.formatted,
        })
      }
    }
  } else if (isTokenBased) {
    items.push(
      {
        key: 'price-input',
        label: `${t('Input')} / ${tokenUnitLabel}`,
        value: formatGroupPrice(
          props.model,
          baseGroupKey,
          'input',
          props.tokenUnit,
          props.showRechargePrice,
          props.priceRate,
          props.usdExchangeRate,
          baseGroupRatioMap
        ),
      },
      {
        key: 'price-output',
        label: `${t('Output')} / ${tokenUnitLabel}`,
        value: formatGroupPrice(
          props.model,
          baseGroupKey,
          'output',
          props.tokenUnit,
          props.showRechargePrice,
          props.priceRate,
          props.usdExchangeRate,
          baseGroupRatioMap
        ),
      }
    )
  } else {
    items.push({
      key: 'price-request',
      label: t('Per request'),
      value: formatFixedPrice(
        props.model,
        baseGroupKey,
        props.showRechargePrice,
        props.priceRate,
        props.usdExchangeRate,
        baseGroupRatioMap
      ),
    })
  }

  if (items.length === 0) return null

  return (
    <Panel>
      <PanelBody className='grid grid-cols-2 gap-4 sm:grid-cols-3'>
        {items.map((item) => (
          <SpecItem
            key={item.key}
            label={item.label}
            value={item.value}
            intent={item.intent}
          />
        ))}
      </PanelBody>
    </Panel>
  )
}
