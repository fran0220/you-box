import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'group/badge inline-flex h-[21px] w-fit shrink-0 items-center justify-center gap-[5px] overflow-hidden rounded-sm border border-transparent px-2 py-0 font-sans text-xs font-medium whitespace-nowrap transition-all focus-visible:shadow-[var(--ring)] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&>svg]:pointer-events-none [&>svg]:size-3!',
  {
    variants: {
      variant: {
        default: 'bg-brand-subtle text-brand [a]:hover:bg-brand-subtle/80',
        secondary:
          'border-border bg-surface-3 text-[var(--text-secondary)] [a]:hover:bg-surface-3/80',
        destructive:
          'bg-danger-subtle text-destructive focus-visible:ring-destructive/20 [a]:hover:bg-destructive/20',
        success: 'bg-success-subtle text-success',
        warning: 'bg-warning-subtle text-warning',
        info: 'bg-info-subtle text-info',
        outline:
          'border-border bg-surface-2 text-muted-foreground [a]:hover:bg-surface-hover [a]:hover:text-foreground',
        ghost:
          'hover:bg-surface-hover hover:text-muted-foreground dark:hover:bg-surface-hover/50',
        link: 'text-primary underline-offset-4 hover:underline',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

function Badge({
  className,
  variant = 'default',
  render,
  ...props
}: useRender.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: 'span',
    props: mergeProps<'span'>(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: 'badge',
      variant,
    },
  })
}

export { Badge, badgeVariants }
