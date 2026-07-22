import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type ConversationRailItemProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Conversation title (single line, truncated). */
  title: ReactNode
  /** Sub line: model · relative time. */
  sub?: ReactNode
  active?: boolean
}

/**
 * ConversationRailItem (R2-A5) — chat sidebar entry: title + muted
 * model/time sub line, surface-2 active state.
 */
export const ConversationRailItem = ({
  title,
  sub,
  active,
  className,
  ...props
}: ConversationRailItemProps) => (
  <button
    type='button'
    data-slot='conversation-rail-item'
    aria-current={active ? 'true' : undefined}
    className={cn(
      'duration-instant flex w-full flex-col items-start gap-0.5 rounded-md px-3 py-2.5 text-start transition-colors',
      'focus-visible:ring-ring/50 focus-visible:ring-2 focus-visible:outline-none',
      active
        ? 'bg-surface-2 text-foreground'
        : 'hover:bg-surface-hover text-foreground',
      className
    )}
    {...props}
  >
    <span
      className={cn(
        'w-full truncate text-[13px]',
        active ? 'font-semibold text-foreground' : 'font-medium text-foreground'
      )}
    >
      {title}
    </span>
    {sub != null && (
      <span className='text-muted-foreground w-full truncate text-[11px]'>
        {sub}
      </span>
    )}
  </button>
)
