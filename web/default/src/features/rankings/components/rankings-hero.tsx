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
import { PageHeader } from '@/components/youbox'
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

export function RankingsHero(props: RankingsHeroProps) {
  const { t } = useTranslation()

  return (
    <section className='space-y-6'>
      <PageHeader
        eyebrow={t('Rankings')}
        title={t('Most used models on YouBox')}
        subtitle={t(
          'Ranked by tokens routed across all customers. Updated from live usage data.'
        )}
        className='[&_h1]:text-[clamp(1.75rem,4vw,2.5rem)] [&_h1]:tracking-[-0.03em]'
      />

      <Tabs
        value={props.period}
        onValueChange={(value) => props.onPeriodChange(value as RankingPeriod)}
      >
        <TabsList
          variant='default'
          aria-label={t('Period')}
          className='w-full max-w-full flex-wrap justify-start sm:w-fit'
        >
          {PERIODS.map((p) => (
            <TabsTrigger key={p.id} value={p.id} className='flex-none'>
              {t(p.labelKey)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </section>
  )
}
