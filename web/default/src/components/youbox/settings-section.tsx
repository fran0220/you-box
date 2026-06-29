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
import { Panel } from '@/components/patterns/panel'

export type SettingsSectionProps = Omit<ComponentProps<'section'>, 'title'> & {
  title: ReactNode
  description?: ReactNode
  footer?: ReactNode
}

export function SettingsSection(props: SettingsSectionProps) {
  const { title, description, footer, className, children, ...rest } = props
  return (
    <Panel
      data-slot='youbox-settings-section'
      className={cn(className)}
      {...rest}
    >
      <div className='border-divider border-b px-4 py-4 sm:px-5'>
        <h2 className='text-foreground font-mono text-[11px] font-medium tracking-[0.06em] uppercase'>
          {title}
        </h2>
        {description != null && (
          <p className='text-muted-foreground mt-1 text-[13px] leading-normal'>
            {description}
          </p>
        )}
      </div>
      <div className='px-4 sm:px-5'>{children}</div>
      {footer != null && (
        <div className='border-divider flex justify-end border-t px-4 py-4 sm:px-5'>
          {footer}
        </div>
      )}
    </Panel>
  )
}
