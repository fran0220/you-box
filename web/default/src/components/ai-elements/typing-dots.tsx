import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

/**
 * TypingDots — three bouncing dots shown while an assistant response is being
 * generated (before the first token streams in). Uses `bg-current`, so colour
 * follows the text colour of the parent. Reduced-motion safe: the dots sit
 * static (no bounce) when the user prefers reduced motion.
 */
export const TypingDots = ({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) => (
  <span
    aria-hidden='true'
    className={cn('inline-flex items-center gap-1', className)}
    {...props}
  >
    <span className='size-1.5 rounded-full bg-current opacity-60 motion-safe:animate-[yb-typing_1.2s_ease-in-out_infinite]' />
    <span className='size-1.5 rounded-full bg-current opacity-60 motion-safe:animate-[yb-typing_1.2s_ease-in-out_0.15s_infinite]' />
    <span className='size-1.5 rounded-full bg-current opacity-60 motion-safe:animate-[yb-typing_1.2s_ease-in-out_0.3s_infinite]' />
  </span>
)
