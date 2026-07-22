import * as z from 'zod'
import type { Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { DEFAULT_CURRENCY_CONFIG } from '@/stores/system-config-store'
import { Form, FormControl, FormField } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

const createPricingSchema = (t: (key: string) => string) =>
  z
    .object({
      QuotaPerUnit: z.coerce.number().min(0, t('Value must be at least 0')),
      USDExchangeRate: z.coerce
        .number()
        .min(0.0001, t('Exchange rate must be greater than 0')),
      DisplayInCurrencyEnabled: z.boolean(),
      DisplayTokenStatEnabled: z.boolean(),
      general_setting: z.object({
        quota_display_type: z.enum(['USD', 'CNY', 'TOKENS', 'CUSTOM']),
        custom_currency_symbol: z.string().max(8).optional(),
        custom_currency_exchange_rate: z.coerce
          .number()
          .min(0.0001, t('Exchange rate must be greater than 0'))
          .optional(),
      }),
    })
    .superRefine((data, ctx) => {
      const displayType = data.general_setting.quota_display_type

      if (displayType === 'CUSTOM') {
        if (!data.general_setting.custom_currency_symbol?.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['general_setting', 'custom_currency_symbol'],
            message: t('Custom currency symbol is required'),
          })
        }

        if (data.general_setting.custom_currency_exchange_rate == null) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['general_setting', 'custom_currency_exchange_rate'],
            message: t('Exchange rate is required'),
          })
        }
      }
    })

type PricingFormValues = z.infer<ReturnType<typeof createPricingSchema>>

type PricingSectionProps = {
  defaultValues: PricingFormValues
}

