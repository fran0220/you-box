import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getUptimeStatus } from '@/features/dashboard/api'
import {
  averageMonitorUptime,
  flattenMonitors,
  healthForSuccessRate,
} from '@/features/status/lib/status-helpers'

export function useHeroStatusPill() {
  const uptimeQuery = useQuery({
    queryKey: ['uptime-status'],
    queryFn: getUptimeStatus,
    staleTime: 60_000,
    retry: false,
  })

  return useMemo(() => {
    const monitors = flattenMonitors(uptimeQuery.data?.data ?? [])
    const avgUptime = averageMonitorUptime(monitors)
    const health = healthForSuccessRate(
      Number.isFinite(avgUptime) ? avgUptime : 99.98
    )
    return {
      loading: uptimeQuery.isLoading,
      label: health.label,
      uptimeDisplay: Number.isFinite(avgUptime)
        ? `${avgUptime.toFixed(2)}%`
        : '99.98%',
      variant: health.variant,
    }
  }, [uptimeQuery.data, uptimeQuery.isLoading])
}