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
import { useMemo, useState, useEffect } from 'react'
import { ArrowRight, ExternalLink, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getCurrencyDisplay } from '@/lib/currency'
import { formatNumber } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Chip,
  ChipGroup,
  CurrencyInput,
  Eyebrow,
  InlineAlert,
  MonoInput,
  Panel,
  PanelBody,
  PanelHeader,
} from '@/components/patterns'
import {
  formatCreemPrice,
  formatCurrency,
  getDiscountLabel,
  getPaymentIcon,
  getMinTopupAmount,
  calculatePresetPricing,
} from '../lib'
import type {
  PaymentMethod,
  PresetAmount,
  TopupInfo,
  CreemProduct,
  WaffoPayMethod,
} from '../types'

interface RechargeFormCardProps {
  topupInfo: TopupInfo | null
  presetAmounts: PresetAmount[]
  selectedPreset: number | null
  onSelectPreset: (preset: PresetAmount) => void
  topupAmount: number
  onTopupAmountChange: (amount: number) => void
  paymentAmount: number
  calculating: boolean
  onPaymentMethodSelect: (method: PaymentMethod) => void
  /** Updates the preview payment method (no payment is initiated). */
  onPaymentMethodChange?: (method: PaymentMethod) => void
  paymentLoading: string | null
  redemptionCode: string
  onRedemptionCodeChange: (code: string) => void
  onRedeem: () => void
  redeeming: boolean
  topupLink?: string
  loading?: boolean
  priceRatio?: number
  usdExchangeRate?: number
  creemProducts?: CreemProduct[]
  enableCreemTopup?: boolean
  onCreemProductSelect?: (product: CreemProduct) => void
  enableWaffoTopup?: boolean
  waffoPayMethods?: WaffoPayMethod[]
  waffoMinTopup?: number
  onWaffoMethodSelect?: (method: WaffoPayMethod, index: number) => void
  enableWaffoPancakeTopup?: boolean
}

/** Resolved selection behind the `pay with` chip group. */
type PaySelection =
  | { kind: 'method'; method: PaymentMethod }
  | { kind: 'waffo'; method: WaffoPayMethod; index: number }
  | { kind: 'creem'; product: CreemProduct }

/**
 * Add credits panel (r2-B3 section 3): preset amount chips +
 * CurrencyInput + `// pay with` chip group + amount-linked CTA. Chip
 * selection only stages the method locally; the CTA triggers the
 * existing payment flows (confirm dialog / Creem dialog / Waffo).
 */
