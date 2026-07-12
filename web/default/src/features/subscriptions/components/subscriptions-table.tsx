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
import {
  type SortingState,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { usePersistedColumnVisibility } from '@/hooks'
import { useTranslation } from 'react-i18next'
import { DataTablePage } from '@/components/data-table'
import { useSubscriptionsColumns } from './subscriptions-columns'
import { SubscriptionsStatCards } from './subscriptions-stat-cards'
import { useAdminPlans } from './use-admin-plans'

export function SubscriptionsTable() {
  const { t } = useTranslation()
  const columns = useSubscriptionsColumns()
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = usePersistedColumnVisibility(
    'youbox.table.columns.subscriptions',
    {
      payment: false,
      total_amount: false,
      upgrade_group: false,
      reset: false,
      sort_order: false,
    }
  )

  // Shared with PlanPreviewPanel — same queryKey, single fetch.
  const { data, isLoading, isFetching, isError, refetch } = useAdminPlans()

  const plans = useMemo(() => data || [], [data])

  const table = useReactTable({
    data: plans,
    columns,
    state: { sorting, columnVisibility },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <DataTablePage
      table={table}
      columns={columns}
      isLoading={isLoading}
      isFetching={isFetching}
      isError={isError}
      onRetry={() => {
        void refetch()
      }}
      statHeader={<SubscriptionsStatCards plans={plans} loading={isLoading} />}
      emptyTitle={t('No subscription plans yet')}
      emptyDescription={t(
        'Click "Create Plan" to create your first subscription plan'
      )}
      skeletonKeyPrefix='subscriptions-skeleton'
      stickyActions
    />
  )
}
