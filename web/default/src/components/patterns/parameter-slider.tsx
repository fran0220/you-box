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
