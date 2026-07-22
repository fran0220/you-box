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

const XAI_VIOLATION_FEE_DOC_URL =
  'https://docs.x.ai/docs/models#usage-guidelines-violation-fee'

const grokSchema = z.object({
  grok: z.object({
    violation_deduction_enabled: z.boolean(),
    violation_deduction_amount: z.coerce.number().min(0),
  }),
})

type GrokFormValues = z.output<typeof grokSchema>

type FlatGrokDefaults = {
  'grok.violation_deduction_enabled': boolean
  'grok.violation_deduction_amount': number
}

const buildFormDefaults = (defaults: FlatGrokDefaults) => ({
  grok: {
    violation_deduction_enabled: defaults['grok.violation_deduction_enabled'],
    violation_deduction_amount: defaults['grok.violation_deduction_amount'],
  },
})

const GROK_FIELD_TO_OPTION_KEY: Record<string, string> = {
  'grok.violation_deduction_enabled': 'grok.violation_deduction_enabled',
  'grok.violation_deduction_amount': 'grok.violation_deduction_amount',
}

interface Props {
  defaultValues: FlatGrokDefaults
}

export function GrokSettingsCard(props: Props) {
  const { t } = useTranslation()
  const updateOption = useUpdateOption()

  const { form, handleSubmit, handleReset, isDirty, isSubmitting } =
    useSettingsForm<GrokFormValues>({
      resolver: zodResolver(grokSchema) as Resolver<
        GrokFormValues,
        unknown,
        GrokFormValues
      >,
      defaultValues: buildFormDefaults(props.defaultValues),
      onSubmit: async (_data, changedFields) => {
        for (const [key, value] of Object.entries(changedFields)) {
          const optionKey = GROK_FIELD_TO_OPTION_KEY[key] ?? key
          await updateOption.mutateAsync({
            key: optionKey,
            value: value as string | number | boolean,
          })
        }
      },
    })

  const enabled = form.watch('grok.violation_deduction_enabled')

  return (
    <>
      <FormNavigationGuard when={isDirty} />

      <SettingsSection title={t('Grok Settings')}>
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
                name='grok.violation_deduction_enabled'
                render={({ field }) => (
                  <SettingRowFormItem
                    label={t('Enable violation deduction')}
                    description={
                      <>
                        {t(
                          'When enabled, violation requests will incur additional charges.'
                        )}{' '}
                        <a
                          href={XAI_VIOLATION_FEE_DOC_URL}
                          target='_blank'
                          rel='noreferrer'
                          className='underline'
                        >
                          {t('Official documentation')}
                        </a>
                      </>
                    }
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
                name='grok.violation_deduction_amount'
                render={({ field }) => (
                  <SettingRowFormItem
                    label={t('Violation deduction amount')}
                    description={t(
                      'Base amount. Actual deduction = base amount × system group rate.'
                    )}
                    disabled={!enabled}
                    control={
                      <FormControl>
                        <Input
                          className='w-32'
                          type='number'
                          step={0.01}
                          min={0}
                          {...safeNumberFieldProps(field)}
                          disabled={!enabled}
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
