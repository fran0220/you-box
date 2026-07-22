import { useState } from 'react'
import { z } from 'zod'
import type { Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
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
import { testDeploymentConnectionWithKey } from '@/features/models/api'
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

const schema = z.object({
  enabled: z.boolean(),
  apiKey: z.string().optional(),
})

type IoNetFormValues = z.input<typeof schema>

const IONET_FIELD_TO_OPTION: Record<string, string> = {
  enabled: 'model_deployment.ionet.enabled',
  apiKey: 'model_deployment.ionet.api_key',
}

export function IoNetDeploymentSettingsSection({
  defaultValues,
}: {
  defaultValues: {
    enabled: boolean
    apiKey: string
  }
}) {
  const { t } = useTranslation()
  const updateOption = useUpdateOption()

  const { form, handleSubmit, handleReset, isDirty, isSubmitting } =
    useSettingsForm<IoNetFormValues>({
      resolver: zodResolver(schema) as Resolver<
        IoNetFormValues,
        unknown,
        IoNetFormValues
      >,
      defaultValues: {
        enabled: defaultValues.enabled,
        apiKey: defaultValues.apiKey ?? '',
      },
      onSubmit: async (_data, changedFields) => {
        for (const [field, value] of Object.entries(changedFields)) {
          const key = IONET_FIELD_TO_OPTION[field]
          if (!key) continue
          await updateOption.mutateAsync({
            key,
            value: field === 'enabled' ? String(value) : String(value ?? ''),
          })
        }
      },
    })

  const enabled = form.watch('enabled')

  const [testState, setTestState] = useState<{
    loading: boolean
    ok: boolean | null
    error: string | null
  }>({ loading: false, ok: null, error: null })

  const handleTestConnection = async () => {
    setTestState({ loading: true, ok: null, error: null })
    try {
      const apiKey = form.getValues('apiKey')
      const res = await testDeploymentConnectionWithKey(apiKey)
      if (res?.success) {
        setTestState({ loading: false, ok: true, error: null })
        return
      }
      setTestState({
        loading: false,
        ok: false,
        error: res?.message || t('Connection failed'),
      })
    } catch (err) {
      setTestState({
        loading: false,
        ok: false,
        error: err instanceof Error ? err.message : t('Connection failed'),
      })
    }
  }

  return (
    <>
      <FormNavigationGuard when={isDirty} />

      <SettingsSection title={t('io.net Deployments')}>
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
                    label={t('Enable io.net deployments')}
                    description={t(
                      'Enable io.net model deployment service in console'
                    )}
                    control={
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(v) => field.onChange(v)}
                          disabled={updateOption.isPending || isSubmitting}
                        />
                      </FormControl>
                    }
                  />
                )}
              />
            </SettingRowGroup>

            {enabled ? (
              <>
                <FormField
                  control={form.control}
                  name='apiKey'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('io.net API Key')}</FormLabel>
                      <div className='flex gap-2'>
                        <FormControl>
                          <Input
                            type='password'
                            placeholder={t('Enter API Key')}
                            autoComplete='off'
                            {...field}
                          />
                        </FormControl>
                        <Button
                          type='button'
                          variant='secondary'
                          onClick={handleTestConnection}
                          disabled={testState.loading || updateOption.isPending}
                          className='shrink-0'
                        >
                          {testState.loading ? (
                            <Loader2 className='me-2 size-4 animate-spin' />
                          ) : null}
                          {t('Test Connection')}
                        </Button>
                      </div>
                      <FormDescription>
                        {t('Used to authenticate with io.net deployment API')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Alert variant='default'>
                  <AlertTitle>{t('How to get an io.net API Key')}</AlertTitle>
                  <AlertDescription>
                    <div className='space-y-2'>
                      <ul className='list-disc space-y-1 pl-5'>
                        <li>{t('Open the io.net console API Keys page')}</li>
                        <li>
                          {t(
                            'Set Project to io.cloud when creating/selecting key'
                          )}
                        </li>
                        <li>{t('Copy the key and paste it here')}</li>
                      </ul>
                      <Button
                        type='button'
                        variant='outline'
                        onClick={() =>
                          window.open('https://ai.io.net/ai/api-keys', '_blank')
                        }
                      >
                        {t('Go to io.net API Keys')}
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>

                {testState.ok === true ? (
                  <Alert variant='default' className='flex items-center gap-2'>
                    <CheckCircle2 className='text-success size-4' />
                    <div>
                      <AlertTitle>{t('Connection successful')}</AlertTitle>
                      <AlertDescription>
                        {t('Connected to io.net service normally.')}
                      </AlertDescription>
                    </div>
                  </Alert>
                ) : null}

                {testState.ok === false && testState.error ? (
                  <Alert
                    variant='destructive'
                    className='flex items-center gap-2'
                  >
                    <XCircle className='size-4' />
                    <div>
                      <AlertTitle>{t('Connection failed')}</AlertTitle>
                      <AlertDescription>{t(testState.error)}</AlertDescription>
                    </div>
                  </Alert>
                ) : null}
              </>
            ) : null}
          </SettingsForm>
        </Form>
      </SettingsSection>
    </>
  )
}
