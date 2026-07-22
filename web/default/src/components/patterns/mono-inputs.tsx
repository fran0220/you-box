import { type ComponentProps, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group'

type MonoInputProps = Omit<ComponentProps<typeof InputGroupInput>, 'prefix'> & {
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
