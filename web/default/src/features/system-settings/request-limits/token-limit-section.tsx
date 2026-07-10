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

const tokenLimitSchema = z.object({
  maxUserTokens: z.number().int().min(1),
})

type TokenLimitFormValues = z.infer<typeof tokenLimitSchema>

type TokenLimitSectionProps = {
  defaultValues: {
    'token_setting.max_user_tokens': number
  }
}

export function TokenLimitSection({ defaultValues }: TokenLimitSectionProps) {
  const { t } = useTranslation()
  const updateOption = useUpdateOption()
  const { form, handleSubmit, handleReset, isDirty, isSubmitting } =
    useSettingsForm<TokenLimitFormValues>({
      resolver: zodResolver(tokenLimitSchema),
      mode: 'onChange',
      defaultValues: {
        maxUserTokens: defaultValues['token_setting.max_user_tokens'],
      },
      onSubmit: async (_data, changedFields) => {
        const value = changedFields.maxUserTokens
        if (typeof value === 'number') {
          await updateOption.mutateAsync({
            key: 'token_setting.max_user_tokens',
            value,
          })
        }
      },
    })

  return (
    <>
      <FormNavigationGuard when={isDirty} />
      <SettingsSection title={t('Token Limits')}>
        <Form {...form}>
          <SettingsForm onSubmit={handleSubmit}>
            <SettingsPageFormActions
              onSave={handleSubmit}
              onReset={handleReset}
              isSaving={isSubmitting || updateOption.isPending}
              isResetDisabled={!isDirty}
              saveLabel='Save token limits'
            />
            <FormDirtyIndicator isDirty={isDirty} />
            <SettingRowGroup>
              <FormField
                control={form.control}
                name='maxUserTokens'
                render={({ field }) => (
                  <SettingRowFormItem
                    label={t('Maximum API keys per user')}
                    description={t(
                      'Limits how many API keys each user may create. The default is 1000; very large limits can affect management performance.'
                    )}
                    control={
                      <FormControl>
                        <Input
                          className='w-28'
                          type='number'
                          min={1}
                          step={1}
                          {...safeNumberFieldProps(field)}
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
