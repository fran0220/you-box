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
import { Textarea } from '@/components/ui/textarea'
import { FormDirtyIndicator } from '../components/form-dirty-indicator'
import { FormNavigationGuard } from '../components/form-navigation-guard'
import {
  SettingRowFormItem,
  SettingRowGroup,
  SettingsForm,
  SettingsFormGrid,
  SettingsFormGridItem,
} from '../components/settings-form-layout'
import { SettingsPageFormActions } from '../components/settings-page-context'
import { SettingsSection } from '../components/settings-section'
import { useSettingsForm } from '../hooks/use-settings-form'
import { useUpdateOption } from '../hooks/use-update-option'

const _systemInfoSchema = z.object({
  SystemName: z.string().min(1),
  ServerAddress: z.string().optional(),
  Logo: z.string().optional(),
  LogoLight: z.string().optional(),
  LogoDark: z.string().optional(),
  Favicon: z.string().optional(),
  MetaTitle: z.string().optional(),
  MetaDescription: z.string().optional(),
  BrandColor: z.string().optional(),
  Footer: z.string().optional(),
  About: z.string().optional(),
  HomePageContent: z.string().optional(),
  legal: z.object({
    user_agreement: z.string().optional(),
    privacy_policy: z.string().optional(),
  }),
})

type SystemInfoFormValues = z.infer<typeof _systemInfoSchema>

type SystemInfoSectionProps = {
  defaultValues: SystemInfoFormValues
}

function normalizeValue(value: unknown): string {
  if (value === undefined || value === null) return ''
  return typeof value === 'string' ? value : String(value)
}

function isOptionalAssetPath(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed) return true
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return true
  try {
    const parsed = new URL(trimmed)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
  } catch {
    return false
  }
}

function isOptionalHexColor(value: string): boolean {
  const trimmed = value.trim()
  return !trimmed || /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(trimmed)
}

const trimBeforeSaveKeys = new Set([
  'Logo',
  'LogoLight',
  'LogoDark',
  'Favicon',
  'MetaTitle',
  'MetaDescription',
  'BrandColor',
])

