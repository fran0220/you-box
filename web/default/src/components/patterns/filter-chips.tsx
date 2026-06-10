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
import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Chip, ChipGroup } from './chip-group'

export type FilterChipItem<T extends string = string> = {
  value: T
  label: ReactNode
  count?: number
}

type FilterChipsProps<T extends string> = {
  items: FilterChipItem<T>[]
  value: T
  onValueChange: (value: T) => void
  label?: string
  className?: string
}

/**
 * FilterChips — pill-shaped single-select chips with mono counts
 * (All 12 / Unread 3 / Billing / System). ChipGroup semantics and
 * keyboard behavior apply.
 */
export function FilterChips<T extends string>({
  items,
  value,
  onValueChange,
  label,
  className,
}: FilterChipsProps<T>) {
  return (
    <ChipGroup
      value={value}
      onValueChange={(v) => onValueChange(v as T)}
      label={label}
      className={cn('gap-2', className)}
    >
      {items.map((item) => (
        <Chip
          key={item.value}
          value={item.value}
          className='h-[30px] rounded-full px-3 text-[13px]'
        >
          {item.label}
          {item.count != null && (
            <span className='font-mono text-[11px] opacity-60'>{item.count}</span>
          )}
        </Chip>
      ))}
    </ChipGroup>
  )
}
