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
import { removeTrailingSlash } from './utils'

const createWorkerSchema = (t: (key: string) => string) =>
  z.object({
    WorkerUrl: z.string().refine((value) => {
      const trimmed = value.trim()
      if (!trimmed) return true
      return /^https?:\/\//.test(trimmed)
    }, t('Provide a valid URL starting with http:// or https://')),
    WorkerValidKey: z.string(),
    WorkerAllowHttpImageRequestEnabled: z.boolean(),
  })

type WorkerFormValues = z.infer<ReturnType<typeof createWorkerSchema>>

type WorkerSettingsSectionProps = {
  defaultValues: WorkerFormValues
}

export function WorkerSettingsSection({
  defaultValues,
}: WorkerSettingsSectionProps) {
  const { t } = useTranslation()
  const updateOption = useUpdateOption()
  const workerSchema = createWorkerSchema(t)

  const { form, handleSubmit, handleReset, isDirty, isSubmitting } =
    useSettingsForm<WorkerFormValues>({
      resolver: zodResolver(workerSchema),
      defaultValues,
      onSubmit: async (values, changedFields) => {
        const sanitizedUrl = removeTrailingSlash(values.WorkerUrl)
        const sanitizedKey = values.WorkerValidKey.trim()

        if ('WorkerUrl' in changedFields) {
          await updateOption.mutateAsync({
            key: 'WorkerUrl',
            value: sanitizedUrl,
          })
        }

        if (
          'WorkerValidKey' in changedFields ||
          ('WorkerUrl' in changedFields && sanitizedUrl === '')
        ) {
          await updateOption.mutateAsync({
            key: 'WorkerValidKey',
            value: sanitizedKey,
          })
        }

        if ('WorkerAllowHttpImageRequestEnabled' in changedFields) {
          await updateOption.mutateAsync({
            key: 'WorkerAllowHttpImageRequestEnabled',
            value: values.WorkerAllowHttpImageRequestEnabled,
          })
        }
      },
    })

  return (
    <>
      <FormNavigationGuard when={isDirty} />

      <SettingsSection title={t('Worker Proxy')}>
        <Form {...form}>
          <SettingsForm onSubmit={handleSubmit} autoComplete='off'>
            <SettingsPageFormActions
              onSave={handleSubmit}
              onReset={handleReset}
              isSaving={updateOption.isPending || isSubmitting}
              isResetDisabled={!isDirty}
              saveLabel='Save Worker settings'
            />
            <FormDirtyIndicator isDirty={isDirty} />
          <SettingRowGroup>
            <FormField
              control={form.control}
              name='WorkerUrl'
              render={({ field }) => (
                <SettingRowFormItem
                  label={t('Worker URL')}
                  description={t(
                    'Requests will be forwarded to this worker. Trailing slashes are removed automatically.'
                  )}
                  control={
                    <FormControl>
                      <Input
                        className='w-72 max-w-full'
                        type='url'
                        inputMode='url'
                        placeholder={t('https://worker.example.workers.dev')}
                        autoComplete='off'
                        {...field}
                        onChange={(event) => field.onChange(event.target.value)}
                      />
                    </FormControl>
                  }
                />
              )}
            />

            <FormField
              control={form.control}
              name='WorkerValidKey'
              render={({ field }) => (
                <SettingRowFormItem
                  label={t('Worker Access Key')}
                  description={t(
                    'Used to authenticate with the worker. Leave blank to keep the existing secret.'
                  )}
                  control={
                    <FormControl>
                      <Input
                        className='w-72 max-w-full'
                        type='password'
                        placeholder={t('Enter new key to update')}
                        autoComplete='new-password'
                        {...field}
                        onChange={(event) => field.onChange(event.target.value)}
                      />
                    </FormControl>
                  }
                />
              )}
            />

            <FormField
              control={form.control}
              name='WorkerAllowHttpImageRequestEnabled'
              render={({ field }) => (
                <SettingRowFormItem
                  label={t('Allow HTTP image requests')}
                  description={t(
                    'Enable when proxying workers that fetch images over HTTP.'
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
