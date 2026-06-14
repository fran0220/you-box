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
import { Trophy } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PublicLayout } from '@/components/layout'
import { PageTransition } from '@/components/page-transition'
import { getApps } from './api'

const COMPACT_NUMBER = new Intl.NumberFormat(undefined, {
  notation: 'compact',
  maximumFractionDigits: 1,
})

function RankBadge(props: { rank: number }) {
  const rank = props.rank
  const palette =
    rank === 1
      ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
      : rank === 2
        ? 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300'
        : rank === 3
          ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300'
          : 'bg-muted text-muted-foreground'
  return (
    <span
      className={cn(
        'inline-flex size-7 shrink-0 items-center justify-center rounded-md font-mono text-xs font-bold tabular-nums',
        palette
      )}
    >
      {rank <= 3 ? <Trophy className='size-3.5' /> : rank}
    </span>
  )
}

export function AppsRankings() {
  const { t } = useTranslation()
  const { data: apps = [], isLoading } = useQuery({
    queryKey: ['apps-rankings'],
    queryFn: () => getApps(undefined, 50),
    staleTime: 60 * 1000,
  })

  const headerCellClass =
    'text-muted-foreground py-2 text-[10px] font-medium tracking-wider uppercase'

  return (
    <PublicLayout showMainContainer={false}>
      <PageTransition className='mx-auto w-full max-w-3xl px-3 pt-16 pb-12 sm:px-6 sm:pt-20'>
        <header className='mb-6'>
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
        </header>

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
          <div className='overflow-x-auto rounded-xl border'>
            <Table className='text-sm'>
              <TableHeader>
                <TableRow className='hover:bg-transparent'>
                  <TableHead className={cn(headerCellClass, 'w-12')}>#</TableHead>
                  <TableHead className={headerCellClass}>{t('App')}</TableHead>
                  <TableHead className={`${headerCellClass} text-right`}>
                    {t('Requests')}
                  </TableHead>
                  <TableHead className={`${headerCellClass} text-right`}>
                    {t('Tokens')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apps.map((app, index) => (
                  <TableRow key={`${app.app}-${index}`}>
                    <TableCell className='py-2.5'>
                      <RankBadge rank={index + 1} />
                    </TableCell>
                    <TableCell className='py-2.5 font-medium break-all'>
                      {app.app}
                    </TableCell>
                    <TableCell className='py-2.5 text-right font-mono tabular-nums'>
                      {app.request_count.toLocaleString()}
                    </TableCell>
                    <TableCell className='py-2.5 text-right font-mono tabular-nums'>
                      {COMPACT_NUMBER.format(app.total_tokens)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </PageTransition>
    </PublicLayout>
  )
}
