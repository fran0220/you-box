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
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { formatNumber, formatQuota } from '@/lib/format'
import { computeTimeRange } from '@/lib/time'
import { AnimatedNumber } from '@/components/ui/animated-number'
import { Skeleton } from '@/components/ui/skeleton'
import { Metric } from '@/components/patterns'
import { getUserQuotaDates } from '@/features/dashboard/api'
import { API_KEY_STATUS } from '../constants'
import { type ApiKey } from '../types'

/**
 * Aggregate the current user's quota usage over a trailing window.
 * Each window is cached independently under its own query key.
 */
function useUsageWindow(days: number, defaultTime: 'hour' | 'day') {
  return useQuery({
    queryKey: ['keys-usage-window', days, defaultTime],
    queryFn: async () => {
      const range = computeTimeRange(days)
      const res = await getUserQuotaDates({
        ...range,
        default_time: defaultTime,
      })
      return res?.data ?? []
    },
    staleTime: 60 * 1000,
    select: (items) => ({
      quota: items.reduce((sum, item) => sum + (item.quota ?? 0), 0),
      count: items.reduce((sum, item) => sum + (item.count ?? 0), 0),
    }),
  })
}

type ApiKeysStatCardsProps = {
  /** Current table page data — Active keys counts status === enabled. */
  apiKeys: ApiKey[]
  loading?: boolean
}

/**
 * Stat summary for /keys: Active keys / Spend (7d) / Requests today as
 * an inline label-over-value row (no stat-card grid).
 */
export function ApiKeysStatCards({ apiKeys, loading }: ApiKeysStatCardsProps) {
  const { t } = useTranslation()
  const spend7d = useUsageWindow(7, 'day')
  const today = useUsageWindow(1, 'hour')

  const activeCount = apiKeys.filter(
    (apiKey) => apiKey.status === API_KEY_STATUS.ENABLED
  ).length

  if (loading && spend7d.isLoading) {
    return (
      <div className='flex items-center gap-6'>
        <Skeleton className='h-9 w-24' />
        <Skeleton className='h-9 w-24' />
        <Skeleton className='h-9 w-28' />
      </div>
    )
  }

  return (
    <div className='border-border flex flex-wrap items-center gap-x-8 gap-y-2 border-b pb-3'>
      <Metric
        k={t('Active keys')}
        v={<AnimatedNumber value={activeCount} format={formatNumber} />}
      />
      <Metric
        k={t('Spend (7d)')}
        v={
          spend7d.data ? (
            <AnimatedNumber value={spend7d.data.quota} format={formatQuota} />
          ) : (
            '-'
          )
        }
      />
      <Metric
        k={t('Requests today')}
        v={
          today.data ? (
            <AnimatedNumber value={today.data.count} format={formatNumber} />
          ) : (
            '-'
          )
        }
      />
    </div>
  )
}
