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
import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { Plus, Scale, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getLobeIcon } from '@/lib/lobe-icon'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { AppShell } from '@/components/layout'
import { PageTransition } from '@/components/page-transition'
import { MAX_COMPARE_MODELS } from '../constants'
import { usePricingData } from '../hooks/use-pricing-data'
import {
  formatTokenCount,
  formatYearMonth,
  inferModelMetadata,
} from '../lib/model-metadata'
import { formatPrice, formatRequestPrice } from '../lib/price'
import type { PricingModel } from '../types'
import { LoadingSkeleton } from './loading-skeleton'
import { ModelDetailsCapabilities } from './model-details-capabilities'
import { ModalityIcons } from './model-details-modalities'

interface ComparePricingContext {
  priceRate: number
  usdExchangeRate: number
}

interface CompareRow {
  label: string
  render: (
    model: PricingModel,
    meta: ReturnType<typeof inferModelMetadata>,
    ctx: ComparePricingContext
  ) => React.ReactNode
}

const COMPARE_ROWS: CompareRow[] = [
  {
    label: 'Input price (/1M)',
    render: (model, _meta, ctx) =>
      model.quota_type === 1
        ? formatRequestPrice(model, false, ctx.priceRate, ctx.usdExchangeRate)
        : formatPrice(
            model,
            'input',
            'M',
            false,
            ctx.priceRate,
            ctx.usdExchangeRate
          ),
  },
  {
    label: 'Output price (/1M)',
    render: (model, _meta, ctx) =>
      model.quota_type === 1
        ? '—'
        : formatPrice(
            model,
            'output',
            'M',
            false,
            ctx.priceRate,
            ctx.usdExchangeRate
          ),
  },
  {
    label: 'Context length',
    render: (_model, meta) => formatTokenCount(meta.context_length),
  },
  {
    label: 'Max output',
    render: (_model, meta) => formatTokenCount(meta.max_output_tokens),
  },
  {
    label: 'Input',
    render: (_model, meta) => (
      <ModalityIcons modalities={meta.input_modalities} />
    ),
  },
  {
    label: 'Output',
    render: (_model, meta) => (
      <ModalityIcons modalities={meta.output_modalities} />
    ),
  },
  {
    label: 'Knowledge cutoff',
    render: (_model, meta) =>
      meta.knowledge_cutoff ? formatYearMonth(meta.knowledge_cutoff) : '—',
  },
  {
    label: 'Released',
    render: (_model, meta) =>
      meta.release_date ? formatYearMonth(meta.release_date) : '—',
  },
  {
    label: 'Capabilities',
    render: (_model, meta) => (
      <div className='@container/details'>
        <ModelDetailsCapabilities capabilities={meta.capabilities} />
      </div>
    ),
  },
]

