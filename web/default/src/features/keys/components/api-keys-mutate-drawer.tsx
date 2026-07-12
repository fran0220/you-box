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
import { useEffect, useRef, useState } from 'react'
import { useForm, type SubmitErrorHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown, KeyRound, Settings2, WalletCards } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { getUserModels, getUserGroups } from '@/lib/api'
import { getCurrencyDisplay, getCurrencyLabel } from '@/lib/currency'
import { cn } from '@/lib/utils'
import { useStatus } from '@/hooks/use-status'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { DateTimePicker } from '@/components/datetime-picker'
import {
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerSection,
  DrawerSectionHeader,
  DrawerShell,
  DrawerSwitchGroup,
  DrawerSwitchRow,
} from '@/components/drawer-layout'
import { MultiSelect } from '@/components/multi-select'
import { createApiKey, updateApiKey, getApiKey, getApiKeys } from '../api'
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants'
import {
  getApiKeyFormSchema,
  type ApiKeyFormValues,
  getApiKeyFormDefaultValues,
  transformFormDataToPayload,
  transformApiKeyToFormDefaults,
} from '../lib'
import { type ApiKey } from '../types'
import {
  ApiKeyGroupCombobox,
  type ApiKeyGroupOption,
} from './api-key-group-combobox'
import { useApiKeys } from './api-keys-provider'

const FORM_ID = 'api-key-form'

// Fields that live inside the collapsed Advanced Settings section. When one of
// these fails validation we must auto-expand the collapsible before the error
// FormItem can be scrolled into view (B-spec validation contract).
const ADVANCED_FIELDS: ReadonlyArray<keyof ApiKeyFormValues> = [
  'model_limits',
  'allow_ips',
]

type ApiKeyMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: ApiKey
}

