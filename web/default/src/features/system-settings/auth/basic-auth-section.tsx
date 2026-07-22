import { useMemo } from 'react'
import * as z from 'zod'
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
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
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

const basicAuthSchema = z.object({
  PasswordLoginEnabled: z.boolean(),
  PasswordRegisterEnabled: z.boolean(),
  EmailVerificationEnabled: z.boolean(),
  RegisterEnabled: z.boolean(),
  EmailDomainRestrictionEnabled: z.boolean(),
  EmailAliasRestrictionEnabled: z.boolean(),
  EmailDomainWhitelist: z.string(),
})

type BasicAuthFormValues = z.infer<typeof basicAuthSchema>

type BasicAuthSectionProps = {
  defaultValues: BasicAuthFormValues
}

function domainsFromApi(csv: string): string {
  return csv
    .split(',')
    .map((domain) => domain.trim())
    .filter(Boolean)
    .join('\n')
}

function domainsToApi(text: string): string {
  return text
    .split('\n')
    .map((domain) => domain.trim())
    .filter(Boolean)
    .join(',')
}

export function BasicAuthSection({ defaultValues }: BasicAuthSectionProps) {
  const { t } = useTranslation()
  const updateOption = useUpdateOption()

  const formDefaults = useMemo<BasicAuthFormValues>(
    () => ({
      ...defaultValues,
      EmailDomainWhitelist: domainsFromApi(defaultValues.EmailDomainWhitelist),
    }),
    [defaultValues]
  )

  const { form, handleSubmit, handleReset, isDirty, isSubmitting } =
    useSettingsForm<BasicAuthFormValues>({
      resolver: zodResolver(basicAuthSchema),
      defaultValues: formDefaults,
      onSubmit: async (_data, changedFields) => {
        for (const [key, value] of Object.entries(changedFields)) {
          if (key === 'EmailDomainWhitelist') {
            await updateOption.mutateAsync({
              key,
              value: domainsToApi(String(value ?? '')),
            })
            continue
          }
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

      <SettingsSection title={t('Basic Authentication')}>
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
              name='PasswordLoginEnabled'
              render={({ field }) => (
                <SettingRowFormItem
                  label={t('Password Login')}
                  description={t('Allow users to log in with password')}
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
              name='RegisterEnabled'
              render={({ field }) => (
                <SettingRowFormItem
                  label={t('Registration Enabled')}
                  description={t('Allow new users to register')}
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
              name='PasswordRegisterEnabled'
              render={({ field }) => (
                <SettingRowFormItem
                  label={t('Password Registration')}
                  description={t('Allow registration with password')}
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
              name='EmailVerificationEnabled'
              render={({ field }) => (
                <SettingRowFormItem
                  label={t('Email Verification')}
                  description={t('Require email verification for new accounts')}
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
              name='EmailDomainRestrictionEnabled'
              render={({ field }) => (
                <SettingRowFormItem
                  label={t('Email Domain Restriction')}
                  description={t('Only allow specific email domains')}
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
              name='EmailAliasRestrictionEnabled'
              render={({ field }) => (
                <SettingRowFormItem
                  label={t('Email Alias Restriction')}
                  description={t(
                    'Block email aliases (e.g., user+alias@domain.com)'
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

          <FormField
            control={form.control}
            name='EmailDomainWhitelist'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('Email Domain Whitelist')}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t('example.com\ncompany.com')}
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  {t(
                    'One domain per line (only used when domain restriction is enabled)'
                  )}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          </SettingsForm>
        </Form>
      </SettingsSection>
    </>
  )
}
