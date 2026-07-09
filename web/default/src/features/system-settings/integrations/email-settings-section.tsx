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
import { useMemo, useState } from 'react'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useSystemConfig } from '@/hooks/use-system-config'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { getEmailTemplateDefaults, previewEmailTemplate } from '../api'
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
    EmailVerificationSubject: z.string(),
    EmailVerificationHTML: z.string(),
    PasswordResetSubject: z.string(),
    PasswordResetHTML: z.string(),
  })

type EmailFormValues = z.infer<ReturnType<typeof createEmailSchema>>

type EmailSettingsSectionProps = {
  defaultValues: EmailFormValues
}

const TEMPLATE_VARIABLES = [
  '{{.SystemName}}',
  '{{.Code}}',
  '{{.ValidMinutes}}',
  '{{.ResetLink}}',
] as const

export function EmailSettingsSection({
  defaultValues,
}: EmailSettingsSectionProps) {
  const { t } = useTranslation()
  const { systemName } = useSystemConfig()
  const updateOption = useUpdateOption()
  const emailSchema = createEmailSchema(t)
  const [previewKind, setPreviewKind] = useState<
    'verification' | 'password_reset'
  >('verification')
  const [previewSubject, setPreviewSubject] = useState('')
  const [previewHtml, setPreviewHtml] = useState('')
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)

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
          EmailVerificationSubject: values.EmailVerificationSubject,
          EmailVerificationHTML: values.EmailVerificationHTML,
          PasswordResetSubject: values.PasswordResetSubject,
          PasswordResetHTML: values.PasswordResetHTML,
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

  const variableHint = useMemo(
    () => TEMPLATE_VARIABLES.join('  ·  '),
    []
  )

  const runPreview = async (kind: 'verification' | 'password_reset') => {
    setIsPreviewing(true)
    setPreviewKind(kind)
    try {
      const values = form.getValues()
      const subject =
        kind === 'verification'
          ? values.EmailVerificationSubject
          : values.PasswordResetSubject
      const html =
        kind === 'verification'
          ? values.EmailVerificationHTML
          : values.PasswordResetHTML
      const res = await previewEmailTemplate({ kind, subject, html })
      if (!res.success || !res.data) {
        throw new Error(res.message || t('Preview failed'))
      }
      setPreviewSubject(res.data.subject)
      setPreviewHtml(res.data.html)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t('Preview failed')
      )
    } finally {
      setIsPreviewing(false)
    }
  }

  const restoreDefaults = async () => {
    setIsRestoring(true)
    try {
      const res = await getEmailTemplateDefaults()
      if (!res.success || !res.data) {
        throw new Error(res.message || t('Failed to load defaults'))
      }
      form.setValue(
        'EmailVerificationSubject',
        res.data.EmailVerificationSubject,
        { shouldDirty: true }
      )
      form.setValue('EmailVerificationHTML', res.data.EmailVerificationHTML, {
        shouldDirty: true,
      })
      form.setValue('PasswordResetSubject', res.data.PasswordResetSubject, {
        shouldDirty: true,
      })
      form.setValue('PasswordResetHTML', res.data.PasswordResetHTML, {
        shouldDirty: true,
      })
      toast.success(t('Default templates loaded. Save to apply.'))
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t('Failed to load defaults')
      )
    } finally {
      setIsRestoring(false)
    }
  }

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
                          onChange={(event) =>
                            field.onChange(event.target.value)
                          }
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
                          onChange={(event) =>
                            field.onChange(event.target.value)
                          }
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
                          onChange={(event) =>
                            field.onChange(event.target.value)
                          }
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
                          placeholder={`${systemName} <noreply@example.com>`}
                          {...field}
                          onChange={(event) =>
                            field.onChange(event.target.value)
                          }
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
                    description={t(
                      'Leave blank to keep the existing credential'
                    )}
                    control={
                      <FormControl>
                        <Input
                          className='w-72 max-w-full'
                          autoComplete='off'
                          type='password'
                          placeholder={t('Enter new token to update')}
                          {...field}
                          onChange={(event) =>
                            field.onChange(event.target.value)
                          }
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

      <SettingsSection title={t('Email Templates')}>
        <Form {...form}>
          <SettingsForm
            onSubmit={handleSubmit}
            autoComplete='off'
            className='lg:grid-cols-1'
          >
            <div
              data-settings-form-span='full'
              className='mb-2 flex flex-wrap items-center gap-2'
            >
              <Button
                type='button'
                variant='outline'
                size='sm'
                disabled={isPreviewing}
                onClick={() => void runPreview('verification')}
              >
                {t('Preview verification')}
              </Button>
              <Button
                type='button'
                variant='outline'
                size='sm'
                disabled={isPreviewing}
                onClick={() => void runPreview('password_reset')}
              >
                {t('Preview password reset')}
              </Button>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                disabled={isRestoring}
                onClick={() => void restoreDefaults()}
              >
                {t('Restore defaults')}
              </Button>
            </div>

            <p
              data-settings-form-span='full'
              className='text-text-muted mb-2 text-xs leading-relaxed'
            >
              {t('Template variables')}: {variableHint}
              <br />
              {t(
                'Leave blank to use the built-in template. Save SMTP settings to apply template changes.'
              )}
            </p>

            {/* Stacked full-width editors: SettingRow's right-side shrink-0 control
                column squeezes large HTML textareas into unusable narrow boxes. */}
            <div
              data-settings-form-span='full'
              className='flex min-w-0 flex-col gap-6'
            >
              <FormField
                control={form.control}
                name='EmailVerificationSubject'
                render={({ field }) => (
                  <FormItem className='min-w-0 space-y-2'>
                    <FormLabel>{t('Verification subject')}</FormLabel>
                    <FormDescription>
                      {t(
                        'Subject for registration / email verification messages'
                      )}
                    </FormDescription>
                    <FormControl>
                      <Input
                        className='w-full'
                        autoComplete='off'
                        placeholder='{{.SystemName}} · 邮箱验证码'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='EmailVerificationHTML'
                render={({ field }) => (
                  <FormItem className='min-w-0 space-y-2'>
                    <FormLabel>{t('Verification HTML')}</FormLabel>
                    <FormDescription>
                      {t(
                        'HTML body. Use {{.Code}}, {{.SystemName}}, {{.ValidMinutes}}.'
                      )}
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        className='min-h-72 w-full resize-y font-mono text-xs leading-relaxed'
                        autoComplete='off'
                        spellCheck={false}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='PasswordResetSubject'
                render={({ field }) => (
                  <FormItem className='min-w-0 space-y-2'>
                    <FormLabel>{t('Password reset subject')}</FormLabel>
                    <FormDescription>
                      {t('Subject for password reset messages')}
                    </FormDescription>
                    <FormControl>
                      <Input
                        className='w-full'
                        autoComplete='off'
                        placeholder='{{.SystemName}} · 密码重置'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='PasswordResetHTML'
                render={({ field }) => (
                  <FormItem className='min-w-0 space-y-2'>
                    <FormLabel>{t('Password reset HTML')}</FormLabel>
                    <FormDescription>
                      {t(
                        'HTML body. Use {{.ResetLink}}, {{.SystemName}}, {{.ValidMinutes}}.'
                      )}
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        className='min-h-72 w-full resize-y font-mono text-xs leading-relaxed'
                        autoComplete='off'
                        spellCheck={false}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {(previewSubject || previewHtml) && (
              <div
                data-settings-form-span='full'
                className='border-border/70 mt-2 min-w-0 rounded-lg border bg-[#f3efe8]/40 p-4'
              >
                <p className='yb-eyebrow text-text-muted mb-2'>
                  {previewKind === 'verification'
                    ? t('Verification preview')
                    : t('Password reset preview')}
                </p>
                <p className='text-text-strong mb-3 text-sm font-medium break-words'>
                  {previewSubject}
                </p>
                <div
                  className='max-w-full overflow-x-auto rounded-md border border-[#e7e1d7] bg-white'
                  // Admin-only preview of templates they themselves edited.
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              </div>
            )}
          </SettingsForm>
        </Form>
      </SettingsSection>
    </>
  )
}
