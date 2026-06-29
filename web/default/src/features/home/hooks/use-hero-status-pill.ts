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