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
  registerFormActions: (
    entry: SettingsFormActionsRegistration | null
  ) => void
}

export const noopRegister = () => {}

export const SettingsPageContext = createContext<SettingsPageContextValue>({
  actionsContainer: null,
  titleStatusContainer: null,
  suppressSectionHeader: false,
  sectionEyebrow: null,
  registerFormActions: noopRegister,
})
