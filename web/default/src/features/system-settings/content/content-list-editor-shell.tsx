import { useContext, useEffect, type ReactNode } from 'react'
import { Form } from '@/components/ui/form'
import { FormNavigationGuard } from '../components/form-navigation-guard'
import { FormDirtyIndicator } from '../components/form-dirty-indicator'
import {
  SettingRowGroup,
  SettingsForm,
  SettingsSwitchField,
} from '../components/settings-form-layout'
import {
  SettingsPageContext,
  type SettingsFormActionsRegistration,
} from '../components/settings-page-context-store'
import type { UseFormReturn } from 'react-hook-form'

type ContentListEditorShellProps = {
  form: UseFormReturn<{ payload: string }>
  registration: SettingsFormActionsRegistration
  isDirty: boolean
  enabled: boolean
  onEnabledChange: (checked: boolean) => void
  enabledLabel: string
  toolbar: ReactNode
  children: ReactNode
}

export function ContentListEditorShell(props: ContentListEditorShellProps) {
  const { registerFormActions } = useContext(SettingsPageContext)
  const {
    form,
    registration,
    isDirty,
    enabled,
    onEnabledChange,
    enabledLabel,
    toolbar,
    children,
  } = props

  useEffect(() => {
    registerFormActions(registration)
    return () => registerFormActions(null)
  }, [registerFormActions, registration])

  return (
    <>
      <FormNavigationGuard when={isDirty} />
      <FormDirtyIndicator isDirty={isDirty} />
      <Form {...form}>
        <SettingsForm
          onSubmit={(event) => {
            event.preventDefault()
            void registration.save()
          }}
        >
          <SettingRowGroup>
            <SettingsSwitchField
              checked={enabled}
              onCheckedChange={onEnabledChange}
              label={enabledLabel}
              description={undefined}
            />
          </SettingRowGroup>
          <div className='flex flex-wrap items-center gap-2'>{toolbar}</div>
          {children}
        </SettingsForm>
      </Form>
    </>
  )
}
