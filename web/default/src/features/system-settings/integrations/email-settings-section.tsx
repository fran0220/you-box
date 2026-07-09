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
import { useEffect, useMemo, useState } from 'react'
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
import {
  SegmentedTabs,
  SegmentedTabsList,
  SegmentedTabsTrigger,
} from '@/components/youbox/segmented-tabs'
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

const HEX_COLOR = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

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
    EmailBrandName: z.string(),
    EmailBrandLogoURL: z.string().refine((value) => {
      const trimmed = value.trim()
      if (!trimmed) return true
      try {
        const url = new URL(trimmed)
        return url.protocol === 'http:' || url.protocol === 'https:'
      } catch {
        return false
      }
    }, t('Enter a valid http(s) logo URL or leave blank')),
    EmailBrandPrimaryColor: z.string().refine((value) => {
      const trimmed = value.trim()
      if (!trimmed) return true
      return HEX_COLOR.test(trimmed)
    }, t('Enter a valid hex color, such as #0f172a')),
    EmailBrandFooterText: z.string(),
    EmailVerificationSubject: z.string(),
    EmailVerificationTitle: z.string(),
    EmailVerificationLead: z.string(),
    PasswordResetSubject: z.string(),
    PasswordResetTitle: z.string(),
    PasswordResetLead: z.string(),
    PasswordResetButtonText: z.string(),
  })

type EmailFormValues = z.infer<ReturnType<typeof createEmailSchema>>

