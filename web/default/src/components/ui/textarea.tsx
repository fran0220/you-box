import * as React from 'react'
import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot='textarea'
      className={cn(
        'border-field-border bg-field text-foreground flex field-sizing-content min-h-16 w-full resize-y rounded-md border px-3 py-2.5 font-sans text-sm transition-[border-color,box-shadow] duration-fast ease-out outline-none placeholder:text-[var(--field-placeholder)] hover:border-border-strong focus-visible:border-brand focus-visible:shadow-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:shadow-[0_0_0_3px_var(--danger-subtle)] dark:aria-invalid:border-destructive/50',
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
