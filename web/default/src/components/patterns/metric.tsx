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
