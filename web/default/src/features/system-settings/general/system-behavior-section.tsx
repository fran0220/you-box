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
import type { Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Form, FormControl, FormField } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { FormDirtyIndicator } from '../components/form-dirty-indicator'
import { FormNavigationGuard } from '../components/form-navigation-guard'
import {
  SettingRowFormItem,
  SettingRowGroup,
  SettingsForm,
} from '../components/settings-form-layout'
import { SettingsPageFormActions } from '../components/settings-page-context'
import { SettingsSection } from '../components/settings-section'
import { useSettingsForm } from '../hooks/use-settings-form'
import { useUpdateOption } from '../hooks/use-update-option'
import { safeNumberFieldProps } from '../utils/numeric-field'

const behaviorSchema = z.object({
  RetryTimes: z.coerce.number().min(0).max(10),
  DefaultCollapseSidebar: z.boolean(),
  DemoSiteEnabled: z.boolean(),
  SelfUseModeEnabled: z.boolean(),
})

type BehaviorFormValues = z.infer<typeof behaviorSchema>

type SystemBehaviorSectionProps = {
  defaultValues: BehaviorFormValues
}

export function SystemBehaviorSection({
  defaultValues,
}: SystemBehaviorSectionProps) {
  const { t } = useTranslation()
  const updateOption = useUpdateOption()

  const { form, handleSubmit, handleReset, isDirty, isSubmitting } =
    useSettingsForm<BehaviorFormValues>({
      resolver: zodResolver(behaviorSchema) as Resolver<
        BehaviorFormValues,
        unknown,
        BehaviorFormValues
      >,
      defaultValues,
      onSubmit: async (_data, changedFields) => {
        for (const [key, value] of Object.entries(changedFields)) {
          await updateOption.mutateAsync({
            key,
            value: value as string | boolean | number,
          })
        }
      },
    })

  return (
    <>
      <FormNavigationGuard when={isDirty} />

      <SettingsSection title={t('System Behavior')}>
        <Form {...form}>
          <SettingsForm onSubmit={handleSubmit}>
            <SettingsPageFormActions
              onSave={handleSubmit}
              onReset={handleReset}
              isSaving={updateOption.isPending || isSubmitting}
              isResetDisabled={!isDirty}
            />
            <FormDirtyIndicator isDirty={isDirty} />
          <SettingRowGroup>
            <FormField
              control={form.control}
              name='RetryTimes'
              render={({ field }) => (
                <SettingRowFormItem
                  label={t('Retry Times')}
                  description={t(
                    'Number of times to retry failed requests (0-10)'
                  )}
                  control={
                    <FormControl>
                      <Input
                        className='w-32'
                        type='number'
                        min='0'
                        max='10'
                        {...safeNumberFieldProps(field)}
                      />
                    </FormControl>
                  }
                />
              )}
            />

            <FormField
              control={form.control}
              name='DefaultCollapseSidebar'
              render={({ field }) => (
                <SettingRowFormItem
                  label={t('Default Collapse Sidebar')}
                  description={t('Sidebar collapsed by default for new users')}
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

            <FormField
              control={form.control}
              name='DemoSiteEnabled'
              render={({ field }) => (
                <SettingRowFormItem
                  label={t('Demo Site Mode')}
                  description={t('Enable demo mode with limited functionality')}
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

            <FormField
              control={form.control}
              name='SelfUseModeEnabled'
              render={({ field }) => (
                <SettingRowFormItem
                  label={t('Self-Use Mode')}
                  description={t(
                    'Optimize system for self-hosted single-user usage'
                  )}
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
          </SettingRowGroup>
          </SettingsForm>
        </Form>
      </SettingsSection>
    </>
  )
}
