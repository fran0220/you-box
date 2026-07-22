import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

/**
 * StreamingCursor (R2-A5) — blinking brand caret appended to streaming
 * text. Decorative (aria-hidden); reduced motion renders it steady.
 */
export const StreamingCursor = ({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) => (
  <span
    aria-hidden='true'
    data-slot='streaming-cursor'
    className={cn(
      'bg-brand ms-0.5 inline-block h-4 w-[7px] translate-y-[3px]',
      'motion-safe:animate-[yb-blink_1.1s_step-end_infinite] motion-reduce:opacity-70',
      className
    )}
    {...props}
  />
)