export function RechargeFormCard({
  topupInfo,
  presetAmounts,
  selectedPreset,
  onSelectPreset,
  topupAmount,
  onTopupAmountChange,
  paymentAmount,
  calculating,
  onPaymentMethodSelect,
  onPaymentMethodChange,
  paymentLoading,
  redemptionCode,
  onRedemptionCodeChange,
  onRedeem,
  redeeming,
  topupLink,
  loading,
  priceRatio = 1,
  usdExchangeRate = 1,
  creemProducts,
  enableCreemTopup,
  onCreemProductSelect,
  enableWaffoTopup,
  waffoPayMethods,
  waffoMinTopup,
  onWaffoMethodSelect,
  enableWaffoPancakeTopup,
}: RechargeFormCardProps) {
  const { t } = useTranslation()
  const [localAmount, setLocalAmount] = useState(topupAmount.toString())
  const [selectedPay, setSelectedPay] = useState<string | null>(null)

  useEffect(() => {
    setLocalAmount(topupAmount.toString())
  }, [topupAmount])

  // Site currency symbol/code for amount displays (single-currency site:
  // the currency slot renders a static code label).
  const { symbol: currencySymbol, code: currencyCode } = useMemo(() => {
    const { meta } = getCurrencyDisplay()
    if (meta.kind === 'currency') {
      return { symbol: meta.symbol, code: meta.currencyCode }
    }
    if (meta.kind === 'custom') {
      return { symbol: meta.symbol, code: meta.symbol }
    }
    return { symbol: '$', code: 'USD' }
  }, [])

  const handleAmountChange = (value: string) => {
    setLocalAmount(value)
    const numValue = parseInt(value) || 0
    if (numValue >= 0) {
      onTopupAmountChange(numValue)
    }
  }

  const hasConfigurableTopup =
    topupInfo?.enable_online_topup ||
    topupInfo?.enable_stripe_topup ||
    enableWaffoTopup ||
    enableWaffoPancakeTopup
  const hasAnyTopup = hasConfigurableTopup || enableCreemTopup
  const standardMethods = useMemo(
    () => (hasConfigurableTopup ? (topupInfo?.pay_methods ?? []) : []),
    [hasConfigurableTopup, topupInfo?.pay_methods]
  )
  const waffoMethods = useMemo(
    () =>
      hasConfigurableTopup && enableWaffoTopup && onWaffoMethodSelect
        ? (waffoPayMethods ?? [])
        : [],
    [
      hasConfigurableTopup,
      enableWaffoTopup,
      onWaffoMethodSelect,
      waffoPayMethods,
    ]
  )
  const creemItems = useMemo(
    () =>
      enableCreemTopup && onCreemProductSelect ? (creemProducts ?? []) : [],
    [enableCreemTopup, onCreemProductSelect, creemProducts]
  )
  const hasAnyPayChips =
    standardMethods.length > 0 ||
    waffoMethods.length > 0 ||
    creemItems.length > 0
  const minTopup = getMinTopupAmount(topupInfo)
  const redemptionEnabled = topupInfo?.enable_redemption !== false

  const isMethodBelowMin = (method: PaymentMethod) =>
    (method.min_topup || 0) > topupAmount
  const isWaffoBelowMin = () => (waffoMinTopup || 0) > topupAmount

  const selection = useMemo<PaySelection | null>(() => {
    if (!selectedPay) return null
    if (selectedPay.startsWith('method:')) {
      const type = selectedPay.slice('method:'.length)
      const method = standardMethods.find((m) => m.type === type)
      return method ? { kind: 'method', method } : null
    }
    if (selectedPay.startsWith('waffo:')) {
      const index = Number(selectedPay.slice('waffo:'.length))
      const method = waffoMethods[index]
      return method ? { kind: 'waffo', method, index } : null
    }
    if (selectedPay.startsWith('creem:')) {
      const productId = selectedPay.slice('creem:'.length)
      const product = creemItems.find((p) => p.productId === productId)
      return product ? { kind: 'creem', product } : null
    }
    return null
  }, [selectedPay, standardMethods, waffoMethods, creemItems])

  const handlePayChange = (value: string) => {
    setSelectedPay(value)
    // Refresh the payment-amount preview for standard gateways (Stripe
    // and epay rates differ); no payment is initiated here.
    if (value.startsWith('method:')) {
      const type = value.slice('method:'.length)
      const method = standardMethods.find((m) => m.type === type)
      if (method) {
        onPaymentMethodChange?.(method)
      }
    }
  }

  const selectionBelowMin =
    selection?.kind === 'method'
      ? isMethodBelowMin(selection.method) || topupAmount < minTopup
      : selection?.kind === 'waffo'
        ? isWaffoBelowMin()
        : false
  const ctaDisabled = !selection || !!paymentLoading || selectionBelowMin

  const ctaAmount =
    selection?.kind === 'creem'
      ? formatCreemPrice(selection.product.price, selection.product.currency)
      : `${currencySymbol}${formatNumber(topupAmount * usdExchangeRate)}`

  const handleCtaClick = () => {
    if (!selection) return
    if (selection.kind === 'method') {
      onPaymentMethodSelect(selection.method)
    } else if (selection.kind === 'waffo') {
      onWaffoMethodSelect?.(selection.method, selection.index)
    } else {
      onCreemProductSelect?.(selection.product)
    }
  }

  if (loading) {
    return (
      <Panel>
        <PanelHeader className='justify-start'>
          <Skeleton className='h-5 w-32' />
        </PanelHeader>
        <PanelBody className='space-y-5'>
          <div className='flex flex-wrap gap-2.5'>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className='h-[52px] w-24 rounded-md' />
            ))}
          </div>
          <Skeleton className='h-9 w-full' />
          <div className='space-y-2.5'>
            <Skeleton className='h-3 w-20' />
            <div className='flex flex-wrap gap-2.5'>
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className='h-9 w-28 rounded-md' />
              ))}
            </div>
          </div>
          <Skeleton className='h-9 w-full' />
          <div className='border-divider space-y-2.5 border-t pt-5'>
            <Skeleton className='h-3 w-24' />
            <div className='flex gap-2'>
              <Skeleton className='h-9 flex-1' />
              <Skeleton className='h-9 w-20' />
            </div>
          </div>
        </PanelBody>
      </Panel>
    )
  }

  return (
    <Panel>
      <PanelHeader title={t('Add credits')} />
      <PanelBody className='space-y-5'>
        {hasAnyTopup ? (
          <>
            {hasConfigurableTopup && (
              <>
                {presetAmounts.length > 0 && (
                  <ChipGroup
                    type='single'
                    value={
                      selectedPreset !== null ? String(selectedPreset) : null
                    }
                    onValueChange={(value) => {
                      const preset = presetAmounts.find(
                        (p) => String(p.value) === value
                      )
                      if (preset) {
                        onSelectPreset(preset)
                      }
                    }}
                    label={t('Amount')}
                  >
                    {presetAmounts.map((preset) => {
                      const discount =
                        preset.discount ||
                        topupInfo?.discount?.[preset.value] ||
                        1.0
                      const { displayValue, hasDiscount } =
                        calculatePresetPricing(
                          preset.value,
                          priceRatio,
                          discount,
                          usdExchangeRate
                        )
                      return (
                        <Chip
                          key={preset.value}
                          value={String(preset.value)}
                          size='preset'
                        >
                          {currencySymbol}
                          {formatNumber(displayValue)}
                          {hasDiscount && (
                            <span className='text-success font-mono text-[10px] font-medium tracking-normal'>
                              {getDiscountLabel(discount)}
                            </span>
                          )}
                        </Chip>
                      )
                    })}
                  </ChipGroup>
                )}

                <div className='space-y-2'>
                  <CurrencyInput
                    id='topup-amount'
                    symbol={currencySymbol}
                    currency={
                      <span className='text-muted-foreground font-mono text-xs tracking-[0.06em] uppercase'>
                        {currencyCode}
                      </span>
                    }
                    type='number'
                    min={minTopup}
                    value={localAmount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder={t('Minimum {{amount}}', { amount: minTopup })}
                    aria-label={t('Custom Amount')}
                  />
                  <div className='text-muted-foreground flex flex-wrap items-center justify-between gap-2 text-xs'>
                    <span>
                      {t('Minimum topup amount: {{amount}}', {
                        amount: minTopup,
                      })}
                    </span>
                    <span className='inline-flex items-center gap-1.5'>
                      {t('Amount to pay:')}
                      {calculating ? (
                        <Skeleton className='h-4 w-14' />
                      ) : (
                        <span className='text-foreground font-mono font-medium'>
                          {formatCurrency(paymentAmount)}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </>
            )}

            <div className='space-y-2.5'>
              <Eyebrow>{t('Pay with')}</Eyebrow>
              {hasAnyPayChips ? (
                <ChipGroup
                  type='single'
                  value={selectedPay}
                  onValueChange={handlePayChange}
                  label={t('Payment Method')}
                >
                  {standardMethods.map((method) => (
                    <Chip
                      key={`method:${method.type}`}
                      value={`method:${method.type}`}
                      disabled={isMethodBelowMin(method) || !!paymentLoading}
                    >
                      {getPaymentIcon(
                        method.type,
                        'size-4',
                        method.icon,
                        method.name
                      )}
                      {method.name}
                    </Chip>
                  ))}
                  {waffoMethods.map((method, index) => (
                    <Chip
                      key={`waffo:${index}`}
                      value={`waffo:${index}`}
                      disabled={isWaffoBelowMin() || !!paymentLoading}
                    >
                      {method.icon ? (
                        <img
                          src={method.icon}
                          alt={method.name}
                          className='size-4 object-contain'
                        />
                      ) : (
                        getPaymentIcon('waffo')
                      )}
                      {method.name}
                    </Chip>
                  ))}
                  {creemItems.map((product) => (
                    <Chip
                      key={`creem:${product.productId}`}
                      value={`creem:${product.productId}`}
                      disabled={!!paymentLoading}
                    >
                      {getPaymentIcon('creem')}
                      {product.name}
                      <span className='text-muted-foreground font-mono text-xs'>
                        {formatCreemPrice(product.price, product.currency)}
                      </span>
                    </Chip>
                  ))}
                </ChipGroup>
              ) : (
                <InlineAlert tone='warning'>
                  {t(
                    'No payment methods available. Please contact administrator.'
                  )}
                </InlineAlert>
              )}
            </div>

            {hasAnyPayChips && (
              <Button
                size='lg'
                className='w-full'
                disabled={ctaDisabled}
                onClick={handleCtaClick}
              >
                {paymentLoading ? (
                  <Loader2 className='size-4 animate-spin' />
                ) : null}
                {t('Add {{amount}}', { amount: ctaAmount })}
                <ArrowRight className='size-4' data-icon='inline-end' />
              </Button>
            )}
          </>
        ) : (
          <InlineAlert tone='info'>
            {t(
              'Online topup is not enabled. Please use redemption code or contact administrator.'
            )}
          </InlineAlert>
        )}

        {redemptionEnabled ? (
          <div className='border-divider space-y-2.5 border-t pt-5'>
            <Eyebrow>{t('Redeem code')}</Eyebrow>
            <div className='flex gap-2'>
              <MonoInput
                id='redemption-code'
                containerClassName='flex-1'
                value={redemptionCode}
                onChange={(e) => onRedemptionCodeChange(e.target.value)}
                placeholder={t('Enter your redemption code')}
                aria-label={t('Redeem code')}
              />
              <Button
                variant='outline'
                onClick={onRedeem}
                disabled={redeeming}
                className='h-9 px-4'
              >
                {redeeming && <Loader2 className='size-4 animate-spin' />}
                {t('Redeem')}
              </Button>
            </div>
            {topupLink && (
              <p className='text-muted-foreground text-xs'>
                {t('Need a redemption code?')}{' '}
                <a
                  href={topupLink}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-1 underline-offset-4 hover:underline'
                >
                  {t('Get one here')}
                  <ExternalLink className='size-3' />
                </a>
              </p>
            )}
          </div>
        ) : (
          <InlineAlert tone='warning' className='mt-1'>
            {t(
              'Redemption codes are disabled until the administrator confirms compliance terms.'
            )}
          </InlineAlert>
        )}
      </PanelBody>
    </Panel>
  )
}
