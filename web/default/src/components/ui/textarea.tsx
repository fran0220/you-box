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
