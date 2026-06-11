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
import { SettingsPanel } from '@/components/settings'
import { useSettingsSectionChrome } from './use-settings-section-chrome'

type SettingsSectionProps = {
  title: string
  children: React.ReactNode
  className?: string
}

/**
 * Shared container for every system-settings section, rendered as an
 * A3 SettingsPanel (eyebrow = owning group, title = section name). The
 * suppress-header context still hides the panel header where the page
 * chrome already names the section.
 */
export function SettingsSection({
  title,
  children,
  className,
}: SettingsSectionProps) {
  const { t } = useTranslation()
  const { suppressSectionHeader: suppressHeader, sectionEyebrow: eyebrowKey } =
    useSettingsSectionChrome()

  return (
    <SettingsPanel
      className={className}
      eyebrow={
        !suppressHeader && eyebrowKey ? t(eyebrowKey).toLowerCase() : undefined
      }
      title={!suppressHeader ? title : undefined}
    >
      <div className='flex flex-col gap-4 py-3 sm:py-4'>{children}</div>
    </SettingsPanel>
  )
}
