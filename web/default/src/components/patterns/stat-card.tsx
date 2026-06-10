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
import { DeltaBadge } from './delta-badge'
import { Sparkline } from './sparkline'

export type StatCardDelta = {
  direction: 'up' | 'down' | 'flat'
  label: ReactNode
  /** Override the direction-derived color (e.g. latency drop = success). */
  tone?: 'success' | 'danger' | 'muted'
}

type StatCardProps = ComponentProps<'div'> & {
  /** Mono uppercase label, with optional leading icon. */
  label: ReactNode
  icon?: ReactNode
  /** Display-font value; keep it short — units go in `unit`. */
  value: ReactNode
  /** Mono unit rendered after the value (`M`, `s`, `%`). */
  unit?: ReactNode
  delta?: StatCardDelta
  /** Mini sparkline series rendered between value and delta. */
  sparkline?: number[]
  sparklineColor?: string
  size?: 'md' | 'sm'
  /** Skeleton state — keeps card height stable while data loads. */
  loading?: boolean
}

/**
 * StatCard — the unified YouBox stat tile.
 *
 * Anatomy: label (mono uppercase + optional icon) → value (display font
 * + mono unit) → optional sparkline → optional DeltaBadge. Replaces the
 * dashboard's private StatCard and wallet's simplified cards.
 */
export function StatCard({
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
  ...props
}: StatCardProps) {
  const sm = size === 'sm'
  return (
    <div
      data-slot='stat-card'
      className={cn(
        'bg-card rounded-lg border',
        sm ? 'p-3.5' : 'p-4 sm:p-5',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'text-muted-foreground flex items-center gap-2 font-mono font-medium tracking-[0.06em] uppercase',
          sm ? 'text-[9px]' : 'text-[10px]'
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
            'font-display text-foreground flex items-baseline gap-1.5 leading-none font-bold tracking-[-0.025em]',
            sm ? 'mt-2 text-xl' : 'mt-3 text-2xl sm:text-3xl'
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

type StatCardRowProps = ComponentProps<'div'> & {
  /** Column count at the widest breakpoint. */
  columns?: 2 | 3 | 4 | 5
}

const COLUMN_CLASS: Record<NonNullable<StatCardRowProps['columns']>, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-2 xl:grid-cols-4',
  5: 'sm:grid-cols-2 xl:grid-cols-5',
}

/** Responsive grid for StatCards: n columns → 2 → 1 as space shrinks. */
export function StatCardRow({
  columns = 4,
  className,
  ...props
}: StatCardRowProps) {
  return (
    <div
      data-slot='stat-card-row'
      className={cn(
        'grid grid-cols-1 gap-3 sm:gap-4',
        COLUMN_CLASS[columns],
        className
      )}
      {...props}
    />
  )
}
