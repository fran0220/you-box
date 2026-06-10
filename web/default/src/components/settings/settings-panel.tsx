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
import { Panel, PanelHeader } from '@/components/patterns'

type SettingsPanelProps = ComponentProps<'section'> & {
  /** `// group` eyebrow above the title. */
  eyebrow?: ReactNode
  title?: ReactNode
  /** Header tools (search, sync button, badge). */
  actions?: ReactNode
  /** Remove body padding for flush content (tables, editors). */
  flush?: boolean
}

/**
 * SettingsPanel — Panel + eyebrow-grouped header + a SettingRow list.
 * The standard container for every settings section.
 */
export function SettingsPanel({
  eyebrow,
  title,
  actions,
  flush,
  className,
  children,
  ...props
}: SettingsPanelProps) {
  return (
    <Panel className={className} {...props}>
      {(title != null || eyebrow != null || actions != null) && (
        <PanelHeader eyebrow={eyebrow} title={title} actions={actions} />
      )}
      <div
        data-slot='settings-panel-body'
        className={cn(!flush && 'px-4 py-1 sm:px-5')}
      >
        {children}
      </div>
    </Panel>
  )
}
