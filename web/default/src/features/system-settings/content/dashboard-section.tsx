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
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
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
import {
  SettingRowFormItem,
  SettingRowGroup,
  SettingsForm,
} from '../components/settings-form-layout'
import { SettingsPageFormActions } from '../components/settings-page-context'
import { SettingsSection } from '../components/settings-section'
import { useResetForm } from '../hooks/use-reset-form'
import { useUpdateOption } from '../hooks/use-update-option'
import { safeNumberFieldProps } from '../utils/numeric-field'

const dataDashboardSchema = z.object({
  DataExportEnabled: z.boolean(),
  DataExportInterval: z.number().int().min(1).max(1440),
  DataExportDefaultTime: z.enum(['hour', 'day', 'week']),
})

type DataDashboardFormValues = z.infer<typeof dataDashboardSchema>

type DashboardSectionProps = {
  defaultValues: DataDashboardFormValues
}

const granularityOptions = [
  { label: 'Hour', value: 'hour' },
  { label: 'Day', value: 'day' },
  { label: 'Week', value: 'week' },
]

export function DashboardSection({ defaultValues }: DashboardSectionProps) {
  const { t } = useTranslation()
  const updateOption = useUpdateOption()

  const form = useForm<DataDashboardFormValues>({
    resolver: zodResolver(dataDashboardSchema),
    defaultValues,
  })

  useResetForm(form, defaultValues)

  const onSubmit = async (values: DataDashboardFormValues) => {
    const updates = Object.entries(values).filter(
      ([key, value]) =>
        value !== defaultValues[key as keyof DataDashboardFormValues]
    )

    for (const [key, value] of updates) {
      await updateOption.mutateAsync({ key, value })
    }
  }

  const isEnabled = form.watch('DataExportEnabled')

  return (
    <SettingsSection title={t('Data Dashboard')}>
      <Form {...form}>
        <SettingsForm onSubmit={form.handleSubmit(onSubmit)}>
          <SettingsPageFormActions
            onSave={form.handleSubmit(onSubmit)}
            isSaving={updateOption.isPending}
          />
          <SettingRowGroup>
            <FormField
              control={form.control}
              name='DataExportEnabled'
              render={({ field }) => (
                <SettingRowFormItem
                  label={t('Enable Data Dashboard')}
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
              name='DataExportInterval'
              render={({ field }) => (
                <SettingRowFormItem
                  label={t('Refresh interval (minutes)')}
                  description={t(
                    'Keep this above 1 minute to avoid heavy database load'
                  )}
                  disabled={!isEnabled}
                  control={
                    <FormControl>
                      <Input
                        className='w-28'
                        type='number'
                        min={1}
                        max={1440}
                        step={1}
                        {...safeNumberFieldProps(field)}
                        disabled={!isEnabled}
                      />
                    </FormControl>
                  }
                />
              )}
            />

            <FormField
              control={form.control}
              name='DataExportDefaultTime'
              render={({ field }) => (
                <SettingRowFormItem
                  label={t('Default time granularity')}
                  description={t(
                    'UI granularity only — data is still aggregated hourly'
                  )}
                  disabled={!isEnabled}
                  control={
                    <Select
                      items={[
                        ...granularityOptions.map((option) => ({
                          value: option.value,
                          label: t(option.label),
                        })),
                      ]}
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!isEnabled}
                    >
                      <FormControl>
                        <SelectTrigger className='w-44'>
                          <SelectValue placeholder={t('Select granularity')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent alignItemWithTrigger={false}>
                        <SelectGroup>
                          {granularityOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {t(option.label)}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  }
                />
              )}
            />
          </SettingRowGroup>
        </SettingsForm>
      </Form>
    </SettingsSection>
  )
}
