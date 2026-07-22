import { type ComponentProps, type ReactNode } from 'react'
import { Inbox, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export type EmptyStateProps = ComponentProps<'div'> & {
  icon?: LucideIcon
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState(props: EmptyStateProps) {
  const {
    icon: IconProp,
    title,
    description,
    action,
    actionLabel,
    onAction,
    className,
    ...rest
  } = props
  const Icon = IconProp ?? Inbox
  const resolvedAction =
    action ??
    (onAction != null && actionLabel != null ? (
      <Button onClick={onAction}>{actionLabel}</Button>
    ) : null)

  return (
    <div
      data-slot='youbox-empty-state'
      className={cn(
        'flex flex-col items-center justify-center px-6 py-12 text-center',
        className
      )}
      {...rest}
    >
      <div className='bg-brand-subtle text-brand border-brand-border flex size-12 items-center justify-center rounded-xl border'>
        <Icon aria-hidden='true' className='size-6 opacity-90' />
      </div>
      <p className='text-foreground mt-4 text-base font-semibold tracking-[-0.01em]'>
        {title}
      </p>
      {description != null && (
        <p className='text-muted-foreground mt-1.5 max-w-sm text-sm leading-relaxed'>
          {description}
        </p>
      )}
      {resolvedAction != null && <div className='mt-6'>{resolvedAction}</div>}
    </div>
  )
}
