import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Copy, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { getCurrencyDisplay, getCurrencyLabel } from '@/lib/currency'
import { addTimeToDate } from '@/lib/time'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { DateTimePicker } from '@/components/datetime-picker'
import {
  InlineAlert,
  MonoInput,
  Panel,
  PanelBody,
  PanelHeader,
} from '@/components/patterns'
import { createRedemption } from '../api'
import { REDEMPTION_VALIDATION, SUCCESS_MESSAGES } from '../constants'
import {
  REDEMPTION_FORM_DEFAULT_VALUES,
  getRedemptionFormSchema,
  transformFormDataToPayload,
  type RedemptionFormValues,
} from '../lib'
import { useRedemptions } from './redemptions-provider'

/**
 * Generator card (r2-B9 §1): the always-visible left-column Panel that
 * replaces the create branch of the mutate drawer. Reuses the drawer's
 * schema, USD→quota conversion and expiry quick-sets. The design's
 * "Max uses per code" field is intentionally absent — codes are
 * single-use on the backend (r2-B9 §1 adaptation note).
 */
export function GeneratorCard() {
  const { t } = useTranslation()
  const { triggerRefresh } = useRedemptions()
  const { copyToClipboard } = useCopyToClipboard()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [generatedKeys, setGeneratedKeys] = useState<string[] | null>(null)

  const form = useForm<RedemptionFormValues>({
    resolver: zodResolver(getRedemptionFormSchema(t)),
    defaultValues: REDEMPTION_FORM_DEFAULT_VALUES,
  })

  const count = form.watch('count') || 1

  const { meta: currencyMeta } = getCurrencyDisplay()
  const currencyLabel = getCurrencyLabel()
  const tokensOnly = currencyMeta.kind === 'tokens'
  const currencySymbol = tokensOnly ? undefined : currencyMeta.symbol

  const onSubmit = async (data: RedemptionFormValues) => {
    setIsSubmitting(true)
    try {
      const result = await createRedemption(transformFormDataToPayload(data))
      if (result.success) {
        const keys = result.data || []
        setGeneratedKeys(keys)
        toast.success(
          keys.length > 1
            ? t('Successfully created {{count}} redemption codes', {
                count: keys.length,
              })
            : t(SUCCESS_MESSAGES.REDEMPTION_CREATED)
        )
        triggerRefresh()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSetExpiry = (months: number, days: number, hours: number) => {
    const newDate = addTimeToDate(months, days, hours)
    form.setValue('expired_time', newDate)
  }

  const handleCopyAll = () => {
    if (generatedKeys?.length) {
      copyToClipboard(generatedKeys.join('\n'))
    }
  }

  return (
    <Panel>
      <PanelHeader title={t('Generate codes')} />
      <PanelBody className='space-y-4'>
        <Form {...form}>
          <form
            id='redemption-generator-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Name')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      maxLength={REDEMPTION_VALIDATION.NAME_MAX_LENGTH}
                      placeholder={t('Enter a name')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='quota_dollars'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('Value ({{currency}})', { currency: currencyLabel })}
                  </FormLabel>
                  <FormControl>
                    <MonoInput
                      {...field}
                      prefix={currencySymbol}
                      suffix={tokensOnly ? currencyLabel : undefined}
                      type='number'
                      step={tokensOnly ? 1 : 0.01}
                      min={0}
                      placeholder={
                        tokensOnly
                          ? t('Enter quota in tokens')
                          : t('Enter quota in {{currency}}', {
                              currency: currencyLabel,
                            })
                      }
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='count'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Quantity')}</FormLabel>
                  <FormControl>
                    <MonoInput
                      {...field}
                      type='number'
                      min={REDEMPTION_VALIDATION.COUNT_MIN}
                      max={REDEMPTION_VALIDATION.COUNT_MAX}
                      placeholder={t('Number of codes to create')}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value, 10) || 1)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='expired_time'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Expires')}</FormLabel>
                  <div className='flex flex-col gap-2'>
                    <FormControl>
                      <DateTimePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={t('Never expires')}
                      />
                    </FormControl>
                    <div className='grid grid-cols-4 gap-1.5'>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => handleSetExpiry(0, 0, 0)}
                      >
                        {t('Never')}
                      </Button>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => handleSetExpiry(1, 0, 0)}
                      >
                        {t('1M')}
                      </Button>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => handleSetExpiry(0, 7, 0)}
                      >
                        {t('1W')}
                      </Button>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => handleSetExpiry(0, 1, 0)}
                      >
                        {t('1 Day')}
                      </Button>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type='submit' className='w-full' disabled={isSubmitting}>
              {isSubmitting
                ? t('Generating...')
                : t('Generate {{count}} codes', { count })}
            </Button>
          </form>
        </Form>

        {generatedKeys != null && (
          <InlineAlert
            tone='success'
            title={t('Codes generated')}
            actions={
              <>
                <Button
                  type='button'
                  size='sm'
                  variant='outline'
                  onClick={handleCopyAll}
                >
                  <Copy className='size-3.5' />
                  {t('Copy All')}
                </Button>
                <Button
                  type='button'
                  size='icon-xs'
                  variant='ghost'
                  aria-label={t('Dismiss')}
                  onClick={() => setGeneratedKeys(null)}
                >
                  <X className='size-4' />
                </Button>
              </>
            }
          >
            <div className='mt-1 max-h-36 space-y-0.5 overflow-auto font-mono text-xs break-all'>
              {generatedKeys.map((key) => (
                <div key={key}>{key}</div>
              ))}
            </div>
          </InlineAlert>
        )}

        <p className='text-muted text-xs'>
          {t('Codes are shown once after generation. Copy them now.')}
        </p>
      </PanelBody>
    </Panel>
  )
}
