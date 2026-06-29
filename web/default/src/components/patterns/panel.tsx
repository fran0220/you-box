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
import { type ComponentProps, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Eyebrow } from '@/components/youbox/eyebrow'

/**
 * Panel — the standard YouBox surface card: `surface-card` background,
 * border, lg radius. Compose with PanelHeader (title + tools slot) and
 * PanelBody; header is optional (headless panels hold tables flush).
 */
export function Panel({ className, ...props }: ComponentProps<'section'>) {
  return (
    <section
      data-slot='panel'
      className={cn('bg-card overflow-hidden rounded-lg border', className)}
      {...props}
    />
  )
}

type PanelHeaderProps = ComponentProps<'header'> & {
  /** Optional `// eyebrow` line rendered above the title. */
  eyebrow?: ReactNode
  title?: ReactNode
  /** Right-aligned tools area (buttons, tabs, badges, search). */
  actions?: ReactNode
}

export function PanelHeader({
  eyebrow,
  title,
  actions,
  className,
  children,
  ...props
}: PanelHeaderProps) {
  return (
    <header
      data-slot='panel-header'
      className={cn(
        'border-divider flex items-center justify-between gap-4 border-b px-4 py-3.5 sm:px-5',
        className
      )}
      {...props}
    >
      {title != null || eyebrow != null ? (
        <div className='min-w-0'>
          {eyebrow != null && <Eyebrow className='mb-0.5'>{eyebrow}</Eyebrow>}
          {title != null && (
            <h3 className='font-display truncate text-base font-semibold tracking-[-0.01em]'>
              {title}
            </h3>
          )}
        </div>
      ) : null}
      {children}
      {actions != null && (
        <div className='flex shrink-0 items-center gap-2.5'>{actions}</div>
      )}
    </header>
  )
}

export function PanelBody({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot='panel-body'
      className={cn('p-4 sm:p-5', className)}
      {...props}
    />
  )
}
