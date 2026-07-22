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
