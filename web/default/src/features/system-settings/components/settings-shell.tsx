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
import { type ReactNode } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { SettingsRail, type SettingsRailItem } from '@/components/settings'
import {
  SETTINGS_SHELL_GROUP_ORDER,
  SETTINGS_SHELL_GROUPS,
  type SettingsShellGroup,
} from './settings-shell-config'

type SettingsShellProps = {
  group: SettingsShellGroup
  section: string
  children: ReactNode
}

/**
 * SettingsShell — in-page two-level navigation for /system-settings/**.
 *
 * Renders an A3 SettingsRail pair (7 groups + the active group's sections)
 * as a 220px sticky column on desktop, collapsing to horizontal scroll
 * strips below `lg`. Selection drives router navigation; the global
 * sidebar entry remains untouched (sidebar = global nav, rail = in-page).
 */
export function SettingsShell({
  group,
  section,
  children,
}: SettingsShellProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const activeGroup = SETTINGS_SHELL_GROUPS[group]

  const groupItems: SettingsRailItem<SettingsShellGroup>[] =
    SETTINGS_SHELL_GROUP_ORDER.map((id) => {
      const config = SETTINGS_SHELL_GROUPS[id]
      const Icon = config.icon
      return {
        value: id,
        label: t(config.labelKey),
        icon: <Icon />,
      }
    })

  const sectionItems: SettingsRailItem[] = activeGroup.sections.map((item) => ({
    value: item.id,
    label: t(item.titleKey),
  }))

  const handleGroupChange = (next: SettingsShellGroup) => {
    if (next === group) return
    const target = SETTINGS_SHELL_GROUPS[next]
    void navigate({
      to: target.route,
      params: { section: target.defaultSection },
    })
  }

  const handleSectionChange = (next: string) => {
    if (next === section) return
    void navigate({ to: activeGroup.route, params: { section: next } })
  }

  return (
    <div className='flex w-full flex-col gap-4 lg:flex-row lg:items-start lg:gap-6'>
      <div className='flex flex-col gap-1 lg:sticky lg:top-2 lg:w-[220px] lg:shrink-0 lg:gap-3 lg:self-start'>
        <SettingsRail
          items={groupItems}
          value={group}
          onValueChange={handleGroupChange}
          label={t('Settings groups')}
          className='lg:static lg:top-auto lg:w-full'
        />
        <SettingsRail
          items={sectionItems}
          value={section}
          onValueChange={handleSectionChange}
          label={t(activeGroup.labelKey)}
          className='lg:static lg:top-auto lg:w-full lg:pl-5'
        />
      </div>
      <div className='flex min-w-0 flex-1 flex-col'>{children}</div>
    </div>
  )
}
