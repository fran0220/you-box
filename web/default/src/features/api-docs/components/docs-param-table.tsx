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
import { cn } from '@/lib/utils'
import { StatusBadge } from '@/components/status-badge'
import type { DocsErrorRow, DocsParamRow } from '../lib/docs-reference'

type DocsParamTableProps = {
  rows: DocsParamRow[]
  brandName?: string
  className?: string
}

export function DocsParamTable(props: DocsParamTableProps) {
  const { t } = useTranslation()

  return (
    <div className={cn('border-border/60 border-t', props.className)}>
      <div className='text-muted-foreground grid grid-cols-[minmax(0,170px)_90px_1fr] gap-3.5 border-b py-2.5 font-mono text-[11px] tracking-[0.06em] uppercase'>
        <span>{t('Field')}</span>
        <span>{t('Type')}</span>
        <span>{t('Description')}</span>
      </div>
      {props.rows.map((row) => (
        <div
          key={row.field}
          className='border-border/60 grid grid-cols-[minmax(0,170px)_90px_1fr] items-baseline gap-3.5 border-t py-2.5 text-[13.5px]'
        >
          <span className='text-foreground font-mono'>
            {row.field}
            {row.required ? (
              <span className='text-destructive' aria-hidden='true'>
                {' '}
                *
              </span>
            ) : null}
          </span>
          <span className='text-muted-foreground font-mono'>{row.type}</span>
          <span className='text-muted-foreground leading-relaxed'>
            {t(row.description, { brandName: props.brandName })}
          </span>
        </div>
      ))}
    </div>
  )
}

type DocsErrorTableProps = {
  rows: DocsErrorRow[]
  className?: string
}

export function DocsErrorTable(props: DocsErrorTableProps) {
  const { t } = useTranslation()

  return (
    <div className={cn('border-border/60 border-t', props.className)}>
      <div className='text-muted-foreground grid grid-cols-[90px_1fr] gap-3.5 border-b py-2.5 font-mono text-[11px] tracking-[0.06em] uppercase'>
        <span>{t('Code')}</span>
        <span>{t('Meaning')}</span>
      </div>
      {props.rows.map((row) => (
        <div
          key={row.code}
          className='border-border/60 grid grid-cols-[90px_1fr] items-baseline gap-3.5 border-t py-2.5 text-[13.5px]'
        >
          <span>
            <StatusBadge variant={row.variant}>{row.code}</StatusBadge>
          </span>
          <span className='text-muted-foreground leading-relaxed'>
            {t(row.meaning)}
          </span>
        </div>
      ))}
    </div>
  )
}
