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
import { useRef, type KeyboardEvent, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type FilterTabItem<T extends string = string> = {
  value: T
  label: ReactNode
  /** Optional mono count rendered after the label. */
  count?: number
}

type FilterTabsProps<T extends string> = {
  items: FilterTabItem<T>[]
  value: T
  onValueChange: (value: T) => void
  /** Accessible group name, e.g. t('Filter by status'). */
  label?: string
  className?: string
}

/**
 * FilterTabs — pill tab strip used as a table quick filter
 * (All / Enabled / Issues). Single-select with radiogroup semantics and
 * arrow-key roving focus; pair with URL state via the consumer.
 */
export function FilterTabs<T extends string>({
  items,
  value,
  onValueChange,
  label,
  className,
}: FilterTabsProps<T>) {
  const ref = useRef<HTMLDivElement>(null)

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const index = items.findIndex((item) => item.value === value)
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? items.length - 1
          : (index + (event.key === 'ArrowRight' ? 1 : items.length - 1)) %
            items.length
    onValueChange(items[next].value)
    ref.current?.querySelectorAll<HTMLButtonElement>('button')[next]?.focus()
  }

  return (
    <div
      ref={ref}
      data-slot='filter-tabs'
      role='radiogroup'
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn(
        'bg-surface-2 inline-flex items-center gap-0.5 rounded-md border p-1',
        className
      )}
    >
      {items.map((item) => {
        const active = item.value === value
        return (
          <button
            key={item.value}
            type='button'
            role='radio'
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onValueChange(item.value)}
            className={cn(
              'duration-instant flex items-center gap-1.5 rounded-sm px-3 py-1 text-sm font-medium whitespace-nowrap transition-colors',
              'focus-visible:ring-ring/50 focus-visible:ring-2 focus-visible:outline-none',
              active
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {item.label}
            {item.count != null && (
              <span
                className={cn(
                  'font-mono text-[10px]',
                  active ? 'text-muted-foreground' : 'text-muted-foreground/60'
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
