import { useEffect, useState } from 'react'
import { useForm, type SubmitErrorHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { Layers } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
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
import { Textarea } from '@/components/ui/textarea'
import {
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerSection,
  DrawerSectionHeader,
  DrawerShell,
} from '@/components/drawer-layout'
import { JsonEditor } from '@/components/json-editor'
import { StatusBadge } from '@/components/status-badge'
import { TagInput } from '@/components/tag-input'
import { createPrefillGroup, updatePrefillGroup } from '../../api'
import { ENDPOINT_TEMPLATES } from '../../constants'
import { prefillGroupsQueryKeys } from '../../lib'
import {
  prefillGroupFormSchema,
  type PrefillGroup,
  type PrefillGroupFormValues,
} from '../../types'
import {
  DEFAULT_FORM_VALUES,
  PREFILL_GROUP_TYPE_META,
  PREFILL_GROUP_TYPES,
  type PrefillGroupType,
  parseStringItems,
  serializeEndpointItems,
} from '../prefill-group-shared'

type PrefillGroupFormDrawerProps = {
  open: boolean
  onClose: () => void
  currentGroup: PrefillGroup | null
}

export function PrefillGroupFormDrawer({
  open,
  onClose,
  currentGroup,
}: PrefillGroupFormDrawerProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const isEdit = Boolean(currentGroup?.id)
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<PrefillGroupFormValues>({
    resolver: zodResolver(prefillGroupFormSchema),
    defaultValues: DEFAULT_FORM_VALUES,
  })

  const selectedType = form.watch('type')

  useEffect(() => {
    if (open) {
      if (isEdit && currentGroup) {
        form.reset({
          id: currentGroup.id,
          name: currentGroup.name,
          description: currentGroup.description || '',
          type: currentGroup.type,
          items:
            currentGroup.type === 'endpoint'
              ? serializeEndpointItems(currentGroup.items)
              : parseStringItems(currentGroup.items),
        })
      } else {
        form.reset(DEFAULT_FORM_VALUES)
      }
    }
  }, [open, isEdit, currentGroup, form])

  useEffect(() => {
    const currentItems = form.getValues('items')
    if (selectedType === 'endpoint' && Array.isArray(currentItems)) {
      form.setValue('items', '', { shouldValidate: false })
    } else if (
      selectedType !== 'endpoint' &&
      typeof currentItems === 'string'
    ) {
      form.setValue('items', [], { shouldValidate: false })
    }
  }, [selectedType, form])

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      onClose()
    }
  }

  const handleSubmit = async (values: PrefillGroupFormValues) => {
    setIsSaving(true)
    const payload = {
      name: values.name.trim(),
      type: values.type,
      description: values.description?.trim() || '',
      items:
        values.type === 'endpoint'
          ? typeof values.items === 'string'
            ? values.items
            : ''
          : Array.isArray(values.items)
            ? values.items
            : [],
    }

    try {
      const response = isEdit
        ? await updatePrefillGroup({
            id: currentGroup!.id,
            ...payload,
          })
        : await createPrefillGroup(payload)

      if (response.success) {
        toast.success(
          isEdit ? 'Prefill group updated' : 'Prefill group created'
        )
        queryClient.invalidateQueries({
          queryKey: prefillGroupsQueryKeys.lists(),
        })
        onClose()
      } else {
        toast.error(response.message || t('Operation failed'))
      }
    } catch (err: unknown) {
      toast.error((err as Error)?.message || t('Operation failed'))
    } finally {
      setIsSaving(false)
    }
  }

  const onInvalid: SubmitErrorHandler<PrefillGroupFormValues> = () => {
    toast.error(t('Please fix the highlighted fields before saving'))
  }

  const meta =
    PREFILL_GROUP_TYPE_META[selectedType] || PREFILL_GROUP_TYPE_META.model

  const drawerTitle = isEdit
    ? t('Edit Prefill Group')
    : t('Create Prefill Group')
  const drawerDescription = isEdit
    ? t('Update the reusable bundle below.')
    : t('Capture a reusable bundle of models, tags, or endpoints.')

  return (
    <DrawerShell
      open={open}
      onOpenChange={handleOpenChange}
      size='lg'
      ariaTitle={drawerTitle}
      ariaDescription={drawerDescription}
    >
      <DrawerHeader
        title={drawerTitle}
        description={drawerDescription}
        icon={<Layers className='size-4' />}
      />

      <Form {...form}>
        <DrawerBody
          asForm
          formProps={{
            id: 'prefill-group-form',
            onSubmit: form.handleSubmit(handleSubmit, onInvalid),
          }}
        >
          <DrawerSection variant='card'>
            <DrawerSectionHeader
              title={t('Group details')}
              description={t(
                'Give the group a recognizable name and optional description.'
              )}
            />

            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Group Name')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('Premium chat models')} {...field} />
                  </FormControl>
                  <FormDescription>
                    {t('Give this group a recognizable name.')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Description')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t(
                        'Optional notes about when to use this group'
                      )}
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {t('Make it easier for teammates to pick the right group.')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </DrawerSection>

          <DrawerSection variant='card'>
            <DrawerSectionHeader
              title={t('Configuration')}
              description={t(
                'Choose the bundle type and define the items inside it.'
              )}
            />

            <FormField
              control={form.control}
              name='type'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group Type</FormLabel>
                  <Select
                    items={[
                      ...PREFILL_GROUP_TYPES.map((type) => ({
                        value: type.value,
                        label: (
                          <div className='flex flex-col text-left'>
                            <span className='font-medium'>{type.label}</span>
                            <span
                              data-prefill-description
                              className='text-muted-foreground text-xs'
                            >
                              {type.description}
                            </span>
                          </div>
                        ),
                      })),
                    ]}
                    value={field.value}
                    onValueChange={(value) =>
                      value !== null &&
                      field.onChange(value as PrefillGroupType)
                    }
                  >
                    <FormControl>
                      <SelectTrigger className='[&_[data-slot=select-value]_[data-prefill-description]]:hidden'>
                        <SelectValue placeholder={t('Select a group type')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent alignItemWithTrigger={false}>
                      <SelectGroup>
                        {PREFILL_GROUP_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className='flex flex-col text-left'>
                              <span className='font-medium'>{type.label}</span>
                              <span
                                data-prefill-description
                                className='text-muted-foreground text-xs'
                              >
                                {type.description}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {t('Determines how this group is applied elsewhere.')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='border-border/60 flex flex-col gap-3 border-y py-4'>
              <div className='flex items-center gap-2'>
                <h4 className='text-sm font-medium'>{t('Project')}</h4>
                <StatusBadge
                  label={meta.label}
                  variant={meta.badge}
                  size='sm'
                  copyable={false}
                />
              </div>
              <FormField
                control={form.control}
                name='items'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='sr-only'>{t('Items')}</FormLabel>
                    <FormControl>
                      {selectedType === 'endpoint' ? (
                        <JsonEditor
                          value={(field.value as string) || ''}
                          onChange={field.onChange}
                          keyPlaceholder='provider'
                          valuePlaceholder='{"path": "/v1/...","method": "POST"}'
                          keyLabel={t('Provider')}
                          valueLabel={t('Endpoint config')}
                          valueType='any'
                          template={ENDPOINT_TEMPLATES}
                          emptyMessage={t(
                            'Define endpoint mappings for each provider.'
                          )}
                        />
                      ) : (
                        <TagInput
                          value={Array.isArray(field.value) ? field.value : []}
                          onChange={field.onChange}
                          placeholder={t('Enter a value and press Enter')}
                        />
                      )}
                    </FormControl>
                    <FormDescription>
                      {selectedType === 'endpoint'
                        ? t(
                            'Provide a JSON object where each key maps to an endpoint definition.'
                          )
                        : t('Add each model or tag you want to include.')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </DrawerSection>
        </DrawerBody>
      </Form>

      <DrawerFooter
        isSubmitting={isSaving}
        submitLabel={isEdit ? t('Save changes') : t('Create')}
        submittingLabel={t('Saving...')}
        onCancel={onClose}
        cancelLabel={t('Cancel')}
        formId='prefill-group-form'
      />
    </DrawerShell>
  )
}
