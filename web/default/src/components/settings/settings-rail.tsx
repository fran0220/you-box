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

export type SettingsRailItem<T extends string = string> = {
  value: T
  label: ReactNode
  icon?: ReactNode
}

type SettingsRailProps<T extends string> = {
  items: SettingsRailItem<T>[]
  value: T
  /** Selection callback — wire to router navigation in pages. */
  onValueChange: (value: T) => void
  /** Accessible name for the navigation group. */
  label?: string
  className?: string
}

/**
 * SettingsRail — settings navigation: a 220px sticky vertical rail on
 * desktop that collapses to a horizontal scroll strip on small screens.
 * Roving-focus arrow keys; selection drives routing in the consumer.
 */
export function SettingsRail<T extends string>({
  items,
  value,
  onValueChange,
  label,
  className,
}: SettingsRailProps<T>) {
  const ref = useRef<HTMLDivElement>(null)

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const keys = ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Home', 'End']
    if (!keys.includes(event.key)) return
    event.preventDefault()
    const index = items.findIndex((item) => item.value === value)
    const forward = event.key === 'ArrowDown' || event.key === 'ArrowRight'
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? items.length - 1
          : (index + (forward ? 1 : items.length - 1)) % items.length
    onValueChange(items[next].value)
    ref.current?.querySelectorAll<HTMLButtonElement>('button')[next]?.focus()
  }

  return (
    <div
      ref={ref}
      data-slot='settings-rail'
      role='radiogroup'
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn(
        '-mx-1 flex gap-0.5 overflow-x-auto px-1 pb-1',
        'lg:sticky lg:top-20 lg:mx-0 lg:w-[220px] lg:flex-col lg:self-start lg:overflow-visible lg:px-0 lg:pb-0',
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
              'flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-[80ms] lg:w-full',
              'focus-visible:ring-ring/50 focus-visible:ring-2 focus-visible:outline-none',
              active
                ? 'bg-surface-2 text-foreground'
                : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground'
            )}
          >
            {item.icon != null && (
              <span aria-hidden='true' className='[&>svg]:size-4'>
                {item.icon}
              </span>
            )}
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
