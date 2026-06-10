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

type TransactionRowProps = Omit<ComponentProps<'div'>, 'title'> & {
  title: ReactNode
  /** Mono sub line: date or range. */
  sub?: ReactNode
  /** Signed amount text ("+$100.00" / "−$54.20"). */
  amount: ReactNode
  /** in = credit (success), out = debit (secondary). */
  direction: 'in' | 'out'
}

/**
 * TransactionRow — ledger line: type + mono date sub, direction-colored
 * mono amount on the right.
 */
export function TransactionRow({
  title,
  sub,
  amount,
  direction,
  className,
  ...props
}: TransactionRowProps) {
  return (
    <div
      data-slot='transaction-row'
      className={cn(
        'border-divider flex items-center gap-3 border-b px-4 py-3 last:border-b-0 sm:px-5',
        className
      )}
      {...props}
    >
      <div className='min-w-0 flex-1'>
        <div className='text-foreground truncate text-sm font-medium'>{title}</div>
        {sub != null && (
          <div className='text-muted-foreground truncate font-mono text-xs'>
            {sub}
          </div>
        )}
      </div>
      <span
        className={cn(
          'shrink-0 font-mono text-sm tabular-nums',
          direction === 'in' ? 'text-success' : 'text-muted-foreground'
        )}
      >
        {amount}
      </span>
    </div>
  )
}

type InvoiceRowProps = Omit<ComponentProps<'div'>, 'title'> & {
  /** Billing period title ("Jun 2026"). */
  title: ReactNode
  sub?: ReactNode
  amount: ReactNode
  /** Status badge node (StatusBadge / Badge). */
  status?: ReactNode
  /** Trailing action (download button). */
  action?: ReactNode
}

/** InvoiceRow — period + mono amount + status badge + trailing action. */
export function InvoiceRow({
  title,
  sub,
  amount,
  status,
  action,
  className,
  ...props
}: InvoiceRowProps) {
  return (
    <div
      data-slot='invoice-row'
      className={cn(
        'border-divider flex items-center gap-3 border-b px-4 py-3 last:border-b-0 sm:px-5',
        className
      )}
      {...props}
    >
      <div className='min-w-0 flex-1'>
        <div className='text-foreground truncate text-sm font-medium'>{title}</div>
        {sub != null && (
          <div className='text-muted-foreground truncate font-mono text-xs'>
            {sub}
          </div>
        )}
      </div>
      <span className='text-foreground shrink-0 font-mono text-sm tabular-nums'>
        {amount}
      </span>
      {status}
      {action}
    </div>
  )
}
