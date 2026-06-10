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
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { useFormContext, useFormState } from 'react-hook-form'

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

type SettingsPageContextValue = {
  actionsContainer: HTMLDivElement | null
  titleStatusContainer: HTMLSpanElement | null
  suppressSectionHeader: boolean
  /** i18n key of the owning settings group, used as the panel eyebrow. */
  sectionEyebrow: string | null
  registerFormActions: (
    entry: SettingsFormActionsRegistration | null
  ) => void
}

const noopRegister = () => {}

const SettingsPageContext = createContext<SettingsPageContextValue>({
  actionsContainer: null,
  titleStatusContainer: null,
  suppressSectionHeader: false,
  sectionEyebrow: null,
  registerFormActions: noopRegister,
})

type SettingsPageProviderProps = {
  actionsContainer: HTMLDivElement | null
  titleStatusContainer?: HTMLSpanElement | null
  children: ReactNode
  suppressSectionHeader?: boolean
  sectionEyebrow?: string | null
  registerFormActions?: (
    entry: SettingsFormActionsRegistration | null
  ) => void
}

export function SettingsPageProvider(props: SettingsPageProviderProps) {
  const {
    actionsContainer,
    titleStatusContainer,
    suppressSectionHeader,
    sectionEyebrow,
    registerFormActions,
  } = props

  const value = useMemo(
    () => ({
      actionsContainer,
      titleStatusContainer: titleStatusContainer ?? null,
      suppressSectionHeader: suppressSectionHeader ?? true,
      sectionEyebrow: sectionEyebrow ?? null,
      registerFormActions: registerFormActions ?? noopRegister,
    }),
    [
      actionsContainer,
      titleStatusContainer,
      suppressSectionHeader,
      sectionEyebrow,
      registerFormActions,
    ]
  )

  return (
    <SettingsPageContext.Provider value={value}>
      {props.children}
    </SettingsPageContext.Provider>
  )
}

/** Header chrome for SettingsSection: suppress flag + group eyebrow key. */
export function useSettingsSectionChrome() {
  const { suppressSectionHeader, sectionEyebrow } =
    useContext(SettingsPageContext)
  return { suppressSectionHeader, sectionEyebrow }
}

type SettingsPageTitleStatusPortalProps = {
  children: ReactNode
}

export function SettingsPageTitleStatusPortal(
  props: SettingsPageTitleStatusPortalProps
) {
  const { titleStatusContainer } = useContext(SettingsPageContext)

  if (!titleStatusContainer) return null

  return createPortal(props.children, titleStatusContainer)
}

type SettingsPageActionsPortalProps = {
  children: ReactNode
}

export function SettingsPageActionsPortal(
  props: SettingsPageActionsPortalProps
) {
  const { actionsContainer } = useContext(SettingsPageContext)

  if (!actionsContainer) return null

  return createPortal(
    <div className='flex flex-wrap items-center justify-end gap-2'>
      {props.children}
    </div>,
    actionsContainer
  )
}

type SettingsPageFormActionsProps = {
  onSave: () => void
  /** Custom discard handler; defaults to resetting the enclosing form. */
  onReset?: () => void
  isSaving?: boolean
  isSaveDisabled?: boolean
  isResetDisabled?: boolean
  /** @deprecated Labels are fixed by the sticky save bar. */
  saveLabel?: string
  /** @deprecated Labels are fixed by the sticky save bar. */
  savingLabel?: string
  /** @deprecated Labels are fixed by the sticky save bar. */
  resetLabel?: string
}

/**
 * Registers the section form's save/discard handlers with the settings
 * page so the shared StickySaveBar can drive them. Renders nothing in
 * place — the per-section header buttons were replaced by the bar
 * (r2-B12a); custom non-form actions still use SettingsPageActionsPortal.
 */
export function SettingsPageFormActions(props: SettingsPageFormActionsProps) {
  const formContext = useFormContext()

  if (formContext) {
    return <FormBoundFormActions {...props} />
  }

  return <StaticFormActions {...props} />
}

function FormBoundFormActions(props: SettingsPageFormActionsProps) {
  const { control, reset } = useFormContext()
  const { isDirty, isSubmitting } = useFormState({ control })

  return (
    <FormActionsRegistrar
      dirty={isDirty}
      saving={Boolean(props.isSaving) || isSubmitting}
      save={props.onSave}
      discard={props.onReset ?? (() => reset())}
    />
  )
}

function StaticFormActions(props: SettingsPageFormActionsProps) {
  // No enclosing react-hook-form provider: fall back to the explicit
  // dirty hints, or keep the bar visible so saving stays reachable.
  const dirty =
    props.isResetDisabled != null
      ? !props.isResetDisabled
      : props.isSaveDisabled != null
        ? !props.isSaveDisabled
        : true

  return (
    <FormActionsRegistrar
      dirty={dirty}
      saving={Boolean(props.isSaving)}
      save={props.onSave}
      discard={props.onReset ?? noopRegister}
    />
  )
}

function FormActionsRegistrar(entry: SettingsFormActionsRegistration) {
  const { registerFormActions } = useContext(SettingsPageContext)
  const { dirty, saving, save, discard } = entry

  // Re-register on every render so the bar always drives fresh handlers;
  // the registrar bails out of state updates when dirty/saving are stable.
  useEffect(() => {
    registerFormActions({ dirty, saving, save, discard })
  })

  useEffect(
    () => () => registerFormActions(null),
    [registerFormActions]
  )

  return null
}
