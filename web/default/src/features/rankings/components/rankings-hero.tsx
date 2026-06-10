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
import { useTranslation } from 'react-i18next'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { RankingPeriod } from '../types'

const PERIODS: { id: RankingPeriod; labelKey: string }[] = [
  { id: 'today', labelKey: 'Today' },
  { id: 'week', labelKey: 'Week' },
  { id: 'month', labelKey: 'Month' },
  { id: 'year', labelKey: 'Year' },
  { id: 'all', labelKey: 'All-time' },
]

type RankingsHeroProps = {
  period: RankingPeriod
  onPeriodChange: (period: RankingPeriod) => void
}

/**
 * Hero strip for the rankings page. Intentionally minimal — title +
 * subtitle + period tabs only.
 */
export function RankingsHero(props: RankingsHeroProps) {
  const { t } = useTranslation()

  return (
    <section className='space-y-5'>
      <div className='space-y-2'>
        <h1 className='font-display text-[clamp(1.75rem,4vw,2.5rem)] leading-[1.1] font-bold tracking-[-0.025em]'>
          {t('Rankings')}
        </h1>
        <p className='text-muted-foreground/80 max-w-2xl text-sm'>
          {t(
            'Discover the most-used models and rising vendors on the platform, updated from live usage data.'
          )}
        </p>
      </div>

      {/* Underline tabs for period — clean and unobtrusive. */}
      <Tabs
        value={props.period}
        onValueChange={(value) => props.onPeriodChange(value as RankingPeriod)}
      >
        <TabsList
          variant='line'
          aria-label={t('Period')}
          className='border-border/60 w-full justify-start gap-0 border-b group-data-horizontal/tabs:h-auto'
        >
          {PERIODS.map((p) => (
            <TabsTrigger key={p.id} value={p.id} className='flex-none px-3 py-2'>
              {t(p.labelKey)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </section>
  )
}
