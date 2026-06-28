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
import { useMemo } from 'react'
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
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { FormDirtyIndicator } from '../components/form-dirty-indicator'
import { FormNavigationGuard } from '../components/form-navigation-guard'
import {
  SettingRowFormItem,
  SettingRowGroup,
  SettingsControlGroup,
  SettingsForm,
} from '../components/settings-form-layout'
import { SettingsPageFormActions } from '../components/settings-page-context'
import { SettingsSection } from '../components/settings-section'
import { useSettingsForm } from '../hooks/use-settings-form'
import { useUpdateOption } from '../hooks/use-update-option'
import {
  formatJsonForTextarea,
  normalizeJsonString,
  validateJsonString,
} from './utils'

const schema = z.object({
  claude: z.object({
    model_headers_settings: z.string().superRefine((value, ctx) => {
      const result = validateJsonString(value)
      if (!result.valid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: result.message || 'Invalid JSON',
        })
      }
    }),
    default_max_tokens: z.string().superRefine((value, ctx) => {
      const result = validateJsonString(value)
      if (!result.valid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: result.message || 'Invalid JSON',
        })
      }
    }),
    thinking_adapter_enabled: z.boolean(),
    thinking_adapter_budget_tokens_percentage: z.coerce
      .number()
      .min(0.1, { message: 'Must be at least 0.1' })
      .max(1, { message: 'Must be 1 or less' }),
  }),
})

type ClaudeSettingsFormValues = z.output<typeof schema>
type ClaudeSettingsFormInput = z.input<typeof schema>

type FlatClaudeSettings = {
  'claude.model_headers_settings': string
  'claude.default_max_tokens': string
  'claude.thinking_adapter_enabled': boolean
  'claude.thinking_adapter_budget_tokens_percentage': number
}

const buildFormDefaults = (
  values: ClaudeSettingsFormInput
): ClaudeSettingsFormInput => ({
  claude: {
    model_headers_settings: formatJsonForTextarea(
      values.claude.model_headers_settings
    ),
    default_max_tokens: formatJsonForTextarea(values.claude.default_max_tokens),
    thinking_adapter_enabled: values.claude.thinking_adapter_enabled,
    thinking_adapter_budget_tokens_percentage:
      values.claude.thinking_adapter_budget_tokens_percentage,
  },
})

const flattenClaudeValues = (
  values: ClaudeSettingsFormValues
): FlatClaudeSettings => ({
  'claude.model_headers_settings': normalizeJsonString(
    values.claude.model_headers_settings
  ),
  'claude.default_max_tokens': normalizeJsonString(
    values.claude.default_max_tokens
  ),
  'claude.thinking_adapter_enabled': values.claude.thinking_adapter_enabled,
  'claude.thinking_adapter_budget_tokens_percentage':
    values.claude.thinking_adapter_budget_tokens_percentage,
})

type ClaudeSettingsCardProps = {
  defaultValues: ClaudeSettingsFormInput
}

export function ClaudeSettingsCard({ defaultValues }: ClaudeSettingsCardProps) {
  const { t } = useTranslation()
  const updateOption = useUpdateOption()

  const resolvedDefaults = useMemo(
    () => buildFormDefaults(defaultValues),
    [defaultValues]
  )

  const { form, handleSubmit, handleReset, isDirty, isSubmitting } =
    useSettingsForm<ClaudeSettingsFormValues>({
      resolver: zodResolver(schema) as Resolver<
        ClaudeSettingsFormValues,
        unknown,
        ClaudeSettingsFormValues
      >,
      defaultValues: resolvedDefaults as ClaudeSettingsFormValues,
      onSubmit: async (values, changedFields) => {
        const flattened = flattenClaudeValues(values)
        for (const key of Object.keys(changedFields)) {
          if (!(key in flattened)) continue
          await updateOption.mutateAsync({
            key,
            value: flattened[key as keyof FlatClaudeSettings],
          })
        }
      },
    })

  return (
    <>
      <FormNavigationGuard when={isDirty} />

      <SettingsSection title={t('Claude')}>
        <Form {...form}>
          <SettingsForm onSubmit={handleSubmit}>
            <SettingsPageFormActions
              onSave={handleSubmit}
              onReset={handleReset}
              isSaving={updateOption.isPending || isSubmitting}
              isResetDisabled={!isDirty}
            />
            <FormDirtyIndicator isDirty={isDirty} />
            <FormField
              control={form.control}
              name='claude.model_headers_settings'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Request Header Overrides')}</FormLabel>
                  <FormControl>
                    <Textarea rows={8} {...field} />
                  </FormControl>
                  <FormDescription>
                    {t(
                      'Provide per-model header overrides as JSON. Useful for enabling beta features such as expanded context windows.'
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='claude.default_max_tokens'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Default Max Tokens')}</FormLabel>
                  <FormControl>
                    <Textarea rows={8} {...field} />
                  </FormControl>
                  <FormDescription>
                    {t('Example')}{' '}
                    {`{ "default": 8192, "claude-3-haiku-20240307": 4096, "claude-3-opus-20240229": 4096, "claude-3-7-sonnet-20250219-thinking": 8192 }`}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SettingsControlGroup>
              <SettingRowGroup>
                <FormField
                  control={form.control}
                  name='claude.thinking_adapter_enabled'
                  render={({ field }) => (
                    <SettingRowFormItem
                      label={t('Thinking Suffix Adapter')}
                      description={t(
                        'Adapt `-thinking` suffix requests to Anthropic native thinking behavior while keeping billing predictable.'
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
                  name='claude.thinking_adapter_budget_tokens_percentage'
                  render={({ field }) => (
                    <SettingRowFormItem
                      label={t('Budget Tokens Ratio')}
                      description={t(
                        'Budget tokens = max tokens × ratio. Accepts a decimal between 0.1 and 1.'
                      )}
                      control={
                        <FormControl>
                          <Input
                            className='w-32'
                            {...field}
                            value={String(field.value ?? '')}
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
            </SettingsControlGroup>
          </SettingsForm>
        </Form>
      </SettingsSection>
    </>
  )
}
