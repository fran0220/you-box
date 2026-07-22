import * as React from 'react'
import { Input as InputPrimitive } from '@base-ui/react/input'
import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <InputPrimitive
      type={type}
      data-slot='input'
      className={cn(
        'border-field-border bg-field text-foreground file:text-foreground h-[var(--control-md)] w-full min-w-0 rounded-md border px-3.5 py-0 font-sans text-base transition-[border-color,box-shadow] duration-fast ease-out outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--field-placeholder)] hover:border-border-strong focus-visible:border-brand focus-visible:shadow-[var(--ring)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:shadow-[0_0_0_3px_var(--danger-subtle)] dark:aria-invalid:border-destructive/50 md:text-sm',
        className
      )}
      {...props}
    />
  )
}

export { Input }
