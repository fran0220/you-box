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
