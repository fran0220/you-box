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
import { useMemo } from 'react'
import { Link, useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { ArrowLeft, Boxes, Code2, Info, LayoutGrid, Play } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getLobeIcon } from '@/lib/lobe-icon'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CopyButton } from '@/components/copy-button'
import {
  DrawerBody,
  DrawerHeader,
  DrawerShell,
} from '@/components/drawer-layout'
import { PageTransition } from '@/components/page-transition'
import { DEFAULT_TOKEN_UNIT, QUOTA_TYPE_VALUES } from '../constants'
import { usePricingData } from '../hooks/use-pricing-data'
import { getDynamicPricingTiers } from '../lib/dynamic-price'
import { parseTags } from '../lib/filters'
import type { PricingModel, TokenUnit } from '../types'
import { DynamicPricingBreakdown } from './dynamic-pricing-breakdown'
import { ModelDetailsApi, ModelDetailsProviderInfo } from './model-details-api'
import { ModelDetailsApps } from './model-details-apps'
import { GroupPricingSection } from './model-details-group-pricing'
import { PriceSection } from './model-details-price'
import { ModelDetailsPerformance } from './model-details-performance'
import { ModelDetailsProviders } from './model-details-providers'
import { ModelSpecCard } from './model-details-spec-card'

// ----------------------------------------------------------------------------
// Local UI helpers
// ----------------------------------------------------------------------------

function SectionTitle(props: { children: React.ReactNode }) {
  return (
    <h2 className='text-muted-foreground mb-3 font-mono text-[11px] font-medium tracking-[0.06em] uppercase'>
      {props.children}
    </h2>
  )
}

function ModelHeader(props: {
  model: PricingModel
  showPlaygroundLink?: boolean
}) {
  const { t } = useTranslation()
  const model = props.model
  const modelIconKey = model.icon || model.vendor_icon
  const modelIcon = modelIconKey ? getLobeIcon(modelIconKey, 20) : null
  const description = model.description || model.vendor_description || null
  const tags = parseTags(model.tags)
  const isSpecialExpression =
    model.billing_mode === 'tiered_expr' &&
    Boolean(model.billing_expr) &&
    getDynamicPricingTiers(model).length === 0

  return (
    <div className='border-border border-b pb-6'>
      <div className='flex flex-wrap items-start gap-3'>
        {modelIcon ? (
          <span className='bg-surface-2 border-border flex size-11 shrink-0 items-center justify-center rounded-lg border'>
            {modelIcon}
          </span>
        ) : null}
        <div className='min-w-0 flex-1'>
          <div className='flex flex-wrap items-center gap-2'>
            <h1 className='font-mono text-xl font-bold tracking-tight text-foreground sm:text-2xl'>
              {model.model_name}
            </h1>
            <CopyButton
              value={model.model_name || ''}
              className='size-6'
              iconClassName='size-3'
              tooltip={t('Copy model name')}
              successTooltip={t('Copied!')}
              aria-label={t('Copy model name')}
            />
            {props.showPlaygroundLink && model.model_name ? (
              <Button
                variant='secondary'
                size='sm'
                className='ml-auto gap-1.5'
                render={
                  <Link
                    to='/playground'
                    search={{ model: model.model_name }}
                  />
                }
              >
                <Play className='size-3.5' aria-hidden='true' />
                {t('Open in Playground')}
              </Button>
            ) : null}
          </div>
      <div className='mt-1 flex flex-wrap items-center gap-1.5 text-xs'>
        {model.vendor_name && (
          <span className='text-muted-foreground'>{model.vendor_name}</span>
        )}
        <span className='text-muted-foreground/30'>·</span>
        <span className='text-muted-foreground/70'>
          {model.quota_type === QUOTA_TYPE_VALUES.TOKEN
            ? t('Token-based')
            : t('Per Request')}
        </span>
        {model.billing_mode === 'tiered_expr' && model.billing_expr && (
          <>
            <span className='text-muted-foreground/30'>·</span>
            <span className='text-warning bg-warning-subtle rounded px-1.5 py-0.5 text-[10px] font-medium'>
              {isSpecialExpression
                ? t('Special billing expression')
                : t('Dynamic Pricing')}
            </span>
          </>
        )}
      </div>
      {description && (
        <p className='text-muted-foreground mt-2 text-sm leading-relaxed'>
          {description}
        </p>
      )}
      {tags.length > 0 && (
        <div className='mt-2.5 flex flex-wrap gap-1.5'>
          {tags.map((tag) => (
            <span
              key={tag}
              className='bg-surface-2 text-muted-foreground border-border rounded-md border px-2 py-0.5 font-mono text-[11px] font-medium'
            >
              {tag}
            </span>
          ))}
        </div>
      )}
        </div>
      </div>
    </div>
  )
}

