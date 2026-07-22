import { useTranslation } from 'react-i18next'
import { useSystemConfig } from '@/hooks/use-system-config'
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
  const { systemName } = useSystemConfig()

  return (
    <section className='space-y-6'>
      <PageHeader
        eyebrow={t('Rankings')}
        title={t('Most used models on {{brandName}}', {
          brandName: systemName,
        })}
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
