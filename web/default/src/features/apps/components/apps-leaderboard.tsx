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
import { formatCompactNumber } from '@/lib/format'
import { cn } from '@/lib/utils'
import { RankBadge } from '@/components/patterns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { AppRankingRow } from '@/features/apps/api'

// `RankBadge` now lives in `@/components/patterns`; re-export it here to
// preserve the original import path used by this module's consumers.
export { RankBadge }

/**
 * Ranked table of apps by request/token usage. Shared by the standalone
 * /apps leaderboard page and the per-model apps tab in model details.
 */
export function AppsLeaderboardTable(props: {
  apps: AppRankingRow[]
  /** When true, omit outer border/radius (parent Card provides the shell). */
  embedded?: boolean
  rounded?: 'lg' | 'xl'
}) {
  const { t } = useTranslation()
  let radius: string | undefined
  if (props.embedded !== true) {
    radius = props.rounded === 'xl' ? 'rounded-xl' : 'rounded-lg'
  }

  const table = (
    <Table className='text-sm'>
      <TableHeader>
        <TableRow className='hover:bg-transparent'>
          <TableHead className='w-12'>#</TableHead>
          <TableHead>{t('App')}</TableHead>
          <TableHead className='text-right'>{t('Requests')}</TableHead>
          <TableHead className='text-right'>{t('Tokens')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {props.apps.map((app, index) => (
          <TableRow key={`${app.app}-${index}`}>
            <TableCell className='py-3'>
              <RankBadge rank={index + 1} />
            </TableCell>
            <TableCell className='text-foreground py-3 font-medium break-all'>
              {app.app}
            </TableCell>
            <TableCell className='py-3 text-right font-mono tabular-nums'>
              {app.request_count.toLocaleString()}
            </TableCell>
            <TableCell className='py-3 text-right font-mono tabular-nums'>
              {formatCompactNumber(app.total_tokens)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )

  if (props.embedded === true) {
    return table
  }

  return (
    <div className={cn('border-border overflow-x-auto border', radius)}>
      {table}
    </div>
  )
}
