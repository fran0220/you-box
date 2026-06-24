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
import { Trophy } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatCompactNumber } from '@/lib/format'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { AppRankingRow } from '@/features/apps/api'

/** Rank chip: a trophy for the top 3, the numeric rank otherwise. */
export function RankBadge(props: { rank: number }) {
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

/**
 * Ranked table of apps by request/token usage. Shared by the standalone
 * /apps leaderboard page and the per-model apps tab in model details.
 */
export function AppsLeaderboardTable(props: {
  apps: AppRankingRow[]
  rounded?: 'lg' | 'xl'
}) {
  const { t } = useTranslation()
  const radius = props.rounded === 'xl' ? 'rounded-xl' : 'rounded-lg'
  const headerCellClass =
    'text-muted-foreground py-2 text-[10px] font-medium tracking-wider uppercase'

  return (
    <div className={cn('overflow-x-auto border', radius)}>
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
          {props.apps.map((app, index) => (
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
                {formatCompactNumber(app.total_tokens)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
