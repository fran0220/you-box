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
