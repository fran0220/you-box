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
import { getApps } from '@/features/apps/api'
import type { PricingModel } from '../types'

const COMPACT_NUMBER = new Intl.NumberFormat(undefined, {
  notation: 'compact',
  maximumFractionDigits: 1,
})

function RankBadge(props: { rank: number }) {
  const rank = props.rank
  const isPodium = rank <= 3
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
      {isPodium ? <Trophy className='size-3.5' /> : rank}
    </span>
  )
}

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
  const headerCellClass =
    'text-muted-foreground py-2 text-[10px] font-medium tracking-wider uppercase'

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
            {COMPACT_NUMBER.format(totalTokens)}
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

      <div className='overflow-x-auto rounded-lg border'>
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
                <TableCell className='py-2.5'>
                  <span className='text-sm font-medium break-all'>
                    {app.app}
                  </span>
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
    </div>
  )
}
