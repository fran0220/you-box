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
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const progressFillVariants = cva(
  'block h-full rounded-full transition-[width] duration-300 ease-out motion-reduce:transition-none',
  {
    variants: {
      tone: {
        brand: 'bg-brand',
        teal: 'bg-success',
        success: 'bg-success',
        warning: 'bg-warning',
        danger: 'bg-destructive',
      },
    },
    defaultVariants: { tone: 'brand' },
  }
)

type ProgressBarProps = Omit<ComponentProps<'div'>, 'children'> &
  VariantProps<typeof progressFillVariants> & {
    /** Current value; rendered as a fraction of `max`. */
    value: number
    max?: number
    /** Accessible name; falls back to a plain progressbar role. */
    label?: string
  }

/**
 * ProgressBar — 6px pill track (surface-3) with a semantic fill.
 * Shared by usage meters, redemption progress and subscription seats.
 */
export function ProgressBar({
  value,
  max = 100,
  tone,
  label,
  className,
  ...props
}: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0
  return (
    <div
      data-slot='progress-bar'
      role='progressbar'
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.min(max, Math.max(0, value))}
      aria-label={label}
      className={cn(
        'bg-surface-3 h-1.5 w-full overflow-hidden rounded-full',
        className
      )}
      {...props}
    >
      <i
        className={progressFillVariants({ tone })}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