export function ApiKeysMutateDrawer({
  open,
  onOpenChange,
  currentRow,
}: ApiKeyMutateDrawerProps) {
  const { t } = useTranslation()
  const isUpdate = !!currentRow
  const { triggerRefresh, resolveRealKey, setLastCreatedKey } = useApiKeys()
  const { status } = useStatus()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const defaultUseAutoGroup = status?.default_use_auto_group === true

  // Fetch models
  const { data: modelsData } = useQuery({
    queryKey: ['user-models'],
    queryFn: getUserModels,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })

  // Fetch groups
  const { data: groupsData } = useQuery({
    queryKey: ['user-groups'],
    queryFn: getUserGroups,
    staleTime: 5 * 60 * 1000,
  })

  const models = modelsData?.data || []
  const groupsRaw = groupsData?.data || {}
  const groups: ApiKeyGroupOption[] = Object.entries(groupsRaw).map(
    ([key, info]) => ({
      value: key,
      label: key,
      desc: info.desc || key,
      ratio: info.ratio,
    })
  )
  const backendHasAuto = groups.some((g) => g.value === 'auto')
  const schema = getApiKeyFormSchema(t)

  const form = useForm<ApiKeyFormValues>({
    resolver: zodResolver(schema),
    defaultValues: getApiKeyFormDefaultValues(defaultUseAutoGroup),
  })

  // Snapshot of the freshly-fetched key being edited, so the submit transform
  // can preserve the live remaining quota of a recurring key (avoids refunding
  // spent quota on unrelated edits).
  const originalKeyRef = useRef<ApiKey | null>(null)

  // Load existing data when updating
  useEffect(() => {
    if (open && isUpdate && currentRow) {
      getApiKey(currentRow.id).then((result) => {
        if (result.success && result.data) {
          originalKeyRef.current = result.data
          form.reset(transformApiKeyToFormDefaults(result.data))
        }
      })
    } else if (open && !isUpdate) {
      originalKeyRef.current = null
      form.reset(
        getApiKeyFormDefaultValues(defaultUseAutoGroup && backendHasAuto)
      )
    }
  }, [open, isUpdate, currentRow, form, defaultUseAutoGroup, backendHasAuto])

  // Correct group after groups load: if the form value is not in available groups, fall back
  useEffect(() => {
    if (groups.length === 0) return
    const currentGroup = form.getValues('group')
    if (currentGroup && !groups.some((g) => g.value === currentGroup)) {
      const fallback =
        groups.find((g) => g.value === 'default')?.value ??
        groups[0]?.value ??
        ''
      form.setValue('group', fallback)
      if (currentGroup === 'auto') {
        form.setValue('cross_group_retry', false)
      }
    }
  }, [groups, form])

  const onSubmit = async (data: ApiKeyFormValues) => {
    setIsSubmitting(true)
    try {
      const basePayload = transformFormDataToPayload(
        data,
        isUpdate ? (originalKeyRef.current ?? undefined) : undefined
      )

      if (isUpdate && currentRow) {
        const result = await updateApiKey({
          ...basePayload,
          id: currentRow.id,
        })
        if (result.success) {
          toast.success(t(SUCCESS_MESSAGES.API_KEY_UPDATED))
          onOpenChange(false)
          triggerRefresh()
        } else {
          toast.error(result.message || t(ERROR_MESSAGES.UPDATE_FAILED))
        }
      } else {
        // Create mode - handle batch creation
        const count = data.tokenCount || 1
        let successCount = 0

        for (let i = 0; i < count; i++) {
          const result = await createApiKey({
            ...basePayload,
            name:
              i === 0 && data.name
                ? data.name
                : `${data.name || 'default'}-${Math.random().toString(36).slice(2, 8)}`,
          })
          if (result.success) {
            successCount++
          } else {
            toast.error(result.message || t(ERROR_MESSAGES.CREATE_FAILED))
            break
          }
        }

        if (successCount > 0) {
          toast.success(
            t('Successfully created {{count}} API Key(s)', {
              count: successCount,
            })
          )
          onOpenChange(false)
          triggerRefresh()

          // One-time key reveal (r2-B2 section 3): the create endpoint does
          // not return the generated key (backend AddToken responds with
          // success only), so resolve the newest token — the list is ordered
          // id desc — and fetch its full key for the inline alert. Batch
          // creation (count > 1) skips the single-key reveal.
          if (successCount === 1) {
            void (async () => {
              try {
                const listRes = await getApiKeys({ p: 1, size: 1 })
                const newest = listRes.data?.items?.[0]
                if (!newest) return
                const fullKey = await resolveRealKey(newest.id)
                if (fullKey) {
                  setLastCreatedKey({ name: newest.name, key: fullKey })
                }
              } catch {
                // Non-fatal: the key remains copyable from the table row.
              }
            })()
          }
        }
      }
    } catch (_error) {
      toast.error(t(ERROR_MESSAGES.UNEXPECTED))
    } finally {
      setIsSubmitting(false)
    }
  }

  const onInvalid: SubmitErrorHandler<ApiKeyFormValues> = (errors) => {
    toast.error(t('Please fix the highlighted fields before saving'))

    const errorFields = Object.keys(errors) as Array<keyof ApiKeyFormValues>
    // Auto-expand the Advanced Settings collapsible when it holds an error, so
    // the offending field is visible before we scroll it into view.
    if (errorFields.some((name) => ADVANCED_FIELDS.includes(name))) {
      setAdvancedOpen(true)
    }

    // Scroll the first invalid field into view. Defer to the next frame so a
    // just-expanded collapsible has rendered its content.
    const firstField = errorFields[0]
    if (firstField) {
      requestAnimationFrame(() => {
        const el = document.querySelector(`[name="${firstField}"]`)
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        if (el instanceof HTMLElement) {
          el.focus({ preventScroll: true })
        }
      })
    }
  }

  const handleSetExpiry = (months: number, days: number, hours: number) => {
    if (months === 0 && days === 0 && hours === 0) {
      form.setValue('expired_time', undefined)
      return
    }

    const now = new Date()
    now.setMonth(now.getMonth() + months)
    now.setDate(now.getDate() + days)
    now.setHours(now.getHours() + hours)

    form.setValue('expired_time', now)
  }

  const { meta: currencyMeta } = getCurrencyDisplay()
  const currencyLabel = getCurrencyLabel()
  const tokensOnly = currencyMeta.kind === 'tokens'
  const quotaLabel = t('Quota ({{currency}})', { currency: currencyLabel })
  const quotaPlaceholder = tokensOnly
    ? t('Enter quota in tokens')
    : t('Enter quota in {{currency}}', { currency: currencyLabel })
  const selectedGroup = form.watch('group')
  const unlimitedQuota = form.watch('unlimited_quota')

  // Close handler shared by the shell's dismissal paths (overlay/ESC/close
  // button) and the footer Cancel, so the form is always reset on close
  // (matches the legacy Sheet `onOpenChange` reset behavior).
  const handleOpenChange = (v: boolean) => {
    onOpenChange(v)
    if (!v) {
      form.reset()
    }
  }

  return (
    <DrawerShell
      open={open}
      onOpenChange={handleOpenChange}
      size='md'
      ariaTitle={isUpdate ? t('Update API Key') : t('Create API Key')}
      ariaDescription={
        isUpdate
          ? t('Update the API key by providing necessary info.')
          : t('Add a new API key by providing necessary info.')
      }
    >
      <DrawerHeader
        title={isUpdate ? t('Update API Key') : t('Create API Key')}
        description={
          isUpdate
            ? t('Update the API key by providing necessary info.')
            : t('Add a new API key by providing necessary info.')
        }
        icon={<KeyRound className='size-4' />}
      />
      <Form {...form}>
        <DrawerBody
          asForm
          formProps={{
            id: FORM_ID,
            onSubmit: form.handleSubmit(onSubmit, onInvalid),
          }}
        >
          <DrawerSection variant='divider'>
            <DrawerSectionHeader
              title={t('Basic Information')}
              description={t('Set API key basic information')}
              icon={<KeyRound className='size-4' />}
            />
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Name')}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t('Enter a name')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='group'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Group')}</FormLabel>
                  <FormControl>
                    <ApiKeyGroupCombobox
                      options={groups}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder={t('Select a group')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedGroup === 'auto' && (
              <FormField
                control={form.control}
                name='cross_group_retry'
                render={({ field }) => (
                  <FormItem>
                    <DrawerSwitchGroup>
                      <DrawerSwitchRow
                        label={t('Cross-group retry')}
                        description={t(
                          'When enabled, if channels in the current group fail, it will try channels in the next group in order.'
                        )}
                        control={
                          <FormControl>
                            <Switch
                              checked={!!field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        }
                      />
                    </DrawerSwitchGroup>
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name='expired_time'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Expiration Time')}</FormLabel>
                  <div className='grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center'>
                    <FormControl>
                      <DateTimePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={t('Never expires')}
                        className='min-w-0 [&_input[type=time]]:w-24 sm:[&_input[type=time]]:w-32'
                      />
                    </FormControl>
                    <div className='flex flex-wrap gap-2'>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        className='px-2 text-xs sm:px-3 sm:text-sm'
                        onClick={() => handleSetExpiry(0, 0, 0)}
                      >
                        {t('Never')}
                      </Button>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        className='px-2 text-xs sm:px-3 sm:text-sm'
                        onClick={() => handleSetExpiry(1, 0, 0)}
                      >
                        {t('1 Month')}
                      </Button>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        className='px-2 text-xs sm:px-3 sm:text-sm'
                        onClick={() => handleSetExpiry(0, 1, 0)}
                      >
                        {t('1 Day')}
                      </Button>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        className='px-2 text-xs sm:px-3 sm:text-sm'
                        onClick={() => handleSetExpiry(0, 0, 1)}
                      >
                        {t('1 Hour')}
                      </Button>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isUpdate && (
              <FormField
                control={form.control}
                name='tokenCount'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('Quantity')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type='number'
                        min='1'
                        placeholder={t('Number of keys to create')}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value, 10) || 1)
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      {t(
                        'Create multiple API keys at once (random suffix will be added to names)'
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </DrawerSection>

          <DrawerSection variant='divider'>
            <DrawerSectionHeader
              title={t('Quota Settings')}
              description={t('Set quota amount and limits')}
              icon={<WalletCards className='size-4' />}
            />
            {!unlimitedQuota && (
              <FormField
                control={form.control}
                name='remain_quota_dollars'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{quotaLabel}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type='number'
                        step={tokensOnly ? 1 : 0.01}
                        placeholder={quotaPlaceholder}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      {tokensOnly
                        ? t('Enter the quota amount in tokens')
                        : t('Enter the quota amount in {{currency}}', {
                            currency: currencyLabel,
                          })}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {!unlimitedQuota && (
              <FormField
                control={form.control}
                name='reset_period'
                render={({ field }) => {
                  const resetOptions = [
                    { value: 'none', label: t('No automatic reset') },
                    { value: 'daily', label: t('Every day') },
                    { value: 'weekly', label: t('Every week') },
                    { value: 'monthly', label: t('Every month') },
                  ]
                  const current =
                    resetOptions.find(
                      (o) => o.value === (field.value ?? 'none')
                    )?.label ?? resetOptions[0].label
                  return (
                    <FormItem>
                      <FormLabel>{t('Limit reset')}</FormLabel>
                      <Select
                        items={resetOptions}
                        value={field.value ?? 'none'}
                        onValueChange={(value) =>
                          field.onChange(value ?? 'none')
                        }
                      >
                        <FormControl>
                          <SelectTrigger className='w-full'>
                            <SelectValue>{current}</SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent alignItemWithTrigger={false}>
                          <SelectGroup>
                            {resetOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {t(
                          'Automatically refill the credit limit on this schedule.'
                        )}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />
            )}

            <FormField
              control={form.control}
              name='unlimited_quota'
              render={({ field }) => (
                <FormItem>
                  <DrawerSwitchGroup>
                    <DrawerSwitchRow
                      label={t('Unlimited Quota')}
                      description={t('Enable unlimited quota for this API key')}
                      control={
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      }
                    />
                  </DrawerSwitchGroup>
                </FormItem>
              )}
            />
          </DrawerSection>

          <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
            <DrawerSection variant='divider'>
              <CollapsibleTrigger
                render={
                  <button
                    type='button'
                    className='hover:bg-muted/40 flex w-full items-center gap-3 rounded-md py-1.5 text-left transition-colors'
                  />
                }
              >
                <DrawerSectionHeader
                  className='flex-1'
                  title={t('Advanced Settings')}
                  description={t('Set API key access restrictions')}
                  icon={<Settings2 className='size-4' />}
                />
                <ChevronDown
                  className={cn(
                    'text-muted-foreground size-4 shrink-0 transition-transform',
                    advancedOpen && 'rotate-180'
                  )}
                />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className='flex flex-col gap-4 pt-2'>
                  <FormField
                    control={form.control}
                    name='model_limits'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('Model Limits')}</FormLabel>
                        <FormControl>
                          <MultiSelect
                            options={models.map((m) => ({
                              label: m,
                              value: m,
                            }))}
                            selected={field.value}
                            onChange={field.onChange}
                            placeholder={t(
                              'Select models (empty for allow all)'
                            )}
                          />
                        </FormControl>
                        <FormDescription>
                          {t('Limit which models can be used with this key')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='allow_ips'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('IP Whitelist (supports CIDR)')}
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            className='min-h-20 resize-none'
                            placeholder={t(
                              'One IP per line (empty for no restriction)'
                            )}
                            rows={3}
                          />
                        </FormControl>
                        <FormDescription>
                          {t(
                            'Do not over-trust this feature. IP may be spoofed. Please use with nginx, CDN and other gateways.'
                          )}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CollapsibleContent>
            </DrawerSection>
          </Collapsible>
        </DrawerBody>
      </Form>
      <DrawerFooter
        isSubmitting={isSubmitting}
        submitLabel={t('Save changes')}
        submittingLabel={t('Saving...')}
        onCancel={() => handleOpenChange(false)}
        cancelLabel={t('Close')}
        formId={FORM_ID}
      />
    </DrawerShell>
  )
}
