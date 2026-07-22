import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { formatCompactNumber } from '@/lib/format'
import { getApps } from '@/features/apps/api'
import { AppsLeaderboardTable } from '@/features/apps/components/apps-leaderboard'
import type { PricingModel } from '../types'

export function ModelDetailsApps(props: { model: PricingModel }) {
  const { t } = useTranslation()
  const { data: apps = [], isLoading } = useQuery({
    queryKey: ['model-apps', props.model.model_name],
    queryFn: () => getApps(props.model.model_name, 20),
    staleTime: 60 * 1000,
  })

  if (isLoading) {
    return (
      <div className='text-muted-foreground rounded-lg border p-6 text-center text-sm'>
        {t('Loading app usage…')}
      </div>
    )
  }

  if (apps.length === 0) {
    return (
      <div className='text-muted-foreground rounded-lg border p-6 text-center text-sm'>
        {t(
          'No app usage recorded yet. Apps appear here once requests include an HTTP-Referer or X-Title header.'
        )}
      </div>
    )
  }

  const totalTokens = apps.reduce((sum, a) => sum + a.total_tokens, 0)
  const top = apps[0]

  return (
    <div className='flex flex-col gap-4'>
      <div className='grid grid-cols-1 gap-2 sm:grid-cols-3'>
        <div className='bg-muted/20 rounded-lg border p-3'>
          <div className='text-muted-foreground text-[10px] font-medium tracking-wider uppercase'>
            {t('Tracked apps')}
          </div>
          <div className='text-foreground mt-1 font-mono text-lg font-semibold tabular-nums'>
            {apps.length}
          </div>
        </div>
        <div className='bg-muted/20 rounded-lg border p-3'>
          <div className='text-muted-foreground text-[10px] font-medium tracking-wider uppercase'>
            {t('Total tokens')}
          </div>
          <div className='text-foreground mt-1 font-mono text-lg font-semibold tabular-nums'>
            {formatCompactNumber(totalTokens)}
          </div>
        </div>
        <div className='bg-muted/20 rounded-lg border p-3'>
          <div className='text-muted-foreground text-[10px] font-medium tracking-wider uppercase'>
            {t('#1 by usage')}
          </div>
          <div className='text-foreground mt-1 truncate text-base font-semibold'>
            {top.app}
          </div>
        </div>
      </div>

      <AppsLeaderboardTable apps={apps} rounded='lg' />
    </div>
  )
}
