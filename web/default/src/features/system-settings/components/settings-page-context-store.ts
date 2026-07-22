import { createContext } from 'react'

/**
 * Snapshot of the active section form, registered by
 * SettingsPageFormActions and consumed by the sticky save bar
 * rendered in the settings page frame.
 */
export type SettingsFormActionsRegistration = {
  dirty: boolean
  saving: boolean
  save: () => void
  discard: () => void
}

export type SettingsPageContextValue = {
  actionsContainer: HTMLDivElement | null
  titleStatusContainer: HTMLSpanElement | null
  suppressSectionHeader: boolean
  /** i18n key of the owning settings group, used as the panel eyebrow. */
  sectionEyebrow: string | null
  registerFormActions: (entry: SettingsFormActionsRegistration | null) => void
}

export const noopRegister = () => {}

export const SettingsPageContext = createContext<SettingsPageContextValue>({
  actionsContainer: null,
  titleStatusContainer: null,
  suppressSectionHeader: false,
  sectionEyebrow: null,
  registerFormActions: noopRegister,
})
