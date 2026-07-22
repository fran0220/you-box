import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { formatNumber, formatQuota } from '@/lib/format'
import { computeTimeRange } from '@/lib/time'
import { AnimatedNumber } from '@/components/ui/animated-number'
import { Metric, MetricsRow } from '@/components/patterns'
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

  return (
    <MetricsRow loading={loading && spend7d.isLoading} count={3}>
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
    </MetricsRow>
  )
}
