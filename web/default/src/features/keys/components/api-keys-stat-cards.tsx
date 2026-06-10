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
import { Activity, KeyRound, Wallet } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatNumber, formatQuota } from '@/lib/format'
import { computeTimeRange } from '@/lib/time'
import { StatCard, StatCardRow } from '@/components/patterns'
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
 * Stat header for /keys (r2-B2 section 2): Active keys / Spend (7d) /
 * Requests today. "Monthly spend" from the design has no per-month
 * aggregation endpoint, so it is rendered as a 7-day spend window.
 */
export function ApiKeysStatCards({ apiKeys, loading }: ApiKeysStatCardsProps) {
  const { t } = useTranslation()
  const spend7d = useUsageWindow(7, 'day')
  const today = useUsageWindow(1, 'hour')

  const activeCount = apiKeys.filter(
    (apiKey) => apiKey.status === API_KEY_STATUS.ENABLED
  ).length

  return (
    <StatCardRow columns={3}>
      <StatCard
        size='sm'
        label={t('Active keys')}
        icon={<KeyRound />}
        value={formatNumber(activeCount)}
        loading={loading}
      />
      <StatCard
        size='sm'
        label={t('Spend (7d)')}
        icon={<Wallet />}
        value={spend7d.data ? formatQuota(spend7d.data.quota) : '-'}
        loading={spend7d.isLoading}
      />
      <StatCard
        size='sm'
        label={t('Requests today')}
        icon={<Activity />}
        value={today.data ? formatNumber(today.data.count) : '-'}
        loading={today.isLoading}
      />
    </StatCardRow>
  )
}
