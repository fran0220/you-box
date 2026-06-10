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

type MetricProps = ComponentProps<'div'> & {
  /** Key — mono 9px uppercase muted. */
  k: ReactNode
  /** Value — mono sm; pass markup to accent parts in brand color. */
  v: ReactNode
  /** End-aligned variant (card footers, right rails). */
  align?: 'start' | 'end'
}

/**
 * Metric — compact k/v pair (label over mono value) used in card
 * footers, account cards and session stats.
 */
export function Metric({
  k,
  v,
  align = 'start',
  className,
  ...props
}: MetricProps) {
  return (
    <div
      data-slot='metric'
      className={cn(
        'flex flex-col gap-0.5',
        align === 'end' && 'items-end text-right',
        className
      )}
      {...props}
    >
      <span className='text-muted-foreground font-mono text-[9px] tracking-[0.06em] uppercase'>
        {k}
      </span>
      <span className='text-foreground [&_b]:text-brand font-mono text-sm font-medium [&_b]:font-medium'>
        {v}
      </span>
    </div>
  )
}
