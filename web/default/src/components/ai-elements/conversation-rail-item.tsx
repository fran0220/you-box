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
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type ConversationRailItemProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Conversation title (single line, truncated). */
  title: ReactNode
  /** Sub line: model · relative time. */
  sub?: ReactNode
  active?: boolean
}

/**
 * ConversationRailItem (R2-A5) — chat sidebar entry: title + muted
 * model/time sub line, surface-2 active state.
 */
export const ConversationRailItem = ({
  title,
  sub,
  active,
  className,
  ...props
}: ConversationRailItemProps) => (
  <button
    type='button'
    data-slot='conversation-rail-item'
    aria-current={active ? 'true' : undefined}
    className={cn(
      'flex w-full flex-col items-start gap-0.5 rounded-md px-3 py-2.5 text-start transition-colors duration-[80ms]',
      'focus-visible:ring-ring/50 focus-visible:ring-2 focus-visible:outline-none',
      active ? 'bg-surface-2' : 'hover:bg-surface-hover',
      className
    )}
    {...props}
  >
    <span
      className={cn(
        'w-full truncate text-[13px]',
        active ? 'text-foreground font-semibold' : 'text-foreground font-medium'
      )}
    >
      {title}
    </span>
    {sub != null && (
      <span className='text-muted-foreground w-full truncate text-[11px]'>
        {sub}
      </span>
    )}
  </button>
)
