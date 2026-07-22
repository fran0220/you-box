import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { formatLogQuota } from '@/lib/format'
import { useIsAdmin } from '@/hooks/use-admin'
import { Skeleton } from '@/components/ui/skeleton'
import { Metric } from '@/components/patterns'
import { getLogStats, getUserLogStats } from '../api'
import { DEFAULT_LOG_STATS } from '../constants'
import { buildApiParams } from '../lib/utils'
import { useUsageLogsContext } from './usage-logs-provider'

const route = getRouteApi('/_authenticated/usage-logs/$section')

export function CommonLogsStats() {
  const { t } = useTranslation()
  const isAdmin = useIsAdmin()
  const searchParams = route.useSearch()
  const { sensitiveVisible } = useUsageLogsContext()

  const { data: stats, isLoading } = useQuery({
    queryKey: ['usage-logs-stats', isAdmin, searchParams],
    queryFn: async () => {
      const params = buildApiParams({
        page: 1,
        pageSize: 1,
        searchParams,
        columnFilters: [],
        isAdmin,
      })

      const result = isAdmin
        ? await getLogStats(params)
        : await getUserLogStats(params)

      return result.success
        ? result.data || DEFAULT_LOG_STATS
        : DEFAULT_LOG_STATS
    },
    placeholderData: (previousData) => previousData,
  })

  if (isLoading) {
    return (
      <div className='flex items-center gap-6'>
        <Skeleton className='h-9 w-[110px]' />
        <Skeleton className='h-9 w-[80px]' />
        <Skeleton className='h-9 w-[80px]' />
      </div>
    )
  }

  return (
    <div className='flex flex-wrap items-center gap-x-6 gap-y-2'>
      <Metric
        k={t('Usage')}
        v={sensitiveVisible ? formatLogQuota(stats?.quota || 0) : '••••'}
      />
      <Metric k={t('RPM')} v={stats?.rpm || 0} />
      <Metric k={t('TPM')} v={stats?.tpm || 0} />
    </div>
  )
}
