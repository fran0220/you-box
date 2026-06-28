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

const createEmailSchema = (t: (key: string) => string) =>
  z.object({
    SMTPServer: z.string(),
    SMTPPort: z.string().refine((value) => {
      const trimmed = value.trim()
      if (!trimmed) return true
      return /^\d+$/.test(trimmed)
    }, t('Port must be a positive integer')),
    SMTPAccount: z.string(),
    SMTPFrom: z.string().refine((value) => {
      const trimmed = value.trim()
      if (!trimmed) return true
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
    }, t('Enter a valid email or leave blank')),
    SMTPToken: z.string(),
    SMTPSSLEnabled: z.boolean(),
    SMTPForceAuthLogin: z.boolean(),
  })

type EmailFormValues = z.infer<ReturnType<typeof createEmailSchema>>

type EmailSettingsSectionProps = {
  defaultValues: EmailFormValues
}

export function EmailSettingsSection({
  defaultValues,
}: EmailSettingsSectionProps) {
  const { t } = useTranslation()
  const updateOption = useUpdateOption()
  const emailSchema = createEmailSchema(t)

  const { form, handleSubmit, handleReset, isDirty, isSubmitting } =
    useSettingsForm<EmailFormValues>({
      resolver: zodResolver(emailSchema),
      defaultValues,
      onSubmit: async (values, changedFields) => {
        const sanitized = {
          SMTPServer: values.SMTPServer.trim(),
          SMTPPort: values.SMTPPort.trim(),
          SMTPAccount: values.SMTPAccount.trim(),
          SMTPFrom: values.SMTPFrom.trim(),
          SMTPToken: values.SMTPToken.trim(),
          SMTPSSLEnabled: values.SMTPSSLEnabled,
          SMTPForceAuthLogin: values.SMTPForceAuthLogin,
        }

        for (const key of Object.keys(changedFields) as Array<
          keyof EmailFormValues
        >) {
          if (key === 'SMTPToken') {
            const token = sanitized.SMTPToken
            if (!token) continue
            await updateOption.mutateAsync({ key: 'SMTPToken', value: token })
            continue
          }
          await updateOption.mutateAsync({
            key,
            value: sanitized[key] as string | boolean,
          })
        }
      },
    })

  return (
    <>
      <FormNavigationGuard when={isDirty} />

      <SettingsSection title={t('SMTP Email')}>
        <Form {...form}>
          <SettingsForm onSubmit={handleSubmit} autoComplete='off'>
            <SettingsPageFormActions
              onSave={handleSubmit}
              onReset={handleReset}
              isSaving={updateOption.isPending || isSubmitting}
              isResetDisabled={!isDirty}
              saveLabel='Save SMTP settings'
            />
            <FormDirtyIndicator isDirty={isDirty} />
          <SettingRowGroup>
            <FormField
              control={form.control}
              name='SMTPServer'
              render={({ field }) => (
                <SettingRowFormItem
                  label={t('SMTP Host')}
                  description={t('Hostname or IP of your SMTP provider')}
                  control={
                    <FormControl>
                      <Input
                        className='w-72 max-w-full'
                        autoComplete='off'
                        placeholder={t('smtp.example.com')}
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
              name='SMTPPort'
              render={({ field }) => (
                <SettingRowFormItem
                  label={t('Port')}
                  description={t('Common ports include 25, 465, and 587')}
                  control={
                    <FormControl>
                      <Input
                        className='w-32'
                        autoComplete='off'
                        type='number'
                        placeholder='587'
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
              name='SMTPSSLEnabled'
              render={({ field }) => (
                <SettingRowFormItem
                  label={t('Enable SSL/TLS')}
                  description={t('Use secure connection when sending emails')}
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
              name='SMTPForceAuthLogin'
              render={({ field }) => (
                <SettingRowFormItem
                  label={t('Force AUTH LOGIN')}
                  description={t(
                    'Force SMTP authentication using AUTH LOGIN method'
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

            <FormField
              control={form.control}
              name='SMTPAccount'
              render={({ field }) => (
                <SettingRowFormItem
                  label={t('Username')}
                  description={t(
                    'Account used when authenticating with the SMTP server'
                  )}
                  control={
                    <FormControl>
                      <Input
                        className='w-72 max-w-full'
                        autoComplete='off'
                        placeholder={t('noreply@example.com')}
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
              name='SMTPFrom'
              render={({ field }) => (
                <SettingRowFormItem
                  label={t('From Address')}
                  description={t(
                    'Display name and email used in outgoing messages'
                  )}
                  control={
                    <FormControl>
                      <Input
                        className='w-72 max-w-full'
                        autoComplete='off'
                        placeholder={t('BoxAI <noreply@example.com>')}
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
              name='SMTPToken'
              render={({ field }) => (
                <SettingRowFormItem
                  label={t('Password / Access Token')}
                  description={t('Leave blank to keep the existing credential')}
                  control={
                    <FormControl>
                      <Input
                        className='w-72 max-w-full'
                        autoComplete='off'
                        type='password'
                        placeholder={t('Enter new token to update')}
                        {...field}
                        onChange={(event) => field.onChange(event.target.value)}
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
