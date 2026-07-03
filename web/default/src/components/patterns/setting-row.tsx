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

type SettingRowProps = ComponentProps<'div'> & {
  /** Setting name, left column. */
  title: ReactNode
  /** One-line explanation under the title. */
  description?: ReactNode
  /** Right-aligned control or action (button, switch, select, value). */
  control?: ReactNode
}

/**
 * SettingRow — one setting per row: name + description on the left,
 * control on the right. Stack rows inside a Panel with `divide-y`.
 */
export function SettingRow({
  title,
  description,
  control,
  className,
  children,
  ...props
}: SettingRowProps) {
  return (
    <div
      data-slot='setting-row'
      className={cn(
        'flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3.5 first:pt-0 last:pb-0',
        className
      )}
      {...props}
    >
      <div className='min-w-0 flex-1 basis-52'>
        <div className='text-sm font-medium'>{title}</div>
        {description != null && (
          <div className='text-muted-foreground mt-0.5 text-[13px] leading-snug'>
            {description}
          </div>
        )}
        {children}
      </div>
      {control != null && (
        <div className='flex shrink-0 items-center gap-2'>{control}</div>
      )}
    </div>
  )
}
