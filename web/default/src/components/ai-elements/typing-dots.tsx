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
