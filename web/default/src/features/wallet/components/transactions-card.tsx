import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { formatCurrencyFromUSD } from '@/lib/currency'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Panel,
  PanelBody,
  PanelHeader,
  TransactionRow,
} from '@/components/patterns'
import { StatusBadge } from '@/components/status-badge'
import { getUserBillingHistory, isApiSuccess } from '../api'
import {
  formatTimestamp,
  getPaymentMethodName,
  getStatusConfig,
} from '../lib/billing'

interface TransactionsCardProps {
  /** Opens the existing BillingHistoryDialog. */
  onViewAll: () => void
}

/**
 * Transactions panel (r2-B3 section 5): the 5 most recent top-up orders
 * as TransactionRows. Usage (out) has no per-entry ledger endpoint, so
 * the list is top-up history only; `View all` opens the full billing
 * history dialog.
 */
export function TransactionsCard({ onViewAll }: TransactionsCardProps) {
  const { t } = useTranslation()

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['wallet-recent-transactions'],
    queryFn: async () => {
      const response = await getUserBillingHistory(1, 5)
      if (isApiSuccess(response) && response.data) {
        return response.data.items || []
      }
      return []
    },
    staleTime: 30 * 1000,
  })

  return (
    <Panel>
      <PanelHeader
        title={t('Transactions')}
        actions={
          <Button variant='ghost' size='sm' onClick={onViewAll}>
            {t('View all')}
          </Button>
        }
      />
      <PanelBody className='p-0'>
        {isLoading ? (
          <div className='space-y-3 px-4 py-3 sm:px-5'>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className='flex items-center justify-between gap-3'>
                <div className='flex-1 space-y-1.5'>
                  <Skeleton className='h-4 w-28' />
                  <Skeleton className='h-3 w-36' />
                </div>
                <Skeleton className='h-4 w-16' />
              </div>
            ))}
          </div>
        ) : records.length === 0 ? (
          <p className='text-muted-foreground px-4 py-8 text-center text-sm'>
            {t('Your transaction history will appear here')}
          </p>
        ) : (
          records.map((record) => {
            const statusConfig = getStatusConfig(record.status)
            return (
              <TransactionRow
                key={record.id}
                title={getPaymentMethodName(record.payment_method, t)}
                sub={formatTimestamp(record.create_time)}
                direction='in'
                amount={
                  record.status === 'success' ? (
                    `+${formatCurrencyFromUSD(record.amount, {
                      digitsLarge: 2,
                      digitsSmall: 2,
                      abbreviate: false,
                    })}`
                  ) : (
                    <StatusBadge
                      label={t(statusConfig.label)}
                      variant={statusConfig.variant}
                      appearance='soft'
                      showDot={false}
                      copyable={false}
                    />
                  )
                }
              />
            )
          })
        )}
      </PanelBody>
    </Panel>
  )
}
