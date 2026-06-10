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

type EyebrowProps = ComponentProps<'p'> & {
  /** Hide the leading `// ` slashes when embedding in tight spots. */
  plain?: boolean
}

/**
 * Eyebrow — `// UPPERCASE` mono micro-label in brand color. The single
 * entry point for section separators across panels, rails and pages.
 *
 * Anatomy: `// ` prefix (decorative, aria-hidden) + uppercase label.
 */
export function Eyebrow({ plain, className, children, ...props }: EyebrowProps) {
  return (
    <p
      data-slot='eyebrow'
      className={cn(
        'text-brand m-0 font-mono text-[10px] font-medium tracking-[0.1em] uppercase',
        className
      )}
      {...props}
    >
      {plain ? null : <span aria-hidden='true'>{'// '}</span>}
      {children}
    </p>
  )
}
