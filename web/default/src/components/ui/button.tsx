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
import { isValidElement } from 'react'
import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Spinner } from '@/components/ui/spinner'

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding font-sans text-sm font-semibold tracking-[-0.005em] whitespace-nowrap transition-[background-color,border-color,box-shadow,transform,color] duration-fast ease-out outline-none select-none focus-visible:border-transparent focus-visible:shadow-[var(--ring)] active:not-aria-[haspopup]:translate-y-px active:not-aria-[haspopup]:scale-[0.985] disabled:pointer-events-none disabled:opacity-[0.45] aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-[var(--glow-brand)] hover:bg-brand-hover active:bg-brand-active',
        outline:
          'border-border-strong bg-transparent text-foreground hover:bg-surface-hover aria-expanded:bg-surface-hover',
        secondary:
          'border-border-strong bg-surface-2 text-foreground hover:bg-surface-3 aria-expanded:bg-surface-3',
        ghost:
          'text-[var(--text-secondary)] hover:bg-surface-hover hover:text-foreground aria-expanded:bg-surface-hover aria-expanded:text-foreground',
        subtle:
          'bg-brand-subtle text-brand hover:text-brand-hover hover:border-brand-border',
        destructive:
          'bg-destructive text-white hover:brightness-[1.08] focus-visible:border-destructive/40 focus-visible:shadow-[0_0_0_3px_var(--danger-subtle)]',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default:
          'h-[var(--control-md)] gap-2 px-4 text-sm has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3',
        xs: "h-6 gap-1 rounded-sm px-2 text-xs in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-[var(--control-sm)] gap-1.5 rounded-sm px-3 text-xs in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
        lg: 'h-[var(--control-lg)] gap-2 px-[22px] text-base has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4',
        icon: 'size-[var(--control-md)] text-[var(--text-secondary)] hover:bg-surface-hover hover:text-foreground active:scale-[0.92]',
        'icon-xs':
          "size-6 rounded-sm in-data-[slot=button-group]:rounded-md [&_svg:not([class*='size-'])]:size-3",
        'icon-sm':
          'size-[var(--control-sm)] rounded-sm text-[var(--text-secondary)] hover:bg-surface-hover hover:text-foreground active:scale-[0.92]',
        'icon-lg':
          'size-[var(--control-lg)] text-[var(--text-secondary)] hover:bg-surface-hover hover:text-foreground active:scale-[0.92]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

function isNativeButtonRender(render: ButtonPrimitive.Props['render']) {
  if (!render || !isValidElement(render)) {
    return true
  }

  return render.type === 'button'
}

function Button({
  className,
  variant = 'default',
  size = 'default',
  nativeButton,
  render,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & { loading?: boolean }) {
  // `loading` is additive and backward-compatible: it shows a leading spinner
  // and blocks interaction. We only inject the spinner when there's no custom
  // `render` element, since `render` replaces the element and owns its content.
  return (
    <ButtonPrimitive
      data-slot='button'
      data-loading={loading || undefined}
      className={cn(buttonVariants({ variant, size, className }))}
      nativeButton={nativeButton ?? isNativeButtonRender(render)}
      render={render}
      disabled={disabled || loading}
      {...props}
    >
      {loading && !render ? (
        <>
          <Spinner />
          {children}
        </>
      ) : (
        children
      )}
    </ButtonPrimitive>
  )
}

export { Button, buttonVariants }
