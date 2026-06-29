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
import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AppShell } from '@/components/layout'
import { PageTransition } from '@/components/page-transition'
import { cn } from '@/lib/utils'
import { EmptyState, PageHeader } from '@/components/youbox'
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
      <PageTransition className='mx-auto max-w-[1000px] px-0 pb-12 pt-2 sm:pt-4'>
        <PageHeader
          eyebrow={t('App rankings')}
          title={t('Top apps')}
          subtitle={t(
            'Applications ranked by token usage, attributed via the HTTP-Referer and X-Title request headers.'
          )}
          className='mb-6 [&_h1]:text-[clamp(1.75rem,4vw,2.5rem)] [&_h1]:tracking-[-0.03em]'
          actions={<RankingsViewPills active='apps' />}
        />

        {isLoading ? (
          <AppsLoading />
        ) : apps.length === 0 ? (
          <EmptyState
            className='border-border bg-surface-card rounded-xl border border-dashed'
            title={t(
              'No app usage recorded yet. Apps appear here once requests include an HTTP-Referer or X-Title header.'
            )}
          />
        ) : (
          <Card className='overflow-hidden p-0'>
            <AppsLeaderboardTable apps={apps} embedded />
          </Card>
        )}
      </PageTransition>
    </AppShell>
  )
}

const rankingsPillLinkClass =
  'relative inline-flex h-[30px] flex-none items-center justify-center rounded-sm border border-transparent px-3.5 text-sm font-medium whitespace-nowrap text-[var(--text-secondary)] transition-colors duration-fast ease-out hover:text-foreground focus-visible:shadow-[var(--ring)]'

function RankingsViewPills(props: { active: 'models' | 'apps' }) {
  const { t } = useTranslation()
  return (
    <nav
      aria-label={t('Rankings')}
      className='border-border bg-surface-inset inline-flex w-fit items-center rounded-md border p-[3px]'
    >
      <Link
        to='/rankings'
        className={cn(
          rankingsPillLinkClass,
          props.active === 'models' &&
            'bg-surface-2 text-[var(--text-strong)] shadow-xs'
        )}
      >
        {t('Models')}
      </Link>
      <Link
        to='/apps'
        className={cn(
          rankingsPillLinkClass,
          props.active === 'apps' &&
            'bg-surface-2 text-[var(--text-strong)] shadow-xs'
        )}
      >
        {t('Apps')}
      </Link>
    </nav>
  )
}

function AppsLoading() {
  const { t } = useTranslation()
  return (
    <Card
      className='border-border bg-surface-card rounded-xl border p-6 text-center'
      aria-busy='true'
    >
      <Skeleton className='mx-auto mb-3 h-4 w-32' />
      <p className='text-muted-foreground text-sm'>{t('Loading…')}</p>
    </Card>
  )
}
