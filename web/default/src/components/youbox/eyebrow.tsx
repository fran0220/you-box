import { type ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export type EyebrowProps = ComponentProps<'p'> & {
  /** Kept for compatibility; eyebrows no longer render a `//` prefix. */
  plain?: boolean
}

/**
 * Eyebrow — mono uppercase editorial section label (`yb-eyebrow` tokens).
 */
export function Eyebrow(props: EyebrowProps) {
  const { plain: _plain, className, children, ...rest } = props
  return (
    <p
      data-slot='youbox-eyebrow'
      className={cn(
        'text-text-secondary m-0 font-mono text-[length:var(--eyebrow-size,11px)] font-semibold tracking-[var(--eyebrow-tracking,0.14em)] uppercase',
        className
      )}
      {...rest}
    >
      {children}
    </p>
  )
}
