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
import { AppShell } from '@/components/layout'
import { PageTransition } from '@/components/page-transition'
import { getApps } from './api'
import { AppsLeaderboardTable } from './components/apps-leaderboard'

export function AppsRankings() {
  const { t } = useTranslation()
  const { data: apps = [], isLoading } = useQuery({
    queryKey: ['apps-rankings'],
    queryFn: () => getApps(undefined, 50),
    staleTime: 60 * 1000,
  })

  return (
    <AppShell variant='public'>
      <PageTransition className='pb-12'>
        <div className='mb-6'>
          <p className='yb-eyebrow mb-3'>
            {'// '}
            {t('App rankings')}
          </p>
          <h1 className='font-display text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.1] font-bold tracking-[-0.03em]'>
            {t('Top apps')}
          </h1>
          <p className='text-muted-foreground/70 mt-2 max-w-2xl text-sm'>
            {t(
              'Applications ranked by token usage, attributed via the HTTP-Referer and X-Title request headers.'
            )}
          </p>
        </div>

        {isLoading ? (
          <div className='text-muted-foreground rounded-xl border p-6 text-center text-sm'>
            {t('Loading…')}
          </div>
        ) : apps.length === 0 ? (
          <div className='text-muted-foreground rounded-xl border border-dashed p-10 text-center text-sm'>
            {t(
              'No app usage recorded yet. Apps appear here once requests include an HTTP-Referer or X-Title header.'
            )}
          </div>
        ) : (
          <AppsLeaderboardTable apps={apps} rounded='xl' />
        )}
      </PageTransition>
    </AppShell>
  )
}