export function PricingSection({ defaultValues }: PricingSectionProps) {
  const { t } = useTranslation()
  const updateOption = useUpdateOption()

  const pricingSchema = createPricingSchema(t)

  const { form, handleSubmit, handleReset, isDirty, isSubmitting } =
    useSettingsForm<PricingFormValues>({
      resolver: zodResolver(pricingSchema) as Resolver<
        PricingFormValues,
        unknown,
        PricingFormValues
      >,
      defaultValues,
      onSubmit: async (_data, changedFields) => {
        for (const [key, value] of Object.entries(changedFields)) {
          if (value === undefined || value === null) continue

          let serialized: string
          if (typeof value === 'boolean') {
            serialized = String(value)
          } else if (typeof value === 'number') {
            serialized = Number.isFinite(value) ? String(value) : '0'
          } else {
            serialized = String(value)
          }

          await updateOption.mutateAsync({
            key,
            value: serialized,
          })
        }
      },
    })

  const displayType = form.watch('general_setting.quota_display_type') ?? 'USD'
  const displayInCurrencyEnabled = form.watch('DisplayInCurrencyEnabled')
  const showTokensOnlyOption = displayType === 'TOKENS'
  const showQuotaPerUnit =
    displayType === 'TOKENS' ||
    defaultValues.QuotaPerUnit !== DEFAULT_CURRENCY_CONFIG.quotaPerUnit
  const showDisplayInCurrencyOption = displayInCurrencyEnabled === false

  return (
    <>
      <FormNavigationGuard when={isDirty} />

      <SettingsSection title={t('Pricing & Display')}>
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
              {showQuotaPerUnit && (
                <FormField
                  control={form.control}
                  name='QuotaPerUnit'
                  render={({ field }) => (
                    <SettingRowFormItem
                      label={t('Quota Per Unit')}
                      description={t('Number of tokens per unit quota')}
                      control={
                        <FormControl>
                          <Input
                            className='w-32'
                            type='number'
                            step='0.01'
                            value={field.value as number}
                            disabled
                            name={field.name}
                            onBlur={field.onBlur}
                            ref={field.ref}
                          />
                        </FormControl>
                      }
                    />
                  )}
                />
              )}

              <FormField
                control={form.control}
                name='general_setting.quota_display_type'
                render={({ field }) => (
                  <SettingRowFormItem
                    label={t('Display Mode')}
                    description={t(
                      'Choose how quota values are shown to users'
                    )}
                    control={
                      <Select
                        items={[
                          { value: 'USD', label: t('USD') },
                          { value: 'CNY', label: t('CNY') },
                          { value: 'CUSTOM', label: t('Custom Currency') },
                          { value: 'TOKENS', label: t('Tokens Only') },
                        ]}
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className='w-56'>
                            <SelectValue
                              placeholder={t('Select display mode')}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent alignItemWithTrigger={false}>
                          <SelectGroup>
                            <SelectItem value='USD'>{t('USD')}</SelectItem>
                            <SelectItem value='CNY'>{t('CNY')}</SelectItem>
                            <SelectItem value='CUSTOM'>
                              {t('Custom Currency')}
                            </SelectItem>
                            {showTokensOnlyOption && (
                              <SelectItem value='TOKENS'>
                                {t('Tokens Only')}
                              </SelectItem>
                            )}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    }
                  />
                )}
              />

              {displayType !== 'TOKENS' && (
                <FormField
                  control={form.control}
                  name='USDExchangeRate'
                  render={({ field }) => (
                    <SettingRowFormItem
                      label={
                        displayType === 'CNY'
                          ? t('CNY per USD')
                          : displayType === 'USD'
                            ? t('USD Exchange Rate')
                            : t('USD Exchange Rate')
                      }
                      description={t(
                        'Real exchange rate between USD and your payment gateway currency'
                      )}
                      control={
                        <FormControl>
                          <Input
                            className='w-32'
                            type='number'
                            step='0.01'
                            {...safeNumberFieldProps(field)}
                          />
                        </FormControl>
                      }
                    />
                  )}
                />
              )}

              {displayType === 'CUSTOM' && (
                <>
                  <FormField
                    control={form.control}
                    name='general_setting.custom_currency_symbol'
                    render={({ field }) => (
                      <SettingRowFormItem
                        label={t('Custom Currency Symbol')}
                        description={t('Prefix used when displaying prices')}
                        control={
                          <FormControl>
                            <Input
                              className='w-32'
                              type='text'
                              value={field.value ?? ''}
                              onChange={field.onChange}
                              name={field.name}
                              onBlur={field.onBlur}
                              ref={field.ref}
                              maxLength={8}
                              placeholder={t('e.g. ¥ or HK$')}
                            />
                          </FormControl>
                        }
                      />
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='general_setting.custom_currency_exchange_rate'
                    render={({ field }) => (
                      <SettingRowFormItem
                        label={t('Units per USD')}
                        description={t(
                          'Conversion rate from USD to your custom currency'
                        )}
                        control={
                          <FormControl>
                            <Input
                              className='w-44'
                              type='number'
                              step='0.01'
                              value={field.value ?? ''}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value === ''
                                    ? undefined
                                    : e.target.valueAsNumber
                                )
                              }
                              name={field.name}
                              onBlur={field.onBlur}
                              ref={field.ref}
                              placeholder={t('e.g. 8 means 1 USD = 8 units')}
                            />
                          </FormControl>
                        }
                      />
                    )}
                  />
                </>
              )}

              {showDisplayInCurrencyOption && (
                <FormField
                  control={form.control}
                  name='DisplayInCurrencyEnabled'
                  render={({ field }) => (
                    <SettingRowFormItem
                      label={t('Display in Currency')}
                      description={
                        displayType === 'TOKENS'
                          ? t(
                              'Tokens-only mode will show raw quota values regardless of this toggle.'
                            )
                          : t('Show prices in currency instead of quota.')
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
              )}

              <FormField
                control={form.control}
                name='DisplayTokenStatEnabled'
                render={({ field }) => (
                  <SettingRowFormItem
                    label={t('Display Token Statistics')}
                    description={t('Show token usage statistics in the UI')}
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
