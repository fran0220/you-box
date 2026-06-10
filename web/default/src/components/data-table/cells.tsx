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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

/**
 * Column primitives for table v2. Use these inside column `cell`
 * renderers so numerics, identity cells, latency and row actions look
 * identical on every list page.
 */

type MonoCellProps = ComponentProps<'div'> & {
  /** Numeric/time cells right-align by default. */
  align?: 'left' | 'right'
  muted?: boolean
}

/** Mono numeric/time cell — tabular nums, right-aligned by default. */
export function MonoCell({
  align = 'right',
  muted,
  className,
  ...props
}: MonoCellProps) {
  return (
    <div
      data-slot='mono-cell'
      className={cn(
        'font-mono text-[13px] tabular-nums',
        align === 'right' && 'text-right',
        muted && 'text-muted-foreground',
        className
      )}
      {...props}
    />
  )
}

type CellFlexProps = {
  /** Leading visual: avatar, provider logo tile, icon. */
  leading?: ReactNode
  /** Primary line — medium weight. */
  primary: ReactNode
  /** Secondary mono line below the primary (id, email, type). */
  secondary?: ReactNode
  className?: string
}

/** Identity cell — avatar/icon + primary text + mono secondary line. */
export function CellFlex({
  leading,
  primary,
  secondary,
  className,
}: CellFlexProps) {
  return (
    <div
      data-slot='cell-flex'
      className={cn('flex items-center gap-2.5', className)}
    >
      {leading != null && <span className='shrink-0'>{leading}</span>}
      <div className='min-w-0'>
        <div className='text-foreground truncate text-sm font-medium'>
          {primary}
        </div>
        {secondary != null && (
          <div className='text-muted-foreground truncate font-mono text-xs'>
            {secondary}
          </div>
        )}
      </div>
    </div>
  )
}

type LatencyBadgeProps = {
  /** Latency in milliseconds; null/undefined renders a muted dash. */
  ms?: number | null
  /** Upper bound (ms) for the success tone. */
  goodMs?: number
  /** Upper bound (ms) for the warning tone; above it = danger. */
  warnMs?: number
  className?: string
}

/** Threshold-colored latency badge: ≤good success, ≤warn warning, else danger. */
export function LatencyBadge({
  ms,
  goodMs = 1000,
  warnMs = 3000,
  className,
}: LatencyBadgeProps) {
  if (ms == null || Number.isNaN(ms)) {
    return <span className='text-muted-foreground'>—</span>
  }
  const variant =
    ms <= goodMs ? 'success' : ms <= warnMs ? 'warning' : 'destructive'
  return (
    <Badge variant={variant} className={className}>
      <span
        aria-hidden='true'
        className='size-1.5 rounded-full bg-current opacity-80'
      />
      {(ms / 1000).toFixed(2)}s
    </Badge>
  )
}

type RowActionsProps = ComponentProps<'div'> & {
  /** Always show the actions instead of revealing them on row hover. */
  alwaysVisible?: boolean
}

/**
 * RowActions — right-aligned icon button group revealed on row hover
 * (rows rendered by DataTablePage expose the `group/row` scope).
 * Stays visible while focused, on touch layouts and when the row's
 * menu is open.
 */
export function RowActions({
  alwaysVisible,
  className,
  ...props
}: RowActionsProps) {
  return (
    <div
      data-slot='row-actions'
      className={cn(
        'flex items-center justify-end gap-1',
        !alwaysVisible &&
          'transition-opacity duration-[80ms] sm:opacity-0 sm:group-hover/row:opacity-100 sm:has-focus-visible:opacity-100 sm:has-[[aria-expanded=true]]:opacity-100',
        className
      )}
      {...props}
    />
  )
}

type RowActionButtonProps = ComponentProps<typeof Button> & {
  /** Accessible name — icon-only buttons must label themselves. */
  label: string
}

/** Convenience ghost icon button for RowActions. */
export function RowActionButton({
  label,
  className,
  children,
  ...props
}: RowActionButtonProps) {
  return (
    <Button
      variant='ghost'
      size='icon-xs'
      aria-label={label}
      title={label}
      className={cn(
        'text-muted-foreground hover:text-foreground size-7',
        className
      )}
      {...props}
    >
      {children}
    </Button>
  )
}
