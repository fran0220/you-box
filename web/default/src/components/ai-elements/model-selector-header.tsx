import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

type ModelSelectorHeaderProps = HTMLAttributes<HTMLDivElement> & {
  /** The model picker trigger (selector button/popover trigger). */
  trigger: ReactNode
  /** Meta tags after the trigger: throughput, price per 1M. */
  tags?: ReactNode
  /** Right-aligned icon actions (reset, share). */
  actions?: ReactNode
}

/**
 * ModelSelectorHeader (R2-A5) — the playground/chat header row:
 * model picker trigger + meta tags + spacer + icon actions, bottom
 * divider included.
 */
export const ModelSelectorHeader = ({
  trigger,
  tags,
  actions,
  className,
  ...props
}: ModelSelectorHeaderProps) => (
  <div
    data-slot='model-selector-header'
    className={cn(
      'flex min-w-0 flex-wrap items-center gap-2.5 border-b px-4 py-3 sm:px-6',
      className
    )}
    {...props}
  >
    {trigger}
    {tags != null && (
      <div className='hidden items-center gap-2 md:flex'>{tags}</div>
    )}
    <div className='flex-1' />
    {actions != null && (
      <div className='flex shrink-0 items-center gap-1'>{actions}</div>
    )}
  </div>
)

type ModelMetaTagProps = HTMLAttributes<HTMLSpanElement> & {
  icon?: ReactNode
}

/** Mono meta tag for the header: `⚡ 118 tok/s`, `$3 / $15 per 1M`. */
export const ModelMetaTag = ({
  icon,
  className,
  children,
  ...props
}: ModelMetaTagProps) => (
  <Badge
    variant='outline'
    className={cn('h-6 gap-1.5 px-2.5', className)}
    {...props}
  >
    {icon != null && (
      <span aria-hidden='true' className='[&>svg]:size-3'>
        {icon}
      </span>
    )}
    {children}
  </Badge>
)
