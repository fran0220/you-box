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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group'

type MonoInputProps = Omit<
  ComponentProps<typeof InputGroupInput>,
  'prefix'
> & {
  /** Leading addon (currency symbol, `≤`, icon). */
  prefix?: ReactNode
  /** Trailing addon (unit, `%`, `/s`, currency select). */
  suffix?: ReactNode
  containerClassName?: string
}

/**
 * MonoInput — mono-spaced input with optional prefix/suffix addons.
 * The base for numeric, code-like and amount fields.
 */
export function MonoInput({
  prefix,
  suffix,
  containerClassName,
  className,
  ...props
}: MonoInputProps) {
  return (
    <InputGroup data-slot='mono-input' className={containerClassName}>
      {prefix != null && (
        <InputGroupAddon align='inline-start'>
          <InputGroupText className='text-muted-foreground font-mono'>
            {prefix}
          </InputGroupText>
        </InputGroupAddon>
      )}
      <InputGroupInput
        className={cn('font-mono text-sm tabular-nums', className)}
        {...props}
      />
      {suffix != null && (
        <InputGroupAddon align='inline-end'>
          <InputGroupText className='text-muted-foreground font-mono'>
            {suffix}
          </InputGroupText>
        </InputGroupAddon>
      )}
    </InputGroup>
  )
}

type CurrencyInputProps = Omit<MonoInputProps, 'prefix' | 'suffix'> & {
  /** Currency symbol shown as prefix. */
  symbol?: string
  /** Currency selector (or static code) rendered after the field. */
  currency?: ReactNode
  containerClassName?: string
}

/** CurrencyInput — `$` amount field with an adjacent currency slot. */
export function CurrencyInput({
  symbol = '$',
  currency,
  containerClassName,
  ...props
}: CurrencyInputProps) {
  return (
    <div
      data-slot='currency-input'
      className={cn('flex items-center gap-2.5', containerClassName)}
    >
      <MonoInput
        prefix={symbol}
        inputMode='decimal'
        containerClassName='flex-1'
        {...props}
      />
      {currency}
    </div>
  )
}

type ThresholdInputProps = Omit<MonoInputProps, 'prefix'> & {
  /** Comparator/operation label: `≤ $`, `+ $`. */
  operator: ReactNode
}

/** ThresholdInput — `≤ $25` / `+ $50` form for limits and auto rules. */
export function ThresholdInput({ operator, ...props }: ThresholdInputProps) {
  return <MonoInput prefix={operator} inputMode='decimal' {...props} />
}
