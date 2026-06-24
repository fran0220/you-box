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
import { useId } from 'react'
import { cn } from '@/lib/utils'
import { Slider } from '@/components/ui/slider'

type ParameterSliderProps = {
  label: string
  value: number
  onValueChange: (value: number) => void
  min: number
  max: number
  step?: number
  disabled?: boolean
  /** Custom value formatter (defaults to the raw number). */
  formatValue?: (value: number) => string
  className?: string
}

/**
 * ParameterSlider — label + mono readout + filled track. The playground
 * parameter-rail control (temperature, max tokens, top_p…).
 */
export function ParameterSlider({
  label,
  value,
  onValueChange,
  min,
  max,
  step = 1,
  disabled,
  formatValue,
  className,
}: ParameterSliderProps) {
  const id = useId()
  return (
    <div
      data-slot='parameter-slider'
      className={cn('flex flex-col gap-2', className)}
    >
      <div className='flex items-baseline justify-between gap-3'>
        <label
          htmlFor={id}
          className={cn(
            'text-muted-foreground text-[13px]',
            disabled && 'opacity-50'
          )}
        >
          {label}
        </label>
        <span
          className={cn(
            'text-foreground font-mono text-[13px] font-medium tabular-nums',
            disabled && 'opacity-50'
          )}
        >
          {formatValue ? formatValue(value) : value}
        </span>
      </div>
      <Slider
        id={id}
        aria-label={label}
        value={[value]}
        onValueChange={(v) => {
          const next = Array.isArray(v) ? v[0] : v
          if (typeof next === 'number') onValueChange(next)
        }}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
      />
    </div>
  )
}
