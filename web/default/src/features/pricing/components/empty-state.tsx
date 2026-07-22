import { Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { EmptyState as YouboxEmptyState } from '@/components/youbox/empty-state'
import { Button } from '@/components/ui/button'

export interface EmptyStateProps {
  searchQuery?: string
  hasActiveFilters: boolean
  onClearFilters: () => void
}

/** Catalog empty state — wraps canonical youbox EmptyState. */
export function EmptyState(props: EmptyStateProps) {
  const { t } = useTranslation()
  const hasSearch = Boolean(props.searchQuery?.trim())

  const description = hasSearch
    ? t(
        'No results for "{{query}}". Try adjusting your search or filters.',
        { query: props.searchQuery }
      )
    : t('No models match your current filters.')

  const showClear = props.hasActiveFilters || hasSearch

  return (
    <YouboxEmptyState
      icon={Search}
      title={t('No models found')}
      description={description}
      className='border-border bg-card min-h-[320px] rounded-lg border border-dashed'
      action={
        showClear ? (
          <Button
            variant='outline'
            size='sm'
            onClick={props.onClearFilters}
          >
            {t('Clear all filters')}
          </Button>
        ) : undefined
      }
    />
  )
}
