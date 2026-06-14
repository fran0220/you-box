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

interface StatsProps {
  className?: string
}

interface StatItem {
  end: number
  suffix: string
  label: string
  decimals?: number
}

export function Stats(_props: StatsProps) {
  const { t } = useTranslation()

  // Real platform counts from the public pricing endpoint. Falls back to a
  // sensible "+" suffix only when a count is unavailable, so the homepage never
  // shows fabricated totals.
  const { data } = useQuery({
    queryKey: ['pricing'],
    queryFn: getPricing,
    staleTime: 5 * 60 * 1000,
  })

  const modelCount = data?.data?.length ?? 0
  const vendorCount = data?.vendors?.length ?? 0
  const endpointCount = data?.supported_endpoint
    ? Object.keys(data.supported_endpoint).length
    : 0
  const groupCount = data?.usable_group
    ? Object.keys(data.usable_group).length
    : 0

  // Use real counts when loaded; before load, show a modest placeholder that
  // animates up to the real value once it arrives (Counter remounts on change).
  const stats: StatItem[] = [
    {
      end: modelCount || 0,
      suffix: modelCount ? '' : '+',
      label: t('models available'),
    },
    {
      end: vendorCount || 0,
      suffix: vendorCount ? '' : '+',
      label: t('model providers'),
    },
    {
      end: endpointCount || 0,
      suffix: endpointCount ? '' : '+',
      label: t('API formats supported'),
    },
    {
      end: groupCount || 0,
      suffix: groupCount ? '' : '+',
      label: t('access tiers'),
    },
  ]

  return (
    <div className='border-border/40 bg-muted/10 relative z-10 border-y'>
      <div className='mx-auto max-w-6xl px-6 py-10 md:py-12'>
        <div className='grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-12'>
          {stats.map((s) => (
            <div
              key={s.label}
              className='flex flex-col items-center text-center'
            >
              <span className='font-display text-2xl font-bold tracking-[-0.02em] md:text-3xl'>
                {/* Counts up on scroll-in, and re-animates to real data once
                    the pricing query resolves. */}
                <AnimatedNumber
                  value={s.end}
                  startOnView
                  duration={1500}
                  format={(n) =>
                    `${s.decimals ? n.toFixed(s.decimals) : Math.round(n).toLocaleString()}${s.suffix}`
                  }
                />
              </span>
              <span className='text-muted-foreground mt-1.5 font-mono text-[11px] tracking-[0.06em] uppercase'>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
