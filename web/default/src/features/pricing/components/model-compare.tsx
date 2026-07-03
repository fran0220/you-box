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
import type { TFunction } from 'i18next'
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
import { StatusBadge } from '@/components/status-badge'
import { PageTransition } from '@/components/page-transition'
import { EmptyState as YouboxEmptyState } from '@/components/youbox/empty-state'
import { MAX_COMPARE_MODELS, QUOTA_TYPE_VALUES } from '../constants'
import { usePricingData } from '../hooks/use-pricing-data'
import { deriveModelTypes } from '../lib/model-type'
import { formatPrice, formatRequestPrice } from '../lib/price'
import type { PricingModel } from '../types'
import { LoadingSkeleton } from './loading-skeleton'

interface ComparePricingContext {
  priceRate: number
  usdExchangeRate: number
}

interface CompareRow {
  labelKey: string
  render: (
    model: PricingModel,
    ctx: ComparePricingContext,
    t: TFunction
  ) => React.ReactNode
}

const COMPARE_ROWS: CompareRow[] = [
  {
    labelKey: 'Vendor',
    render: (model) => model.vendor_name ?? '—',
  },
  {
    labelKey: 'Input price (/1M)',
    render: (model, ctx) =>
      model.quota_type === QUOTA_TYPE_VALUES.REQUEST
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
    labelKey: 'Output price (/1M)',
    render: (model, ctx) =>
      model.quota_type === QUOTA_TYPE_VALUES.REQUEST
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
    labelKey: 'Pricing type',
    render: (model, _ctx, t) =>
      model.quota_type === QUOTA_TYPE_VALUES.TOKEN
        ? t('Token')
        : t('Request'),
  },
  {
    labelKey: 'Model types',
    render: (model) => {
      const types = deriveModelTypes(model)
      if (types.length === 0) return '—'
      return (
        <span className='flex flex-wrap gap-1'>
          {types.map((t) => (
            <StatusBadge key={t} label={t} size='sm' copyable={false} />
          ))}
        </span>
      )
    },
  },
  {
    labelKey: 'Endpoints',
    render: (model) => {
      const eps = model.supported_endpoint_types ?? []
      if (eps.length === 0) return '—'
      return eps.join(', ')
    },
  },
  {
    labelKey: 'Groups',
    render: (model) => {
      const groups = (model.enable_groups ?? []).filter((g) => g && g !== 'auto')
      if (groups.length === 0) return '—'
      return groups.join(', ')
    },
  },
]

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
            placeholder={t('Search models…')}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
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
                >
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
  const search = useSearch({ from: '/_public/pricing/compare' })
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

  const canAddMore = selectedModels.length < MAX_COMPARE_MODELS
  const gridTemplateColumns = `minmax(120px,160px) repeat(${selectedModels.length}, minmax(190px, 1fr))`

  if (isLoading) {
    return (
      <>
        <div className='pb-8'>
          <LoadingSkeleton viewMode='table' />
        </div>
      </>
    )
  }

  return (
    <>
      <PageTransition className='mx-auto max-w-[1180px] px-4 pb-10 sm:px-7'>
        <div className='mb-6'>
          <p className='yb-eyebrow mb-3'>
            {t('Compare models')}
          </p>
          <h1 className='font-display text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.1] font-bold tracking-[-0.03em]'>
            {t('Model comparison')}
          </h1>
          <p className='text-muted-foreground/70 mt-2 max-w-2xl text-sm'>
            {t(
              'Put models side by side and compare pricing and catalog fields from the live API.'
            )}
          </p>
        </div>

        {selectedModels.length === 0 ? (
          <YouboxEmptyState
            icon={Scale}
            title={t('No models selected')}
            description={t(
              'Add up to {{count}} models to compare them side by side.',
              { count: MAX_COMPARE_MODELS }
            )}
            className='border-border bg-card min-h-[320px] rounded-xl border border-dashed'
            action={
              <AddModelButton
                models={models || []}
                selected={selectedNames}
                onAdd={(name) => setSelected([...selectedNames, name])}
              />
            }
          />
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

            <div className='border-border bg-card overflow-x-auto rounded-xl border'>
              <div
                className='min-w-fit'
                style={{ display: 'grid', gridTemplateColumns }}
              >
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

                {COMPARE_ROWS.map((row, rowIndex) => (
                  <CompareRowCells
                    key={row.labelKey}
                    row={row}
                    models={selectedModels}
                    ctx={ctx}
                    striped={rowIndex % 2 === 1}
                  />
                ))}

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
    </>
  )
}

function CompareRowCells(props: {
  row: CompareRow
  models: PricingModel[]
  ctx: ComparePricingContext
  striped: boolean
}) {
  const { t } = useTranslation()
  const { row, models, ctx, striped } = props
  return (
    <>
      <div
        className={cn(
          'text-muted-foreground border-divider border-t p-3 font-mono text-[11px] font-medium tracking-[0.06em] uppercase',
          striped && 'bg-surface/30'
        )}
      >
        {t(row.labelKey)}
      </div>
      {models.map((model) => (
        <div
          key={`${row.labelKey}-${model.model_name}`}
          className={cn(
            'border-t border-l p-3 text-sm tabular-nums',
            striped && 'bg-surface/30'
          )}
        >
          {row.render(model, ctx, t)}
        </div>
      ))}
    </>
  )
}
