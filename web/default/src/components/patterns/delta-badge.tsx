import { type ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { MinusIcon, TrendingDownIcon, TrendingUpIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const deltaBadgeVariants = cva(
  'inline-flex items-center gap-1 font-mono text-xs font-medium [&>svg]:size-3.5',
  {
    variants: {
      tone: {
        success: 'text-success',
        danger: 'text-destructive',
        muted: 'text-muted-foreground',
      },
    },
    defaultVariants: { tone: 'muted' },
  }
)

const DIRECTION_ICON = {
  up: TrendingUpIcon,
  down: TrendingDownIcon,
  flat: MinusIcon,
} as const

const DIRECTION_TONE = {
  up: 'success',
  down: 'danger',
  flat: 'muted',
} as const

type DeltaBadgeProps = ComponentProps<'span'> &
  VariantProps<typeof deltaBadgeVariants> & {
    direction: keyof typeof DIRECTION_ICON
  }

/**
 * DeltaBadge — trend icon + mono delta text. Color follows direction
 * (up=success, down=danger, flat=muted) unless `tone` overrides it,
 * e.g. a latency drop that should read as success.
 */
export function DeltaBadge({
  direction,
  tone,
  className,
  children,
  ...props
}: DeltaBadgeProps) {
  const Icon = DIRECTION_ICON[direction]
  return (
    <span
      data-slot='delta-badge'
      className={cn(
        deltaBadgeVariants({ tone: tone ?? DIRECTION_TONE[direction] }),
        className
      )}
      {...props}
    >
      <Icon aria-hidden='true' />
      {children}
    </span>
  )
}
