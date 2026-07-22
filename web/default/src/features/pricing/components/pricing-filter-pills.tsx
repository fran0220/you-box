import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  FILTER_SECTIONS,
  getEndpointTypeLabels,
  getModelTypeLabels,
  getQuotaTypeLabels,
} from '../constants'
import { type ActiveFilter } from '../hooks/use-filters'

export interface PricingFilterPillsProps {
  activeFilters: ActiveFilter[]
  searchInput: string
  onClearSearch: () => void
  onClearAll: () => void
  className?: string
}

/**
 * Removable pills for every active facet selection + the search term, rendered
 * above the result list (OpenRouter parity). Pill labels are produced by the
 * `useFilters` hook (`ActiveFilter.label`); each `.onRemove()` clears just that
 * selection. The search term gets its own pill here since it lives outside the
 * facet pills.
 */
export function PricingFilterPills(props: PricingFilterPillsProps) {
  const { t } = useTranslation()
  const hasSearch = Boolean(props.searchInput.trim())

  // The hook stores raw machine values on each pill (e.g. "openai", "token",
  // "image"); localize them here with the SAME label maps the sidebar uses so a
  // pill reads "Chat"/"Token-based"/"Image" — matching its sidebar checkbox.
  const endpointLabels = getEndpointTypeLabels(t)
  const quotaLabels = getQuotaTypeLabels(t)
  const modelTypeLabels = getModelTypeLabels(t)
  const resolveLabel = (filter: ActiveFilter): string => {
    switch (filter.facet) {
      case 'promptPriceRange':
        return t('Prompt pricing')
      case FILTER_SECTIONS.ENDPOINT_TYPE:
        return endpointLabels[filter.value as keyof typeof endpointLabels] ?? filter.label
      case FILTER_SECTIONS.PRICING_TYPE:
        return quotaLabels[filter.value as keyof typeof quotaLabels] ?? filter.label
      case FILTER_SECTIONS.MODEL_TYPE:
        return modelTypeLabels[filter.value] ?? filter.label
      default:
        return filter.label
    }
  }

  if (props.activeFilters.length === 0 && !hasSearch) return null

  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', props.className)}>
      {hasSearch && (
        <Pill
          label={`${t('Search')}: ${props.searchInput.trim()}`}
          onRemove={props.onClearSearch}
        />
      )}
      {props.activeFilters.map((filter) => (
        <Pill
          key={`${filter.facet}:${filter.value}`}
          label={resolveLabel(filter)}
          onRemove={filter.onRemove}
        />
      ))}
      {(props.activeFilters.length > 0 || hasSearch) && (
        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={props.onClearAll}
          className='text-muted-foreground hover:text-foreground h-6 px-2 text-xs'
        >
          {t('Clear all')}
        </Button>
      )}
    </div>
  )
}

function Pill(props: { label: string; onRemove: () => void }) {
  const { t } = useTranslation()
  return (
    <span className='border-border/70 bg-muted/50 text-foreground inline-flex max-w-[220px] items-center gap-1 rounded-full border py-0.5 pr-1 pl-2.5 text-xs'>
      <span className='truncate'>{props.label}</span>
      <button
        type='button'
        onClick={props.onRemove}
        className='text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10 rounded-full p-0.5 transition-colors'
        aria-label={t('Remove filter: {{label}}', { label: props.label })}
      >
        <X className='size-3' aria-hidden='true' />
      </button>
    </span>
  )
}
