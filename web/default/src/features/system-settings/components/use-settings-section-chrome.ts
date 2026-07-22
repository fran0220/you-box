import { useContext } from 'react'
import { SettingsPageContext } from './settings-page-context-store'

/** Header chrome for SettingsSection: suppress flag + group eyebrow key. */
export function useSettingsSectionChrome() {
  const { suppressSectionHeader, sectionEyebrow } =
    useContext(SettingsPageContext)
  return { suppressSectionHeader, sectionEyebrow }
}