export function SystemInfoSection(props: SystemInfoSectionProps) {
  const { t } = useTranslation()
  const updateOption = useUpdateOption()

  const normalizedDefaults: SystemInfoFormValues = {
    SystemName: normalizeValue(props.defaultValues.SystemName),
    ServerAddress: normalizeValue(props.defaultValues.ServerAddress),
    Logo: normalizeValue(props.defaultValues.Logo),
    LogoLight: normalizeValue(props.defaultValues.LogoLight),
    LogoDark: normalizeValue(props.defaultValues.LogoDark),
    Favicon: normalizeValue(props.defaultValues.Favicon),
    MetaTitle: normalizeValue(props.defaultValues.MetaTitle),
    MetaDescription: normalizeValue(props.defaultValues.MetaDescription),
    BrandColor: normalizeValue(props.defaultValues.BrandColor),
    Footer: normalizeValue(props.defaultValues.Footer),
    About: normalizeValue(props.defaultValues.About),
    HomePageContent: normalizeValue(props.defaultValues.HomePageContent),
    legal: {
      user_agreement: normalizeValue(props.defaultValues.legal?.user_agreement),
      privacy_policy: normalizeValue(props.defaultValues.legal?.privacy_policy),
    },
  }

  const assetPathSchema = z.string().superRefine((value, ctx) => {
    if (isOptionalAssetPath(value)) return
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: t('Enter a valid URL or root-relative path'),
    })
  })

  const systemInfoSchemaWithI18n = z.object({
    SystemName: z.string().min(1, {
      error: () => t('System name is required'),
    }),
    ServerAddress: z.string().optional(),
    Logo: assetPathSchema,
    LogoLight: assetPathSchema,
    LogoDark: assetPathSchema,
    Favicon: assetPathSchema,
    MetaTitle: z.string().optional(),
    MetaDescription: z.string().optional(),
    BrandColor: z.string().superRefine((value, ctx) => {
      if (isOptionalHexColor(value)) return
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t('Enter a valid hex color, such as #0f172a'),
      })
    }),
    Footer: z.string().optional(),
    About: z.string().optional(),
    HomePageContent: z.string().optional(),
    legal: z.object({
      user_agreement: z.string().optional(),
      privacy_policy: z.string().optional(),
    }),
  })

  const { form, handleSubmit, handleReset, isDirty, isSubmitting } =
    useSettingsForm<SystemInfoFormValues>({
      resolver: zodResolver(systemInfoSchemaWithI18n) as Resolver<
        SystemInfoFormValues,
        unknown,
        SystemInfoFormValues
      >,
      defaultValues: normalizedDefaults,
      onSubmit: async (_data, changedFields) => {
        for (const [key, value] of Object.entries(changedFields)) {
          let v = normalizeValue(value)
          if (trimBeforeSaveKeys.has(key)) {
            v = v.trim()
          }
          if (key === 'ServerAddress') {
            v = v.replace(/\/+$/, '')
          }
          await updateOption.mutateAsync({
            key,
            value: v,
          })
        }
      },
    })
  const currentSystemName =
    form.watch('SystemName') || normalizedDefaults.SystemName

  return (
    <>
      <FormNavigationGuard when={isDirty} />

      <SettingsSection title={t('System Information')}>
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
              <FormField
                control={form.control}
                name='SystemName'
                render={({ field }) => (
                  <SettingRowFormItem
                    label={t('System Name')}
                    description={t('The name displayed across the application')}
                    control={
                      <FormControl>
                        <Input
                          className='w-60'
                          placeholder={t('Your brand name')}
                          {...field}
                        />
                      </FormControl>
                    }
                  />
                )}
              />

              <FormField
                control={form.control}
                name='ServerAddress'
                render={({ field }) => (
                  <SettingRowFormItem
                    label={t('Server Address')}
                    description={t(
                      'The public URL of your server, used for OAuth callbacks, webhooks, and other external integrations'
                    )}
                    control={
                      <FormControl>
                        <Input
                          className='w-72 max-w-full'
                          placeholder='https://yourdomain.com'
                          {...field}
                        />
                      </FormControl>
                    }
                  />
                )}
              />

              <FormField
                control={form.control}
                name='Logo'
                render={({ field }) => (
                  <SettingRowFormItem
                    label={t('Logo URL')}
                    description={t('URL to your logo image (optional)')}
                    control={
                      <FormControl>
                        <Input
                          className='w-72 max-w-full'
                          placeholder={t('https://example.com/logo.png')}
                          {...field}
                        />
                      </FormControl>
                    }
                  />
                )}
              />

              <FormField
                control={form.control}
                name='LogoLight'
                render={({ field }) => (
                  <SettingRowFormItem
                    label={t('Logo light URL')}
                    description={t(
                      'Optional logo for light theme; falls back to Logo URL'
                    )}
                    control={
                      <FormControl>
                        <Input
                          className='w-72 max-w-full'
                          placeholder='/brand/logo-light.svg'
                          {...field}
                        />
                      </FormControl>
                    }
                  />
                )}
              />

              <FormField
                control={form.control}
                name='LogoDark'
                render={({ field }) => (
                  <SettingRowFormItem
                    label={t('Logo dark URL')}
                    description={t(
                      'Optional logo for dark theme; falls back to Logo URL'
                    )}
                    control={
                      <FormControl>
                        <Input
                          className='w-72 max-w-full'
                          placeholder='/brand/logo-dark.svg'
                          {...field}
                        />
                      </FormControl>
                    }
                  />
                )}
              />

              <FormField
                control={form.control}
                name='Favicon'
                render={({ field }) => (
                  <SettingRowFormItem
                    label={t('Favicon URL')}
                    description={t('Browser tab icon. Falls back to Logo URL.')}
                    control={
                      <FormControl>
                        <Input
                          className='w-72 max-w-full'
                          placeholder='/favicon.ico'
                          {...field}
                        />
                      </FormControl>
                    }
                  />
                )}
              />

              <FormField
                control={form.control}
                name='BrandColor'
                render={({ field }) => (
                  <SettingRowFormItem
                    label={t('Brand color')}
                    description={t(
                      'Hex color used for primary buttons, focus rings, and brand accents.'
                    )}
                    control={
                      <FormControl>
                        <Input
                          className='w-40'
                          placeholder='#0f172a'
                          {...field}
                        />
                      </FormControl>
                    }
                  />
                )}
              />
            </SettingRowGroup>

            <SettingsFormGrid>
              <FormField
                control={form.control}
                name='MetaTitle'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('SEO title')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t(
                          'Optional browser/metadata title. Falls back to System Name.'
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {t(
                        'Optional browser/metadata title. Falls back to System Name.'
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='MetaDescription'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('SEO description')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t(
                          'Optional description used for HTML meta tags and link previews.'
                        )}
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {t(
                        'Optional description used for HTML meta tags and link previews.'
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='Footer'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('Footer')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t(
                          '© 2025 Your Company. All rights reserved.'
                        )}
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {t('Footer text displayed at the bottom of pages')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='About'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('About')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t(
                          'Enter HTML code (e.g., <p>About us...</p>) or a URL (e.g., https://example.com) to embed as iframe'
                        )}
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {t(
                        'Supports HTML markup or iframe embedding. Enter HTML code directly, or provide a complete URL to automatically embed it as an iframe.'
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <SettingsFormGridItem span='full'>
                <FormField
                  control={form.control}
                  name='HomePageContent'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('Home Page Content')}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('Welcome to {{brandName}}...', {
                            brandName: currentSystemName,
                          })}
                          rows={6}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {t(
                          'Content displayed on the home page (supports Markdown)'
                        )}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </SettingsFormGridItem>

              <FormField
                control={form.control}
                name='legal.user_agreement'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('User Agreement')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t(
                          'Provide Markdown, HTML, or an external URL for the user agreement'
                        )}
                        rows={6}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {t(
                        'Leave empty to disable the agreement requirement. Supports Markdown, HTML, or a full URL to redirect users.'
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='legal.privacy_policy'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('Privacy Policy')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t(
                          'Provide Markdown, HTML, or an external URL for the privacy policy'
                        )}
                        rows={6}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {t(
                        'Leave empty to disable the privacy policy requirement. Supports Markdown, HTML, or a full URL to redirect users.'
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </SettingsFormGrid>
          </SettingsForm>
        </Form>
      </SettingsSection>
    </>
  )
}