type EmailSettingsSectionProps = {
  defaultValues: EmailFormValues
}

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
        const sanitized: EmailFormValues = {
          SMTPServer: values.SMTPServer.trim(),
          SMTPPort: values.SMTPPort.trim(),
          SMTPAccount: values.SMTPAccount.trim(),
          SMTPFrom: values.SMTPFrom.trim(),
          SMTPToken: values.SMTPToken.trim(),
          SMTPSSLEnabled: values.SMTPSSLEnabled,
          SMTPForceAuthLogin: values.SMTPForceAuthLogin,
          EmailBrandName: values.EmailBrandName.trim(),
          EmailBrandLogoURL: values.EmailBrandLogoURL.trim(),
          EmailBrandPrimaryColor: values.EmailBrandPrimaryColor.trim(),
          EmailBrandFooterText: values.EmailBrandFooterText.trim(),
          EmailVerificationSubject: values.EmailVerificationSubject.trim(),
          EmailVerificationTitle: values.EmailVerificationTitle.trim(),
          EmailVerificationLead: values.EmailVerificationLead.trim(),
          PasswordResetSubject: values.PasswordResetSubject.trim(),
          PasswordResetTitle: values.PasswordResetTitle.trim(),
          PasswordResetLead: values.PasswordResetLead.trim(),
          PasswordResetButtonText: values.PasswordResetButtonText.trim(),
        }

        const brandKeys: Array<keyof EmailFormValues> = [
          'EmailBrandName',
          'EmailBrandLogoURL',
          'EmailBrandPrimaryColor',
          'EmailBrandFooterText',
          'EmailVerificationSubject',
          'EmailVerificationTitle',
          'EmailVerificationLead',
          'PasswordResetSubject',
          'PasswordResetTitle',
          'PasswordResetLead',
          'PasswordResetButtonText',
        ]
        let brandChanged = false

        for (const key of Object.keys(changedFields) as Array<
          keyof EmailFormValues
        >) {
          if (key === 'SMTPToken') {
            const token = sanitized.SMTPToken
            if (!token) continue
            await updateOption.mutateAsync({ key: 'SMTPToken', value: token })
            continue
          }
          if (brandKeys.includes(key)) {
            brandChanged = true
          }
          await updateOption.mutateAsync({
            key,
            value: sanitized[key] as string | boolean,
          })
        }

        // Prefer visual brand templates: clear any legacy raw HTML overrides.
        if (brandChanged) {
          await updateOption.mutateAsync({
            key: 'EmailVerificationHTML',
            value: '',
          })
          await updateOption.mutateAsync({
            key: 'PasswordResetHTML',
            value: '',
          })
        }
      },
    })

  const brandName = form.watch('EmailBrandName')
  const brandLogoURL = form.watch('EmailBrandLogoURL')
  const brandPrimaryColor = form.watch('EmailBrandPrimaryColor')
  const brandFooterText = form.watch('EmailBrandFooterText')
  const verificationSubject = form.watch('EmailVerificationSubject')
  const verificationTitle = form.watch('EmailVerificationTitle')
  const verificationLead = form.watch('EmailVerificationLead')
  const resetSubject = form.watch('PasswordResetSubject')
  const resetTitle = form.watch('PasswordResetTitle')
  const resetLead = form.watch('PasswordResetLead')
  const resetButtonText = form.watch('PasswordResetButtonText')

  const previewPayload = useMemo(
    () => ({
      brand_name: brandName,
      logo_url: brandLogoURL,
      primary_color: brandPrimaryColor,
      footer_text: brandFooterText,
      verification_subject: verificationSubject,
      verification_title: verificationTitle,
      verification_lead: verificationLead,
      password_reset_subject: resetSubject,
      password_reset_title: resetTitle,
      password_reset_lead: resetLead,
      password_reset_button_text: resetButtonText,
    }),
    [
      brandName,
      brandLogoURL,
      brandPrimaryColor,
      brandFooterText,
      verificationSubject,
      verificationTitle,
      verificationLead,
      resetSubject,
      resetTitle,
      resetLead,
      resetButtonText,
    ]
  )

  // Live preview when brand fields change (debounced).
  useEffect(() => {
    let cancelled = false
    const timer = window.setTimeout(() => {
      setIsPreviewing(true)
      void previewEmailTemplate({ kind: previewKind, ...previewPayload })
        .then((res) => {
          if (cancelled) return
          if (!res.success || !res.data) {
            throw new Error(res.message || t('Preview failed'))
          }
          setPreviewSubject(res.data.subject)
          setPreviewHtml(res.data.html)
        })
        .catch((error: unknown) => {
          if (cancelled) return
          toast.error(
            error instanceof Error ? error.message : t('Preview failed')
          )
        })
        .finally(() => {
          if (!cancelled) setIsPreviewing(false)
        })
    }, 400)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [previewKind, previewPayload, t])

  const restoreDefaults = async () => {
    setIsRestoring(true)
    try {
      const res = await getEmailTemplateDefaults()
      if (!res.success || !res.data) {
        throw new Error(res.message || t('Failed to load defaults'))
      }
      form.setValue('EmailBrandName', res.data.EmailBrandName ?? '', {
        shouldDirty: true,
      })
      form.setValue('EmailBrandLogoURL', res.data.EmailBrandLogoURL ?? '', {
        shouldDirty: true,
      })
      form.setValue(
        'EmailBrandPrimaryColor',
        res.data.EmailBrandPrimaryColor ?? '',
        { shouldDirty: true }
      )
      form.setValue(
        'EmailBrandFooterText',
        res.data.EmailBrandFooterText ?? '',
        { shouldDirty: true }
      )
      form.setValue(
        'EmailVerificationSubject',
        res.data.EmailVerificationSubject ?? '',
        { shouldDirty: true }
      )
      form.setValue(
        'EmailVerificationTitle',
        res.data.EmailVerificationTitle ?? '',
        { shouldDirty: true }
      )
      form.setValue(
        'EmailVerificationLead',
        res.data.EmailVerificationLead ?? '',
        { shouldDirty: true }
      )
      form.setValue(
        'PasswordResetSubject',
        res.data.PasswordResetSubject ?? '',
        { shouldDirty: true }
      )
      form.setValue('PasswordResetTitle', res.data.PasswordResetTitle ?? '', {
        shouldDirty: true,
      })
      form.setValue('PasswordResetLead', res.data.PasswordResetLead ?? '', {
        shouldDirty: true,
      })
      form.setValue(
        'PasswordResetButtonText',
        res.data.PasswordResetButtonText ?? '',
        { shouldDirty: true }
      )
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
              className='mb-3 flex flex-wrap items-center justify-between gap-2'
            >
              <p className='text-text-muted max-w-2xl text-sm leading-relaxed'>
                {t(
                  'Two built-in templates (verification and password reset). Customize brand elements only — layout stays consistent.'
                )}
              </p>
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

            <div
              data-settings-form-span='full'
              className='grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]'
            >
              <div className='flex min-w-0 flex-col gap-6'>
                <div className='space-y-4'>
                  <p className='yb-eyebrow text-text-muted'>{t('Brand')}</p>
                  <FormField
                    control={form.control}
                    name='EmailBrandName'
                    render={({ field }) => (
                      <FormItem className='min-w-0 space-y-2'>
                        <FormLabel>{t('Brand name')}</FormLabel>
                        <FormDescription>
                          {t(
                            'Shown in subjects and body. Leave blank to use System Name.'
                          )}
                        </FormDescription>
                        <FormControl>
                          <Input
                            className='w-full'
                            autoComplete='off'
                            placeholder={systemName || 'YouBox'}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='EmailBrandLogoURL'
                    render={({ field }) => (
                      <FormItem className='min-w-0 space-y-2'>
                        <FormLabel>{t('Logo URL')}</FormLabel>
                        <FormDescription>
                          {t(
                            'Optional absolute image URL shown at the top of the email.'
                          )}
                        </FormDescription>
                        <FormControl>
                          <Input
                            className='w-full'
                            autoComplete='off'
                            placeholder='https://cdn.example.com/logo.png'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='EmailBrandPrimaryColor'
                    render={({ field }) => (
                      <FormItem className='min-w-0 space-y-2'>
                        <FormLabel>{t('Primary color')}</FormLabel>
                        <FormDescription>
                          {t(
                            'Used for headings, code accent, and the reset button.'
                          )}
                        </FormDescription>
                        <div className='flex items-center gap-3'>
                          <FormControl>
                            <Input
                              className='w-full font-mono'
                              autoComplete='off'
                              placeholder='#1f1b16'
                              {...field}
                            />
                          </FormControl>
                          <input
                            aria-label={t('Primary color picker')}
                            type='color'
                            className='border-border/70 h-10 w-12 shrink-0 cursor-pointer rounded-md border bg-transparent p-1'
                            value={
                              HEX_COLOR.test(field.value?.trim() || '')
                                ? field.value.trim().length === 4
                                  ? `#${field.value
                                      .trim()
                                      .slice(1)
                                      .split('')
                                      .map((c) => c + c)
                                      .join('')}`
                                  : field.value.trim()
                                : '#1f1b16'
                            }
                            onChange={(event) =>
                              field.onChange(event.target.value)
                            }
                          />
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='EmailBrandFooterText'
                    render={({ field }) => (
                      <FormItem className='min-w-0 space-y-2'>
                        <FormLabel>{t('Footer text')}</FormLabel>
                        <FormDescription>
                          {t(
                            'Small line under the card. Defaults to brand name.'
                          )}
                        </FormDescription>
                        <FormControl>
                          <Input
                            className='w-full'
                            autoComplete='off'
                            placeholder={systemName || 'YouBox'}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className='space-y-4 border-t border-border/70 pt-6'>
                  <p className='yb-eyebrow text-text-muted'>
                    {t('Verification email')}
                  </p>
                  <FormField
                    control={form.control}
                    name='EmailVerificationSubject'
                    render={({ field }) => (
                      <FormItem className='min-w-0 space-y-2'>
                        <FormLabel>{t('Subject')}</FormLabel>
                        <FormControl>
                          <Input
                            className='w-full'
                            autoComplete='off'
                            placeholder='{{.BrandName}} · 邮箱验证码'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='EmailVerificationTitle'
                    render={({ field }) => (
                      <FormItem className='min-w-0 space-y-2'>
                        <FormLabel>{t('Title')}</FormLabel>
                        <FormControl>
                          <Input
                            className='w-full'
                            autoComplete='off'
                            placeholder={t('Confirm your email address')}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='EmailVerificationLead'
                    render={({ field }) => (
                      <FormItem className='min-w-0 space-y-2'>
                        <FormLabel>{t('Lead paragraph')}</FormLabel>
                        <FormDescription>
                          {t(
                            'Leave blank to use the default sentence with brand name.'
                          )}
                        </FormDescription>
                        <FormControl>
                          <Textarea
                            className='min-h-20 w-full resize-y text-sm leading-relaxed'
                            autoComplete='off'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className='space-y-4 border-t border-border/70 pt-6'>
                  <p className='yb-eyebrow text-text-muted'>
                    {t('Password reset email')}
                  </p>
                  <FormField
                    control={form.control}
                    name='PasswordResetSubject'
                    render={({ field }) => (
                      <FormItem className='min-w-0 space-y-2'>
                        <FormLabel>{t('Subject')}</FormLabel>
                        <FormControl>
                          <Input
                            className='w-full'
                            autoComplete='off'
                            placeholder='{{.BrandName}} · 密码重置'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='PasswordResetTitle'
                    render={({ field }) => (
                      <FormItem className='min-w-0 space-y-2'>
                        <FormLabel>{t('Title')}</FormLabel>
                        <FormControl>
                          <Input
                            className='w-full'
                            autoComplete='off'
                            placeholder={t('Reset your password')}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='PasswordResetLead'
                    render={({ field }) => (
                      <FormItem className='min-w-0 space-y-2'>
                        <FormLabel>{t('Lead paragraph')}</FormLabel>
                        <FormControl>
                          <Textarea
                            className='min-h-20 w-full resize-y text-sm leading-relaxed'
                            autoComplete='off'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='PasswordResetButtonText'
                    render={({ field }) => (
                      <FormItem className='min-w-0 space-y-2'>
                        <FormLabel>{t('Button label')}</FormLabel>
                        <FormControl>
                          <Input
                            className='w-full'
                            autoComplete='off'
                            placeholder={t('Reset password')}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className='min-w-0 lg:sticky lg:top-20 lg:self-start'>
                <div className='border-border/70 rounded-lg border bg-[#f3efe8]/40 p-4'>
                  <div className='mb-3 flex flex-wrap items-center justify-between gap-2'>
                    <p className='yb-eyebrow text-text-muted'>
                      {t('Live preview')}
                      {isPreviewing ? ` · ${t('Updating…')}` : ''}
                    </p>
                    <SegmentedTabs
                      value={previewKind}
                      onValueChange={(value) =>
                        setPreviewKind(
                          value as 'verification' | 'password_reset'
                        )
                      }
                    >
                      <SegmentedTabsList>
                        <SegmentedTabsTrigger value='verification'>
                          {t('Verification')}
                        </SegmentedTabsTrigger>
                        <SegmentedTabsTrigger value='password_reset'>
                          {t('Password reset')}
                        </SegmentedTabsTrigger>
                      </SegmentedTabsList>
                    </SegmentedTabs>
                  </div>

                  {previewSubject ? (
                    <p className='text-text-strong mb-3 text-sm font-medium break-words'>
                      {previewSubject}
                    </p>
                  ) : (
                    <p className='text-text-muted mb-3 text-sm'>
                      {t('Preview will appear here.')}
                    </p>
                  )}

                  <div className='max-w-full overflow-x-auto rounded-md border border-[#e7e1d7] bg-white'>
                    {previewHtml ? (
                      <div
                        // Admin-only preview of templates they themselves configured.
                        dangerouslySetInnerHTML={{ __html: previewHtml }}
                      />
                    ) : (
                      <div className='text-text-muted p-8 text-center text-sm'>
                        {t('Loading preview…')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </SettingsForm>
        </Form>
      </SettingsSection>
    </>
  )
}
