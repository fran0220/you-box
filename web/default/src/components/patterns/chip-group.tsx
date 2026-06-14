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
import {
  createContext,
  useContext,
  useRef,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

type ChipGroupContextValue = {
  type: 'single' | 'multiple'
  isSelected: (value: string) => boolean
  toggle: (value: string) => void
}

const ChipGroupContext = createContext<ChipGroupContextValue | null>(null)

type ChipGroupProps = {
  /** Single (radio semantics) or multiple (toggle semantics) selection. */
  type?: 'single' | 'multiple'
  value: string | string[] | null
  onValueChange: (value: string) => void
  /** Accessible group name. */
  label?: string
  className?: string
  children: ReactNode
}

/**
 * ChipGroup — selectable chip set (top-up presets, payment methods,
 * notification filters). Single-select uses radio semantics with
 * arrow-key roving focus; multi-select uses independent toggles.
 */
export function ChipGroup({
  type = 'single',
  value,
  onValueChange,
  label,
  className,
  children,
}: ChipGroupProps) {
  const ref = useRef<HTMLDivElement>(null)

  const isSelected = (v: string) =>
    Array.isArray(value) ? value.includes(v) : value === v

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (type !== 'single') return
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const chips = Array.from(
      ref.current?.querySelectorAll<HTMLButtonElement>(
        'button:not(:disabled)'
      ) ?? []
    )
    const current = chips.findIndex((chip) => chip === document.activeElement)
    const base = current >= 0 ? current : 0
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? chips.length - 1
          : (base + (event.key === 'ArrowRight' ? 1 : chips.length - 1)) %
            chips.length
    chips[next]?.focus()
    chips[next]?.click()
  }

  return (
    <ChipGroupContext.Provider
      value={{ type, isSelected, toggle: onValueChange }}
    >
      <div
        ref={ref}
        data-slot='chip-group'
        role={type === 'single' ? 'radiogroup' : 'group'}
        aria-label={label}
        onKeyDown={onKeyDown}
        className={cn('flex flex-wrap gap-2.5', className)}
      >
        {children}
      </div>
    </ChipGroupContext.Provider>
  )
}

const chipVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md border font-medium whitespace-nowrap transition-all duration-instant focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&>svg]:size-4',
  {
    variants: {
      size: {
        default: 'h-9 px-3.5 text-sm',
        /** Amount-preset form: tall chip with display-font value. */
        preset:
          'h-[52px] min-w-20 px-4 font-display text-lg font-bold tracking-[-0.01em]',
      },
      selected: {
        true: 'border-brand-border bg-brand-subtle text-brand',
        false:
          'border-border bg-surface-2 text-muted-foreground hover:border-border-strong hover:text-foreground',
      },
    },
    defaultVariants: { size: 'default', selected: false },
  }
)

type ChipProps = Omit<VariantProps<typeof chipVariants>, 'selected'> & {
  value: string
  disabled?: boolean
  className?: string
  children: ReactNode
}

/** A selectable chip; `size='preset'` renders the tall amount form. */
export function Chip({
  value,
  size,
  disabled,
  className,
  children,
}: ChipProps) {
  const group = useContext(ChipGroupContext)
  if (!group) {
    throw new Error('Chip must be used inside a ChipGroup')
  }
  const selected = group.isSelected(value)
  const single = group.type === 'single'
  return (
    <button
      type='button'
      data-slot='chip'
      role={single ? 'radio' : undefined}
      aria-checked={single ? selected : undefined}
      aria-pressed={single ? undefined : selected}
      tabIndex={single ? (selected ? 0 : -1) : 0}
      disabled={disabled}
      onClick={() => group.toggle(value)}
      className={cn(chipVariants({ size, selected }), className)}
    >
      {children}
    </button>
  )
}
