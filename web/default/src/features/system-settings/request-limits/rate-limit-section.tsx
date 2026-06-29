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
import { useState } from 'react'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Code2, Palette } from 'lucide-react'
import { useTranslation } from 'react-i18next'
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
import { RateLimitVisualEditor } from './rate-limit-visual-editor'

const isValidJSON = (value: string | undefined) => {
  if (!value || value.trim() === '') return true
  try {
    const parsed = JSON.parse(value)
    if (typeof parsed !== 'object' || Array.isArray(parsed)) {
      return false
    }
    for (const [, val] of Object.entries(parsed)) {
      if (!Array.isArray(val) || val.length !== 2) return false
      if (typeof val[0] !== 'number' || typeof val[1] !== 'number') return false
      if (val[0] < 0 || val[1] < 1) return false
      if (val[0] > 2147483647 || val[1] > 2147483647) return false
    }
    return true
  } catch {
    return false
  }
}

const createRateLimitSchema = (t: (key: string) => string) =>
  z.object({
    ModelRequestRateLimitEnabled: z.boolean(),
    ModelRequestRateLimitDurationMinutes: z.number().min(0),
    ModelRequestRateLimitCount: z.number().min(0).max(100000000),
    ModelRequestRateLimitSuccessCount: z.number().min(1).max(100000000),
    ModelRequestRateLimitGroup: z
      .string()
      .optional()
      .refine(isValidJSON, {
        message: t('Invalid JSON format or values out of allowed range'),
      }),
  })

type RateLimitFormValues = z.infer<ReturnType<typeof createRateLimitSchema>>

type RateLimitSectionProps = {
  defaultValues: RateLimitFormValues
}

export function RateLimitSection({ defaultValues }: RateLimitSectionProps) {
  const { t } = useTranslation()
  const updateOption = useUpdateOption()
  const [useVisualEditor, setUseVisualEditor] = useState(true)

  const rateLimitSchema = createRateLimitSchema(t)

  const { form, handleSubmit, handleReset, isDirty, isSubmitting } =
    useSettingsForm<RateLimitFormValues>({
      resolver: zodResolver(rateLimitSchema),
      mode: 'onChange',
      defaultValues,
      onSubmit: async (_data, changedFields) => {
        for (const [key, value] of Object.entries(changedFields)) {
          await updateOption.mutateAsync({
            key,
            value: (value ?? '') as string | boolean | number,
          })
        }
      },
    })

  return (
    <>
      <FormNavigationGuard when={isDirty} />

      <SettingsSection title={t('Rate Limiting')}>
        <Form {...form}>
          <SettingsForm onSubmit={handleSubmit}>
            <SettingsPageFormActions
              onSave={handleSubmit}
              onReset={handleReset}
              isSaving={isSubmitting || updateOption.isPending}
              isResetDisabled={!isDirty}
              saveLabel='Save rate limits'
            />
            <FormDirtyIndicator isDirty={isDirty} />
          <SettingRowGroup>
            <FormField
              control={form.control}
              name='ModelRequestRateLimitEnabled'
              render={({ field }) => (
                <SettingRowFormItem
                  label={t('Enable rate limiting')}
                  description={t(
                    'This controls model request rate limiting. Web/API route throttling is configured by environment variables and may still return 429.'
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
              name='ModelRequestRateLimitDurationMinutes'
              render={({ field }) => (
                <SettingRowFormItem
                  label={t('Limit period')}
                  description={t('Time window for rate limiting')}
                  control={
                    <FormControl>
                      <div className='flex items-center gap-2'>
                        <Input
                          className='w-28'
                          type='number'
                          min={0}
                          step={1}
                          {...safeNumberFieldProps(field)}
                        />
                        <span className='text-muted-foreground text-sm'>
                          {t('minutes')}
                        </span>
                      </div>
                    </FormControl>
                  }
                />
              )}
            />

            <FormField
              control={form.control}
              name='ModelRequestRateLimitCount'
              render={({ field }) => (
                <SettingRowFormItem
                  label={t('Max requests per period')}
                  description={t('Including failed requests, 0 = unlimited')}
                  control={
                    <FormControl>
                      <div className='flex items-center gap-2'>
                        <Input
                          className='w-28'
                          type='number'
                          min={0}
                          max={100000000}
                          step={1}
                          {...safeNumberFieldProps(field)}
                        />
                        <span className='text-muted-foreground text-sm'>
                          {t('times')}
                        </span>
                      </div>
                    </FormControl>
                  }
                />
              )}
            />

            <FormField
              control={form.control}
              name='ModelRequestRateLimitSuccessCount'
              render={({ field }) => (
                <SettingRowFormItem
                  label={t('Max successful requests')}
                  description={t('Only successful requests')}
                  control={
                    <FormControl>
                      <div className='flex items-center gap-2'>
                        <Input
                          className='w-28'
                          type='number'
                          min={1}
                          max={100000000}
                          step={1}
                          {...safeNumberFieldProps(field)}
                        />
                        <span className='text-muted-foreground text-sm'>
                          {t('times')}
                        </span>
                      </div>
                    </FormControl>
                  }
                />
              )}
            />
          </SettingRowGroup>

          <FormField
            control={form.control}
            name='ModelRequestRateLimitGroup'
            render={({ field }) => (
              <FormItem>
                <div className='flex items-center justify-between'>
                  <FormLabel>{t('Group-based rate limits')}</FormLabel>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => setUseVisualEditor(!useVisualEditor)}
                  >
                    {useVisualEditor ? (
                      <>
                        <Code2 className='mr-2 h-4 w-4' />
                        {t('JSON Mode')}
                      </>
                    ) : (
                      <>
                        <Palette className='mr-2 h-4 w-4' />
                        {t('Visual Mode')}
                      </>
                    )}
                  </Button>
                </div>
                <FormControl>
                  {useVisualEditor ? (
                    <RateLimitVisualEditor
                      value={field.value || ''}
                      onChange={field.onChange}
                    />
                  ) : (
                    <Textarea
                      rows={8}
                      placeholder={`{\n  "default": [200, 100],\n  "vip": [0, 1000]\n}`}
                      className='font-mono text-sm'
                      {...field}
                    />
                  )}
                </FormControl>
                {!useVisualEditor && (
                  <FormDescription>
                    <div className='space-y-1 text-xs'>
                      <p className='font-semibold'>{t('Format:')}</p>
                      <ul className='list-inside list-disc space-y-0.5 pl-2'>
                        <li>
                          {t('JSON object:')}{' '}
                          {`{"groupName": [maxRequests, maxSuccess]}`}
                        </li>
                        <li>
                          {t('Example:')}{' '}
                          {`{"default": [200, 100], "vip": [0, 1000]}`}
                        </li>
                        <li>
                          {t(
                            'maxRequests ≥ 0, maxSuccess ≥ 1, both ≤ 2,147,483,647'
                          )}
                        </li>
                        <li>
                          {t(
                            'Group config overrides global limits, shares the same period'
                          )}
                        </li>
                      </ul>
                    </div>
                  </FormDescription>
                )}
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
