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

type SettingRowProps = Omit<ComponentProps<'div'>, 'title'> & {
  /** Setting name — medium weight. */
  label: ReactNode
  /** Muted helper line under the label. */
  description?: ReactNode
  /** Right-aligned control: Switch, Select, Input, button group. */
  control?: ReactNode
  /** Dims the whole row and blocks interaction (dependent settings). */
  disabled?: boolean
  /** Associate the label with the control's input id. */
  htmlFor?: string
}

/**
 * SettingRow — one configuration item: label + description on the left,
 * control on the right, divider between rows. The building block of
 * every SettingsPanel.
 */
export function SettingRow({
  label,
  description,
  control,
  disabled,
  htmlFor,
  className,
  children,
  ...props
}: SettingRowProps) {
  const LabelTag = htmlFor ? 'label' : 'div'
  return (
    <div
      data-slot='setting-row'
      data-disabled={disabled || undefined}
      aria-disabled={disabled || undefined}
      className={cn(
        'border-divider flex flex-wrap items-center gap-x-5 gap-y-2 border-b py-4 last:border-b-0 sm:flex-nowrap',
        disabled && 'pointer-events-none opacity-50',
        className
      )}
      {...props}
    >
      <div className='min-w-0 flex-1 basis-52'>
        <LabelTag
          htmlFor={htmlFor}
          className='text-foreground block text-sm font-medium'
        >
          {label}
        </LabelTag>
        {description != null && (
          <div className='text-muted-foreground mt-0.5 text-[13px] leading-normal'>
            {description}
          </div>
        )}
      </div>
      {control != null && (
        <div className='flex shrink-0 items-center gap-2'>{control}</div>
      )}
      {children}
    </div>
  )
}
