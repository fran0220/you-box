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
import * as z from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Form, FormControl, FormField } from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import {
  SettingRowFormItem,
  SettingRowGroup,
  SettingsForm,
} from '../components/settings-form-layout'
import { FormDirtyIndicator } from '../components/form-dirty-indicator'
import { FormNavigationGuard } from '../components/form-navigation-guard'
import { SettingsPageFormActions } from '../components/settings-page-context'
import { SettingsSection } from '../components/settings-section'
import { useSettingsForm } from '../hooks/use-settings-form'
import { useUpdateOption } from '../hooks/use-update-option'

const drawingSchema = z.object({
  DrawingEnabled: z.boolean(),
  MjNotifyEnabled: z.boolean(),
  MjAccountFilterEnabled: z.boolean(),
  MjForwardUrlEnabled: z.boolean(),
  MjModeClearEnabled: z.boolean(),
  MjActionCheckSuccessEnabled: z.boolean(),
})

type DrawingFormValues = z.infer<typeof drawingSchema>

type DrawingSettingsSectionProps = {
  defaultValues: DrawingFormValues
}

export function DrawingSettingsSection({
  defaultValues,
}: DrawingSettingsSectionProps) {
  const { t } = useTranslation()
  const updateOption = useUpdateOption()
  const { form, handleSubmit, handleReset, isDirty, isSubmitting } =
    useSettingsForm<DrawingFormValues>({
      resolver: zodResolver(drawingSchema),
      defaultValues,
      onSubmit: async (_data, changedFields) => {
        for (const [key, value] of Object.entries(changedFields)) {
          await updateOption.mutateAsync({
            key,
            value: value as string | number | boolean,
          })
        }
      },
    })

  const switches: Array<{
    name: keyof DrawingFormValues
    label: string
    description: string
  }> = [
    {
      name: 'DrawingEnabled',
      label: t('Enable drawing features'),
      description: t(
        'Required to expose Midjourney-style image generation to end users.'
      ),
    },
    {
      name: 'MjNotifyEnabled',
      label: t('Allow upstream callbacks'),
      description: t(
        'When enabled, Midjourney callbacks are accepted (reveals server IP).'
      ),
    },
    {
      name: 'MjAccountFilterEnabled',
      label: t('Allow accountFilter parameter'),
      description: t(
        'Keep enabled if you need to proxy requests for different upstream accounts.'
      ),
    },
    {
      name: 'MjForwardUrlEnabled',
      label: t('Rewrite callback URLs to the local server'),
      description: t(
        'Automatically replaces upstream callback URLs with the server address.'
      ),
    },
    {
      name: 'MjModeClearEnabled',
      label: t('Clear mode flags in prompts'),
      description: t(
        'Removes Midjourney flags such as --fast, --relax, and --turbo from user prompts.'
      ),
    },
    {
      name: 'MjActionCheckSuccessEnabled',
      label: t('Require job success before follow-up actions'),
      description: t(
        'Users must wait for a successful drawing before upscales or variations.'
      ),
    },
  ]

  return (
    <SettingsSection title={t('Drawing')}>
      <FormNavigationGuard when={isDirty} />
      <Form {...form}>
        <SettingsForm onSubmit={handleSubmit}>
          <SettingsPageFormActions
            onSave={handleSubmit}
            onReset={handleReset}
            isSaving={isSubmitting || updateOption.isPending}
            isResetDisabled={!isDirty}
          />
          <FormDirtyIndicator isDirty={isDirty} />
          <SettingRowGroup>
            {switches.map((item) => (
              <FormField
                key={item.name}
                control={form.control}
                name={item.name}
                render={({ field }) => (
                  <SettingRowFormItem
                    label={item.label}
                    description={item.description}
                    control={
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    }
                  />
                )}
              />
            ))}
          </SettingRowGroup>
        </SettingsForm>
      </Form>
    </SettingsSection>
  )
}
