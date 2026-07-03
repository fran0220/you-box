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
import { type ComponentProps } from 'react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

type MetricsRowProps = ComponentProps<'div'> & {
  loading?: boolean
  /** Skeleton slots while loading. */
  count?: number
}

/**
 * MetricsRow — inline stat summary under a page header: Metric pairs
 * separated by whitespace over a hairline. Replaces stat-card grids
 * (paper restraint: numbers live in rows, not tiles).
 */
export function MetricsRow({
  loading,
  count = 3,
  className,
  children,
  ...props
}: MetricsRowProps) {
  return (
    <div
      data-slot='metrics-row'
      className={cn(
        'border-border flex flex-wrap items-center gap-x-8 gap-y-2 border-b pb-3',
        className
      )}
      {...props}
    >
      {loading
        ? Array.from({ length: count }).map((_, i) => (
            <Skeleton key={i} className='h-9 w-24' />
          ))
        : children}
    </div>
  )
}
