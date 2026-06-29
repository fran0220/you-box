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
import { AnimatedNumber } from '@/components/ui/animated-number'
import { getPricing } from '@/features/pricing/api'
import { getUptimeStatus } from '@/features/dashboard/api'
import {
  averageMonitorUptime,
  flattenMonitors,
} from '@/features/status/lib/status-helpers'

export function HeroStatsStrip() {
  const { t } = useTranslation()

  const pricingQuery = useQuery({
    queryKey: ['pricing'],
    queryFn: getPricing,
    staleTime: 5 * 60 * 1000,
  })

  const uptimeQuery = useQuery({
    queryKey: ['uptime-status'],
    queryFn: getUptimeStatus,
    staleTime: 60_000,
    retry: false,
  })

  const modelCount = pricingQuery.data?.data?.length ?? 0
  const vendorCount = pricingQuery.data?.vendors?.length ?? 0
  const monitors = flattenMonitors(uptimeQuery.data?.data ?? [])
  const avgUptime = averageMonitorUptime(monitors)

  const items = [
    {
      label: t('Models'),
      value: modelCount,
      unit: '',
      decimals: 0 as number | undefined,
    },
    {
      label: t('Providers'),
      value: vendorCount,
      unit: '',
      decimals: 0 as number | undefined,
    },
    {
      label: t('Uptime'),
      value: Number.isFinite(avgUptime) ? avgUptime : NaN,
      unit: Number.isFinite(avgUptime) ? '%' : '',
      decimals: Number.isFinite(avgUptime) ? 2 : undefined,
    },
  ]

  return (
    <div className='border-border/60 mt-12 flex w-full max-w-[680px] flex-wrap items-center justify-between gap-6 border-t pt-8'>
      {items.map((item) => (
        <div key={item.label} className='flex min-w-[88px] flex-col items-center'>
          <span className='font-display text-2xl font-bold tracking-[-0.02em] md:text-[1.75rem]'>
            {Number.isFinite(item.value) && item.value > 0 ? (
              <AnimatedNumber
                value={item.value}
                startOnView
                duration={1400}
                format={(n) =>
                  `${item.decimals != null ? n.toFixed(item.decimals) : Math.round(n).toLocaleString()}${item.unit}`
                }
              />
            ) : (
              <span className='text-muted-foreground'>—</span>
            )}
          </span>
          <span className='text-muted-foreground mt-1 font-mono text-[11px] tracking-[0.06em] uppercase'>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  )
}