/** Popover that adds another model to the comparison. */
function AddModelButton(props: {
  models: PricingModel[]
  selected: string[]
  onAdd: (name: string) => void
  disabled?: boolean
}) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const options = useMemo(() => {
    const taken = new Set(props.selected)
    const q = search.trim().toLowerCase()
    return props.models
      .filter((m) => !taken.has(m.model_name))
      .filter((m) => !q || m.model_name.toLowerCase().includes(q))
      .slice(0, 100)
  }, [props.models, props.selected, search])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type='button'
            variant='outline'
            size='sm'
            disabled={props.disabled}
          />
        }
      >
        <Plus className='size-4' />
        {t('Add model')}
      </PopoverTrigger>
      <PopoverContent
        align='start'
        className='w-72 overflow-hidden rounded-xl p-0'
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={t('Search models...')}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList className='max-h-[320px]'>
            <CommandEmpty>{t('No models found.')}</CommandEmpty>
            <CommandGroup>
              {options.map((model) => (
                <CommandItem
                  key={model.model_name}
                  value={model.model_name}
                  onSelect={() => {
                    props.onAdd(model.model_name)
                    setOpen(false)
                    setSearch('')
                  }}
                  className='gap-2 rounded-lg px-2.5 py-2'
                >
                  {model.vendor_icon ? (
                    <span className='shrink-0'>
                      {getLobeIcon(model.vendor_icon, 16)}
                    </span>
                  ) : null}
                  <span className='min-w-0 flex-1 truncate'>
                    {model.model_name}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export function ModelCompare() {
  const { t } = useTranslation()
  const search = useSearch({ from: '/pricing/compare' })
  const navigate = useNavigate()
  const { models, isLoading, priceRate, usdExchangeRate } = usePricingData()

  const selectedNames = useMemo(() => {
    const raw = (search.models ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    return Array.from(new Set(raw)).slice(0, MAX_COMPARE_MODELS)
  }, [search.models])

  const setSelected = (names: string[]) => {
    const next = Array.from(new Set(names)).slice(0, MAX_COMPARE_MODELS)
    void navigate({
      to: '/pricing/compare',
      search: { models: next.length ? next.join(',') : undefined },
    })
  }

  const selectedModels = useMemo(() => {
    const list = models || []
    const result: PricingModel[] = []
    for (const name of selectedNames) {
      const found = list.find((m) => m.model_name === name)
      if (found) result.push(found)
    }
    return result
  }, [selectedNames, models])

  const ctx: ComparePricingContext = {
    priceRate: priceRate ?? 1,
    usdExchangeRate: usdExchangeRate ?? 1,
  }

  const metaByModel = useMemo(() => {
    const map = new Map<string, ReturnType<typeof inferModelMetadata>>()
    for (const model of selectedModels) {
      map.set(model.model_name, inferModelMetadata(model))
    }
    return map
  }, [selectedModels])

  const canAddMore = selectedModels.length < MAX_COMPARE_MODELS
  const gridTemplateColumns = `minmax(120px,160px) repeat(${selectedModels.length}, minmax(190px, 1fr))`

  if (isLoading) {
    return (
      <AppShell variant='public' contentMode='fluid'>
        <div className='mx-auto w-full max-w-[1400px] px-3 pb-8 sm:px-6'>
          <LoadingSkeleton viewMode='table' />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell variant='public' contentMode='fluid'>
      <PageTransition className='mx-auto w-full max-w-[1400px] px-3 pb-10 sm:px-6'>
        <div className='mb-6'>
          <p className='yb-eyebrow mb-3'>
            {'// '}
            {t('Compare models')}
          </p>
          <h1 className='font-display text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.1] font-bold tracking-[-0.03em]'>
            {t('Model comparison')}
          </h1>
          <p className='text-muted-foreground/70 mt-2 max-w-2xl text-sm'>
            {t(
              'Put models side by side and compare pricing, context, modalities, and capabilities.'
            )}
          </p>
        </div>

        {selectedModels.length === 0 ? (
          <div className='flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed px-6 py-12 text-center'>
            <Scale className='text-muted-foreground/40 mb-3 size-10' />
            <h3 className='text-foreground mb-1 text-base font-semibold'>
              {t('No models selected')}
            </h3>
            <p className='text-muted-foreground mb-5 max-w-xs text-sm'>
              {t('Add up to {{count}} models to compare them side by side.', {
                count: MAX_COMPARE_MODELS,
              })}
            </p>
            <AddModelButton
              models={models || []}
              selected={selectedNames}
              onAdd={(name) => setSelected([...selectedNames, name])}
            />
          </div>
        ) : (
          <div className='space-y-4'>
            <div className='flex flex-wrap items-center gap-2'>
              <AddModelButton
                models={models || []}
                selected={selectedNames}
                onAdd={(name) => setSelected([...selectedNames, name])}
                disabled={!canAddMore}
              />
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={() => setSelected([])}
              >
                {t('Clear all')}
              </Button>
            </div>

            <div className='overflow-x-auto rounded-xl border'>
              <div
                className='min-w-fit'
                style={{ display: 'grid', gridTemplateColumns }}
              >
                {/* Header row */}
                <div className='bg-surface/60 border-b p-3' />
                {selectedModels.map((model) => (
                  <div
                    key={model.model_name}
                    className='bg-surface/60 flex items-start justify-between gap-2 border-b border-l p-3'
                  >
                    <div className='flex min-w-0 items-center gap-2'>
                      {model.vendor_icon ? (
                        <span className='shrink-0'>
                          {getLobeIcon(model.vendor_icon, 18)}
                        </span>
                      ) : null}
                      <div className='min-w-0'>
                        <div
                          className='truncate text-sm font-semibold'
                          title={model.model_name}
                        >
                          {model.model_name}
                        </div>
                        {model.vendor_name ? (
                          <div className='text-muted-foreground truncate text-xs'>
                            {model.vendor_name}
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon-sm'
                      aria-label={t('Remove')}
                      onClick={() =>
                        setSelected(
                          selectedNames.filter((n) => n !== model.model_name)
                        )
                      }
                    >
                      <X className='size-4' />
                    </Button>
                  </div>
                ))}

                {/* Attribute rows */}
                {COMPARE_ROWS.map((row, rowIndex) => (
                  <CompareRowCells
                    key={row.label}
                    row={row}
                    models={selectedModels}
                    metaByModel={metaByModel}
                    ctx={ctx}
                    striped={rowIndex % 2 === 1}
                  />
                ))}

                {/* Actions row */}
                <div className='border-t p-3' />
                {selectedModels.map((model) => (
                  <div
                    key={`actions-${model.model_name}`}
                    className='flex items-center gap-2 border-t border-l p-3'
                  >
                    <Button
                      render={
                        <Link
                          to='/pricing/$modelId'
                          params={{ modelId: model.model_name }}
                        />
                      }
                      variant='outline'
                      size='sm'
                    >
                      {t('Details')}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </PageTransition>
    </AppShell>
  )
}

function CompareRowCells(props: {
  row: CompareRow
  models: PricingModel[]
  metaByModel: Map<string, ReturnType<typeof inferModelMetadata>>
  ctx: ComparePricingContext
  striped: boolean
}) {
  const { t } = useTranslation()
  const { row, models, metaByModel, ctx, striped } = props
  return (
    <>
      <div
        className={cn(
          'text-muted-foreground border-t p-3 text-xs font-medium',
          striped && 'bg-surface/30'
        )}
      >
        {t(row.label)}
      </div>
      {models.map((model) => {
        const meta = metaByModel.get(model.model_name)
        return (
          <div
            key={`${row.label}-${model.model_name}`}
            className={cn(
              'border-t border-l p-3 text-sm tabular-nums',
              striped && 'bg-surface/30'
            )}
          >
            {meta ? row.render(model, meta, ctx) : '—'}
          </div>
        )
      })}
    </>
  )
}
