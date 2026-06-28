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

const CHECKIN_FIELD_TO_OPTION_KEY: Record<string, string> = {
  enabled: 'checkin_setting.enabled',
  minQuota: 'checkin_setting.min_quota',
  maxQuota: 'checkin_setting.max_quota',
}

const createCheckinSchema = (t: (key: string) => string) =>
  z
    .object({
      enabled: z.boolean(),
      minQuota: z.coerce.number().int().min(0),
      maxQuota: z.coerce.number().int().min(0),
    })
    .superRefine((data, ctx) => {
      if (data.enabled && data.minQuota > data.maxQuota) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['maxQuota'],
          message: t('Maximum quota must be greater than or equal to minimum'),
        })
      }
    })

type CheckinFormValues = z.infer<ReturnType<typeof createCheckinSchema>>

export function CheckinSettingsSection({
  defaultValues,
}: {
  defaultValues: {
    enabled: boolean
    minQuota: number
    maxQuota: number
  }
}) {
  const { t } = useTranslation()
  const updateOption = useUpdateOption()
  const checkinSchema = createCheckinSchema(t)

  const { form, handleSubmit, handleReset, isDirty, isSubmitting } =
    useSettingsForm<CheckinFormValues>({
      resolver: zodResolver(checkinSchema) as Resolver<
        CheckinFormValues,
        unknown,
        CheckinFormValues
      >,
      defaultValues: {
        enabled: defaultValues.enabled,
        minQuota: defaultValues.minQuota,
        maxQuota: defaultValues.maxQuota,
      },
      onSubmit: async (_data, changedFields) => {
        for (const [field, value] of Object.entries(changedFields)) {
          const key = CHECKIN_FIELD_TO_OPTION_KEY[field]
          if (!key) continue
          await updateOption.mutateAsync({
            key,
            value: String(value),
          })
        }
      },
    })

  const enabled = form.watch('enabled')

  return (
    <>
      <FormNavigationGuard when={isDirty} />

      <SettingsSection title={t('Check-in Settings')}>
        <Form {...form}>
          <SettingsForm onSubmit={handleSubmit} autoComplete='off'>
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
              name='enabled'
              render={({ field }) => (
                <SettingRowFormItem
                  label={t('Enable check-in feature')}
                  description={t(
                    'Allow users to check in daily for random quota rewards'
                  )}
                  control={
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={updateOption.isPending || isSubmitting}
                      />
                    </FormControl>
                  }
                />
              )}
            />

            <FormField
              control={form.control}
              name='minQuota'
              render={({ field }) => (
                <SettingRowFormItem
                  disabled={!enabled}
                  label={t('Minimum check-in quota')}
                  description={t('Minimum quota amount awarded for check-in')}
                  control={
                    <FormControl>
                      <Input
                        className='w-32'
                        type='number'
                        min={0}
                        placeholder={t('1000')}
                        disabled={!enabled}
                        {...field}
                      />
                    </FormControl>
                  }
                />
              )}
            />

            <FormField
              control={form.control}
              name='maxQuota'
              render={({ field }) => (
                <SettingRowFormItem
                  disabled={!enabled}
                  label={t('Maximum check-in quota')}
                  description={t('Maximum quota amount awarded for check-in')}
                  control={
                    <FormControl>
                      <Input
                        className='w-32'
                        type='number'
                        min={0}
                        placeholder={t('10000')}
                        disabled={!enabled}
                        {...field}
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
