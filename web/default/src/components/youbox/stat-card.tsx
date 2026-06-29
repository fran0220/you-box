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
import { type ComponentProps, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { DeltaBadge } from '@/components/patterns/delta-badge'
import { Sparkline } from '@/components/patterns/sparkline'

export type StatCardDelta = {
  direction: 'up' | 'down' | 'flat'
  label: ReactNode
  tone?: 'success' | 'danger' | 'muted'
}

export type StatCardProps = ComponentProps<'div'> & {
  label: ReactNode
  icon?: ReactNode
  value: ReactNode
  unit?: ReactNode
  delta?: StatCardDelta
  sparkline?: number[]
  sparklineColor?: string
  size?: 'md' | 'sm'
  loading?: boolean
}

export function StatCard(props: StatCardProps) {
  const {
    label,
    icon,
    value,
    unit,
    delta,
    sparkline,
    sparklineColor,
    size = 'md',
    loading,
    className,
    ...rest
  } = props
  const sm = size === 'sm'
  return (
    <div
      data-slot='youbox-stat-card'
      className={cn(
        'bg-card rounded-lg border',
        sm ? 'p-3.5' : 'p-4 sm:p-5',
        className
      )}
      {...rest}
    >
      <div
        className={cn(
          'text-muted-foreground flex items-center gap-2 font-mono text-[11px] font-medium tracking-[0.06em] uppercase',
          sm && 'text-[10px]'
        )}
      >
        {icon != null && (
          <span
            aria-hidden='true'
            className='text-muted-foreground/70 [&>svg]:size-[15px]'
          >
            {icon}
          </span>
        )}
        {label}
      </div>
      {loading ? (
        <Skeleton className={cn('mt-3 h-8 w-24', sm && 'mt-2 h-6 w-16')} />
      ) : (
        <div
          className={cn(
            'font-display text-foreground flex items-baseline gap-1.5 leading-none font-semibold tracking-[-0.02em]',
            sm ? 'mt-2 text-lg' : 'mt-3 text-[26px]'
          )}
        >
          {value}
          {unit != null && (
            <span className='text-muted-foreground font-mono text-sm font-normal'>
              {unit}
            </span>
          )}
        </div>
      )}
      {sparkline != null && sparkline.length > 0 && !loading && (
        <div className='mt-3'>
          <Sparkline
            data={sparkline}
            color={sparklineColor}
            height={sm ? 24 : 34}
          />
        </div>
      )}
      {delta != null && !loading && (
        <DeltaBadge
          direction={delta.direction}
          tone={delta.tone}
          className={cn('mt-2.5', sm && 'mt-1.5 text-[11px]')}
        >
          {delta.label}
        </DeltaBadge>
      )}
    </div>
  )
}

export type StatCardRowProps = ComponentProps<'div'> & {
  columns?: 2 | 3 | 4 | 5
}

const COLUMN_CLASS: Record<NonNullable<StatCardRowProps['columns']>, string> =
  {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-3',
    4: 'sm:grid-cols-2 xl:grid-cols-4',
    5: 'sm:grid-cols-2 xl:grid-cols-5',
  }

export function StatCardRow(props: StatCardRowProps) {
  const { columns = 4, className, ...rest } = props
  return (
    <div
      data-slot='youbox-stat-card-row'
      className={cn(
        'grid grid-cols-1 gap-3 sm:gap-4',
        COLUMN_CLASS[columns],
        className
      )}
      {...rest}
    />
  )
}
