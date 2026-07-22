'use client'

import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox'
import { Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { cn } from '@/lib/utils'

function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot='checkbox'
      className={cn(
        'peer border-field-border bg-field hover:border-border-strong data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground duration-fast relative flex size-4 shrink-0 items-center justify-center rounded-xs border transition-[background-color,border-color,box-shadow] ease-out outline-none group-has-disabled/field:opacity-50 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:shadow-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-40 aria-invalid:border-destructive',
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot='checkbox-indicator'
        className='motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-50 duration-fast ease-spring grid place-content-center text-current [&>svg]:size-3.5'
      >
        <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
