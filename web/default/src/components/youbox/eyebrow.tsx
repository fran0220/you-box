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
  /** Hide the leading `// ` slashes when embedding in tight spots. */
  plain?: boolean
}

/**
 * Eyebrow — mono uppercase micro-label in brand ink (`yb-eyebrow` tokens).
 */
export function Eyebrow(props: EyebrowProps) {
  const { plain, className, children, ...rest } = props
  return (
    <p
      data-slot='youbox-eyebrow'
      className={cn(
        'text-brand m-0 font-mono text-[11px] font-medium tracking-[0.08em] uppercase',
        className
      )}
      {...rest}
    >
      {plain ? null : <span aria-hidden='true'>{'// '}</span>}
      {children}
    </p>
  )
}
