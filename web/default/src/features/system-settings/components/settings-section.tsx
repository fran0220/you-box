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
import { useTranslation } from 'react-i18next'
import { Panel } from '@/components/patterns/panel'
import { SettingsSection as YouboxSettingsSection } from '@/components/youbox'
import { cn } from '@/lib/utils'
import { useSettingsSectionChrome } from './use-settings-section-chrome'

type SettingsSectionProps = {
  title: string
  children: React.ReactNode
  className?: string
}

const panelBodyClassName = 'flex flex-col gap-4 py-3 sm:py-4'

/**
 * Shared container for every system-settings section, using the canonical
 * youbox SettingsSection (Panel + mono group title). When the page chrome
 * already names the section, suppress-header renders a headless panel body
 * only so VAL-SET-010 still finds `[data-slot=settings-panel-body]`.
 */
export function SettingsSection({
  title,
  children,
  className,
}: SettingsSectionProps) {
  const { t } = useTranslation()
  const { suppressSectionHeader: suppressHeader, sectionEyebrow: eyebrowKey } =
    useSettingsSectionChrome()

  if (suppressHeader) {
    return (
      <Panel className={cn(className)}>
        <div data-slot='settings-panel-body' className='px-4 py-1 sm:px-5'>
          <div className={panelBodyClassName}>{children}</div>
        </div>
      </Panel>
    )
  }

  return (
    <YouboxSettingsSection
      className={className}
      title={title}
      description={eyebrowKey ? t(eyebrowKey) : undefined}
    >
      <div data-slot='settings-panel-body' className={panelBodyClassName}>
        {children}
      </div>
    </YouboxSettingsSection>
  )
}
