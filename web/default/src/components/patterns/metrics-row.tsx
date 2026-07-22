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
