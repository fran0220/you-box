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
