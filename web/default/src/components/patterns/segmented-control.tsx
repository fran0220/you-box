import { useId } from 'react'
import { m, useReducedMotion } from 'motion/react'
import { MOTION_TRANSITION } from '@/lib/motion'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export type SegmentedControlOption = {
  value: string
  label?: string
  icon?: React.ComponentType<{ className?: string }>
  tooltip?: string
}

export type SegmentedControlProps = {
  options: SegmentedControlOption[]
  value: string
  onChange: (value: string) => void
  ariaLabel: string
  className?: string
}

/**
 * SegmentedControl — compact toggle group of mutually exclusive options
 * (role=group + aria-pressed buttons). Options render a text label, an
 * icon, or both; icon-only options can attach a tooltip.
 */
export function SegmentedControl(props: SegmentedControlProps) {
  // Unique per instance so multiple segmented controls on a page don't share
  // (and fight over) the same Framer shared-layout indicator.
  const layoutId = useId()
  const reduceMotion = useReducedMotion()

  return (
    <div
      role='group'
      aria-label={props.ariaLabel}
      className={cn(
        'bg-muted/60 inline-flex h-8 items-center rounded-lg border p-0.5',
        props.className
      )}
    >
      {props.options.map((option) => {
        const Icon = option.icon
        const isActive = option.value === props.value
        const button = (
          <button
            key={option.value}
            type='button'
            onClick={() => props.onChange(option.value)}
            aria-pressed={isActive}
            className={cn(
              'relative inline-flex h-full items-center justify-center rounded-md text-xs font-medium transition-colors',
              Icon && !option.label ? 'w-7' : 'gap-1.5 px-3',
              isActive
                ? 'text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {isActive &&
              (reduceMotion ? (
                <span className='bg-primary absolute inset-0 rounded-md shadow-sm' />
              ) : (
                <m.span
                  layoutId={layoutId}
                  className='bg-primary absolute inset-0 rounded-md shadow-sm'
                  transition={MOTION_TRANSITION.default}
                />
              ))}
            {Icon && <Icon className='relative z-10 size-3.5' />}
            {option.label && (
              <span className='relative z-10'>{option.label}</span>
            )}
          </button>
        )

        if (!option.tooltip) {
          return button
        }

        return (
          <Tooltip key={option.value}>
            <TooltipTrigger render={button}></TooltipTrigger>
            <TooltipContent side='bottom' className='text-xs'>
              {option.tooltip}
            </TooltipContent>
          </Tooltip>
        )
      })}
    </div>
  )
}
