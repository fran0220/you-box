import { useEffect, useState } from 'react'
import { useForm, type SubmitErrorHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { KeyRound, Link2, Pencil, UserCog } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { getCurrencyDisplay, getCurrencyLabel } from '@/lib/currency'
import { formatQuota, parseQuotaFromDollars } from '@/lib/format'
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
import { Label } from '@/components/ui/label'
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
import { createUser, updateUser, getUser, getGroups } from '../api'
import { BINDING_FIELDS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants'
import {
  userFormSchema,
  type UserFormValues,
  USER_FORM_DEFAULT_VALUES,
  transformFormDataToPayload,
  transformUserToFormDefaults,
} from '../lib'
import { type User } from '../types'
import { UserQuotaDialog } from './user-quota-dialog'
import { useUsers } from './users-provider'

type UsersMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: User
}

export function UsersMutateDrawer({
  open,
  onOpenChange,
  currentRow,
}: UsersMutateDrawerProps) {
  const { t } = useTranslation()
  const isUpdate = !!currentRow
  const { triggerRefresh } = useUsers()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [quotaDialogOpen, setQuotaDialogOpen] = useState(false)

  // Fetch groups
  const { data: groupsData } = useQuery({
    queryKey: ['groups'],
    queryFn: getGroups,
    staleTime: 5 * 60 * 1000,
  })

  const groups = groupsData?.data || []

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: USER_FORM_DEFAULT_VALUES,
  })

  // Load existing data when updating
  useEffect(() => {
    if (open && isUpdate && currentRow) {
      // For update, fetch fresh data
      getUser(currentRow.id).then((result) => {
        if (result.success && result.data) {
          form.reset(transformUserToFormDefaults(result.data))
        }
      })
    } else if (open && !isUpdate) {
      // For create, reset to defaults
      form.reset(USER_FORM_DEFAULT_VALUES)
    }
  }, [open, isUpdate, currentRow, form])

  const { meta: currencyMeta } = getCurrencyDisplay()
  const currencyLabel = getCurrencyLabel()
  const tokensOnly = currencyMeta.kind === 'tokens'

  const currentQuotaRaw = form.watch('quota_dollars') || 0

  const onSubmit = async (data: UserFormValues) => {
    // On create, a password is optional (admin may pre-provision OAuth-only
    // accounts). Only enforce length when one is actually entered; the backend
    // rejects with a clear message if it genuinely requires a password.
    if (!isUpdate && data.password) {
      const passwordLength = data.password.length
      if (passwordLength < 8 || passwordLength > 20) {
        form.setError('password', {
          type: 'manual',
          message: t('Password must be between 8 and 20 characters'),
        })
        return
      }
    }

    setIsSubmitting(true)
    try {
      const payload = transformFormDataToPayload(data, currentRow?.id)
      const result = isUpdate
        ? await updateUser(payload as typeof payload & { id: number })
        : await createUser(payload)

      if (result.success) {
        toast.success(
          isUpdate
            ? t(SUCCESS_MESSAGES.USER_UPDATED)
            : t(SUCCESS_MESSAGES.USER_CREATED)
        )
        onOpenChange(false)
        triggerRefresh()
      } else {
        toast.error(
          result.message ||
            (isUpdate
              ? t(ERROR_MESSAGES.UPDATE_FAILED)
              : t(ERROR_MESSAGES.CREATE_FAILED))
        )
      }
    } catch (_error) {
      toast.error(t(ERROR_MESSAGES.UNEXPECTED))
    } finally {
      setIsSubmitting(false)
    }
  }

  // Validation contract: toast on invalid submit. The shared <Form>'s
  // FormValidationFocus already scrolls the first invalid FormItem into view
  // and focuses it on each failed submit; this drawer has no collapsible
  // sections, so no auto-expand is needed.
  const onInvalid: SubmitErrorHandler<UserFormValues> = () => {
    toast.error(t('Please fix the highlighted fields'))
  }

  const refreshUserData = async () => {
    if (!currentRow) return
    const result = await getUser(currentRow.id)
    if (result.success && result.data) {
      form.reset(transformUserToFormDefaults(result.data))
    }
    triggerRefresh()
  }

  const headerTitle = isUpdate
    ? `${t('Update')} ${t('User')}`
    : `${t('Create')} ${t('User')}`
  const headerDescription = isUpdate
    ? t('Update the user by providing necessary info.')
    : t('Add a new user by providing necessary info.')

  // Wrapped open handler: on close, reset the form so a reopened drawer starts
  // clean. Shared by the shell (overlay/ESC/X) and the footer Cancel so all
  // dismissal paths reset identically (matching the legacy SheetClose).
  const handleOpenChange = (v: boolean) => {
    onOpenChange(v)
    if (!v) {
      form.reset()
    }
  }

  return (
    <>
      <DrawerShell
        open={open}
        onOpenChange={handleOpenChange}
        size='md'
        ariaTitle={headerTitle}
        ariaDescription={headerDescription}
      >
        <DrawerHeader
          title={headerTitle}
          description={headerDescription}
          icon={<UserCog className='size-4' />}
        />
        <Form {...form}>
          <DrawerBody
            asForm
            formProps={{
              id: 'user-form',
              onSubmit: form.handleSubmit(onSubmit, onInvalid),
            }}
          >
            {/* Basic Information */}
            <DrawerSection variant='divider'>
              <DrawerSectionHeader
                title={t('Basic Information')}
                icon={<UserCog className='size-4' />}
              />
              <FormField
                control={form.control}
                name='username'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('Username')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('Enter username')}
                        disabled={isUpdate}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!isUpdate && (
                <FormField
                  control={form.control}
                  name='role'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('Role')}</FormLabel>
                      <Select
                        items={[
                          { value: '1', label: t('Common User') },
                          { value: '10', label: t('Admin') },
                        ]}
                        onValueChange={(value) =>
                          value !== null && field.onChange(parseInt(value))
                        }
                        value={String(field.value)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('Select a role')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent alignItemWithTrigger={false}>
                          <SelectGroup>
                            <SelectItem value='1'>
                              {t('Common User')}
                            </SelectItem>
                            <SelectItem value='10'>{t('Admin')}</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {t("Set the user's role (cannot be Root)")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name='display_name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('Display Name')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('Enter display name')}
                      />
                    </FormControl>
                    <FormDescription>
                      {t('Leave empty to use username')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('Password')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type='password'
                        placeholder={
                          isUpdate
                            ? t('Leave empty to keep unchanged')
                            : t('Enter password (min 8 characters)')
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </DrawerSection>

            {/* Group & Quota Settings (Update only) */}
            {isUpdate && (
              <DrawerSection variant='divider'>
                <DrawerSectionHeader
                  title={t('Group & Quota')}
                  icon={<KeyRound className='size-4' />}
                />
                <FormField
                  control={form.control}
                  name='group'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('Group')}</FormLabel>
                      <Select
                        items={[
                          ...groups.map((group) => ({
                            value: group,
                            label: group,
                          })),
                        ]}
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('Select a group')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent alignItemWithTrigger={false}>
                          <SelectGroup>
                            {groups.map((group) => (
                              <SelectItem key={group} value={group}>
                                {group}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
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
                        {t('Remaining Quota ({{currency}})', {
                          currency: currencyLabel,
                        })}
                      </FormLabel>
                      <div className='flex gap-2'>
                        <FormControl>
                          <Input
                            value={
                              tokensOnly
                                ? String(field.value || 0)
                                : (field.value || 0).toFixed(6)
                            }
                            readOnly
                            className='flex-1'
                          />
                        </FormControl>
                        <Button
                          type='button'
                          variant='outline'
                          onClick={() => setQuotaDialogOpen(true)}
                        >
                          <Pencil className='mr-1 h-4 w-4' />
                          {t('Adjust Quota')}
                        </Button>
                      </div>
                      <FormDescription>
                        {formatQuota(parseQuotaFromDollars(field.value || 0))}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='remark'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('Remark')}</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder={t(
                            'Admin notes (only visible to admins)'
                          )}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </DrawerSection>
            )}

            {/* Binding Information (Read-only) */}
            {isUpdate && (
              <DrawerSection variant='divider'>
                <DrawerSectionHeader
                  title={t('Binding Information')}
                  description={t(
                    'Third-party account bindings (read-only, managed by user in profile settings)'
                  )}
                  icon={<Link2 className='size-4' />}
                />
                <div className='flex flex-col gap-3'>
                  {BINDING_FIELDS.map(({ key, label }) => (
                    <div key={key}>
                      <Label className='text-muted-foreground text-xs'>
                        {t(label)}
                      </Label>
                      <Input
                        value={
                          (currentRow?.[key as keyof User] as string) || '-'
                        }
                        disabled
                        className='mt-1'
                      />
                    </div>
                  ))}
                </div>
              </DrawerSection>
            )}
          </DrawerBody>
        </Form>
        <DrawerFooter
          isSubmitting={isSubmitting}
          submitLabel={t('Save changes')}
          submittingLabel={t('Saving...')}
          onCancel={() => handleOpenChange(false)}
          cancelLabel={t('Close')}
          formId='user-form'
        />
      </DrawerShell>

      {/* Adjust Quota Dialog */}
      {currentRow && (
        <UserQuotaDialog
          open={quotaDialogOpen}
          onOpenChange={setQuotaDialogOpen}
          userId={currentRow.id}
          currentQuota={parseQuotaFromDollars(currentQuotaRaw || 0)}
          onSuccess={refreshUserData}
        />
      )}
    </>
  )
}