const TAB_VALUES = ['overview', 'providers', 'apps', 'api'] as const
type TabValue = (typeof TAB_VALUES)[number]

const TAB_META: Record<
  TabValue,
  { icon: React.ComponentType<{ className?: string }>; labelKey: string }
> = {
  overview: { icon: Info, labelKey: 'Overview' },
  providers: { icon: Boxes, labelKey: 'Providers' },
  apps: { icon: LayoutGrid, labelKey: 'Apps' },
  api: { icon: Code2, labelKey: 'API' },
}

export interface ModelDetailsContentProps {
  model: PricingModel
  groupRatio: Record<string, number>
  usableGroup: Record<string, { desc: string; ratio: number }>
  endpointMap: Record<string, { path?: string; method?: string }>
  autoGroups: string[]
  priceRate: number
  usdExchangeRate: number
  tokenUnit: TokenUnit
  showRechargePrice?: boolean
}

export function ModelDetailsContent(props: ModelDetailsContentProps) {
  const { t } = useTranslation()
  const showRechargePrice = props.showRechargePrice ?? false

  const isDynamic =
    props.model.billing_mode === 'tiered_expr' &&
    Boolean(props.model.billing_expr)

  return (
    <div className='@container/details space-y-4'>
      <ModelHeader model={props.model} showPlaygroundLink />

      <Tabs defaultValue='overview' className='gap-5'>
        <TabsList className='grid h-auto w-full grid-cols-2 gap-1 p-1 @md/details:grid-cols-4'>
          {TAB_VALUES.map((value) => {
            const Icon = TAB_META[value].icon
            return (
              <TabsTrigger
                key={value}
                value={value}
                className='h-9 min-w-0 gap-1.5 px-3 text-xs sm:text-sm'
              >
                <Icon className='size-3.5 shrink-0' aria-hidden='true' />
                <span className='truncate'>{t(TAB_META[value].labelKey)}</span>
              </TabsTrigger>
            )
          })}
        </TabsList>

        <TabsContent value='overview' className='space-y-8 outline-none'>
          <ModelSpecCard
            model={props.model}
            priceRate={props.priceRate}
            usdExchangeRate={props.usdExchangeRate}
            tokenUnit={props.tokenUnit}
            showRechargePrice={showRechargePrice}
          />

          <Card className='gap-5 p-5 shadow-sm'>
            <SectionTitle>{t('Pricing')}</SectionTitle>
            <PriceSection
              model={props.model}
              priceRate={props.priceRate}
              usdExchangeRate={props.usdExchangeRate}
              tokenUnit={props.tokenUnit}
              showRechargePrice={showRechargePrice}
            />
            {isDynamic && (
              <DynamicPricingBreakdown billingExpr={props.model.billing_expr} />
            )}
            <GroupPricingSection
              model={props.model}
              groupRatio={props.groupRatio}
              usableGroup={props.usableGroup}
              autoGroups={props.autoGroups}
              priceRate={props.priceRate}
              usdExchangeRate={props.usdExchangeRate}
              tokenUnit={props.tokenUnit}
              showRechargePrice={showRechargePrice}
            />
          </Card>

          <section className='space-y-4'>
            <SectionTitle>{t('Performance & uptime')}</SectionTitle>
            <ModelDetailsPerformance model={props.model} />
          </section>

          <ModelDetailsProviderInfo model={props.model} />
        </TabsContent>

        <TabsContent value='providers' className='outline-none'>
          <ModelDetailsProviders
            model={props.model}
            groupRatio={props.groupRatio}
            usableGroup={props.usableGroup}
            priceRate={props.priceRate}
            usdExchangeRate={props.usdExchangeRate}
            tokenUnit={props.tokenUnit}
            showRechargePrice={showRechargePrice}
          />
        </TabsContent>

        <TabsContent value='apps' className='outline-none'>
          <ModelDetailsApps model={props.model} />
        </TabsContent>

        <TabsContent value='api' className='outline-none'>
          <ModelDetailsApi model={props.model} endpointMap={props.endpointMap} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ----------------------------------------------------------------------------
// Drawer & page wrappers
// ----------------------------------------------------------------------------

export interface ModelDetailsDrawerProps extends ModelDetailsContentProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Optional quick-peek drawer. The catalog list lands clicks on the URL-driven
 * {@link ModelDetails} page, but the list may still render this drawer as a
 * fast preview. The prop signature is backward-compatible with the previous
 * implementation; internally it just wraps {@link ModelDetailsContent} on the
 * shared DrawerShell shell (size `xl`).
 */
export function ModelDetailsDrawer(props: ModelDetailsDrawerProps) {
  const { t } = useTranslation()
  const { open, onOpenChange, ...contentProps } = props

  return (
    <DrawerShell
      open={open}
      onOpenChange={onOpenChange}
      size='xl'
      ariaTitle={props.model.model_name}
      ariaDescription={t('Model details')}
    >
      <DrawerHeader
        title={props.model.model_name}
        description={t('Model details')}
        icon={
          props.model.icon || props.model.vendor_icon
            ? getLobeIcon(props.model.icon || props.model.vendor_icon || '', 18)
            : undefined
        }
      />
      <DrawerBody>
        <ModelDetailsContent {...contentProps} />
      </DrawerBody>
    </DrawerShell>
  )
}

export function ModelDetails() {
  const { t } = useTranslation()
  const { modelId } = useParams({ from: '/_public/pricing/$modelId/' })
  const search = useSearch({ from: '/_public/pricing/$modelId/' })
  const navigate = useNavigate()

  const {
    models,
    groupRatio,
    usableGroup,
    endpointMap,
    autoGroups,
    isLoading,
    priceRate,
    usdExchangeRate,
  } = usePricingData()

  const tokenUnit: TokenUnit =
    search.tokenUnit === 'K' ? 'K' : DEFAULT_TOKEN_UNIT

  const model = useMemo(() => {
    if (!models || !modelId) return null
    return models.find((m) => m.model_name === modelId) || null
  }, [models, modelId])

  const handleBack = () => {
    navigate({ to: '/pricing', search })
  }

  if (isLoading) {
    return (
      <>
        <PageTransition className='pb-10'>
          <div className='mx-auto max-w-[1180px] px-4 sm:px-7'>
            <Skeleton className='mb-6 h-4 w-48' />
            <Skeleton className='mb-4 h-5 w-28' />
            <div className='space-y-2'>
              <Skeleton className='h-8 w-72' />
              <Skeleton className='h-4 w-40' />
              <Skeleton className='h-4 w-full max-w-lg' />
            </div>
            <div className='mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4'>
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className='h-20 w-full rounded-lg' />
              ))}
            </div>
            <div className='mt-8 space-y-3'>
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className='h-24 w-full rounded-lg' />
              ))}
            </div>
          </div>
        </PageTransition>
      </>
    )
  }

  if (!model) {
    return (
      <>
        <PageTransition className='pb-10'>
          <div className='mx-auto max-w-2xl px-4 text-center sm:px-7'>
            <h2 className='font-display mb-1 text-lg font-semibold tracking-tight'>
              {t('Model not found')}
            </h2>
            <p className='text-muted-foreground mb-5 text-sm'>
              {t("The model you're looking for doesn't exist.")}
            </p>
            <Button onClick={handleBack} variant='outline' size='sm'>
              {t('Back to Models')}
            </Button>
          </div>
        </PageTransition>
      </>
    )
  }

  return (
    <>
      <PageTransition className='pb-10'>
        <div className='mx-auto max-w-[1180px] px-4 sm:px-7'>
          <Button
            variant='ghost'
            size='sm'
            onClick={handleBack}
            className='text-muted-foreground hover:text-foreground mb-6 h-auto gap-1.5 px-0 py-1 font-mono text-xs'
          >
            <ArrowLeft className='size-3.5' aria-hidden='true' />
            {t('Back to Models')}
          </Button>

          <ModelDetailsContent
          model={model}
          groupRatio={groupRatio || {}}
          usableGroup={usableGroup || {}}
          autoGroups={autoGroups || []}
          priceRate={priceRate ?? 1}
          usdExchangeRate={usdExchangeRate ?? 1}
          tokenUnit={tokenUnit}
          showRechargePrice={search.rechargePrice ?? false}
          endpointMap={
            (endpointMap as Record<
              string,
              { path?: string; method?: string }
            >) || {}
          }
        />
        </div>
      </PageTransition>
    </>
  )
}
