import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ConfirmDialog } from '@/components/confirm-dialog'
import {
  DrawerBody,
  DrawerHeader,
  DrawerShell,
} from '@/components/drawer-layout'
import { StatusBadge } from '@/components/status-badge'
import { TableId } from '@/components/table-id'
import {
  getAdminPlans,
  getUserSubscriptions,
  createUserSubscription,
  invalidateUserSubscription,
  deleteUserSubscription,
  resetUserSubscriptions,
} from '../../api'
import { formatTimestamp } from '../../lib'
import type { PlanRecord, UserSubscriptionRecord } from '../../types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: { id: number; username?: string } | null
  onSuccess?: () => void
}

function SubscriptionStatusBadge(props: {
  sub: UserSubscriptionRecord['subscription']
  /** Reference timestamp in seconds (Date.now() is impure during render). */
  now: number
  t: (key: string) => string
}) {
  const isExpired =
    (props.sub.end_time || 0) > 0 && props.sub.end_time < props.now
  const isActive = props.sub.status === 'active' && !isExpired
  if (isActive)
    return (
      <StatusBadge
        label={props.t('Active')}
        variant='success'
        copyable={false}
      />
    )
  if (props.sub.status === 'cancelled')
    return (
      <StatusBadge
        label={props.t('Invalidated')}
        variant='neutral'
        copyable={false}
      />
    )
  return (
    <StatusBadge
      label={props.t('Expired')}
      variant='neutral'
      copyable={false}
    />
  )
}

export function UserSubscriptionsDialog(props: Props) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [plans, setPlans] = useState<PlanRecord[]>([])
  const [subs, setSubs] = useState<UserSubscriptionRecord[]>([])
  const [selectedPlanId, setSelectedPlanId] = useState<string>('')
  const [confirmAction, setConfirmAction] = useState<{
    type: 'invalidate' | 'delete' | 'reset'
    subId?: number
    planId?: number
  } | null>(null)
  const [advanceResetTime, setAdvanceResetTime] = useState(true)
  // Reference time (seconds) for expiry checks. Date.now() is impure, so it
  // is snapshotted at mount and refreshed whenever the data is (re)fetched
  // instead of being read during render.
  const [nowSec, setNowSec] = useState(() => Date.now() / 1000)

  const planTitleMap = useMemo(() => {
    const map = new Map<number, string>()
    plans.forEach((p) => {
      if (p.plan.id) map.set(p.plan.id, p.plan.title || `#${p.plan.id}`)
    })
    return map
  }, [plans])

  const userId = props.user?.id

  // Fetch plans + subscriptions (no synchronous setState: safe to call from
  // the effect below; `loading` is turned on by the render adjustment)
  const fetchData = useCallback(async () => {
    if (!userId) return
    try {
      const [plansRes, subsRes] = await Promise.all([
        getAdminPlans(),
        getUserSubscriptions(userId),
      ])
      setNowSec(Date.now() / 1000)
      if (plansRes.success) setPlans(plansRes.data || [])
      if (subsRes.success) setSubs(subsRes.data || [])
    } catch {
      toast.error(t('Loading failed'))
    } finally {
      setLoading(false)
    }
  }, [userId, t])

  // Refresh entry point for event handlers: flips loading back on first
  const loadData = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    await fetchData()
  }, [userId, fetchData])

  // Reset the plan picker and show the loading state when the dialog opens
  // (adjust state during render, keyed on the same values as the effect).
  const [prevDialogSync, setPrevDialogSync] = useState<{
    open: boolean
    userId: number | undefined
    fetchData: typeof fetchData
  } | null>(null)
  if (
    prevDialogSync === null ||
    prevDialogSync.open !== props.open ||
    prevDialogSync.userId !== userId ||
    prevDialogSync.fetchData !== fetchData
  ) {
    setPrevDialogSync({ open: props.open, userId, fetchData })
    if (props.open && userId) {
      setSelectedPlanId('')
      setLoading(true)
    }
  }

  useEffect(() => {
    if (props.open && userId) {
      void (async () => {
        await fetchData()
      })()
    }
  }, [props.open, userId, fetchData])

  const handleCreate = async () => {
    if (!props.user?.id || !selectedPlanId) {
      toast.error(t('Please select a subscription plan'))
      return
    }
    setCreating(true)
    try {
      const res = await createUserSubscription(props.user.id, {
        plan_id: Number(selectedPlanId),
      })
      if (res.success) {
        toast.success(res.data?.message || t('Added successfully'))
        setSelectedPlanId('')
        await loadData()
        props.onSuccess?.()
      }
    } catch {
      toast.error(t('Request failed'))
    } finally {
      setCreating(false)
    }
  }

  const handleConfirmAction = async () => {
    if (!confirmAction) return
    try {
      if (confirmAction.type === 'invalidate') {
        if (!confirmAction.subId) return
        const res = await invalidateUserSubscription(confirmAction.subId)
        if (res.success) {
          toast.success(res.data?.message || t('Has been invalidated'))
          await loadData()
          props.onSuccess?.()
        }
      } else if (confirmAction.type === 'delete') {
        if (!confirmAction.subId) return
        const res = await deleteUserSubscription(confirmAction.subId)
        if (res.success) {
          toast.success(t('Deleted'))
          await loadData()
          props.onSuccess?.()
        }
      } else if (props.user?.id && confirmAction.planId) {
        const res = await resetUserSubscriptions(props.user.id, {
          plan_id: confirmAction.planId,
          advance_reset_time: advanceResetTime,
        })
        if (res.success) {
          toast.success(res.data?.message || t('Subscription quotas reset'))
          await loadData()
          props.onSuccess?.()
        }
      }
    } catch {
      toast.error(t('Operation failed'))
    } finally {
      setConfirmAction(null)
    }
  }

  const headerTitle = t('User Subscription Management')
  const headerDescription = `${props.user?.username || '-'} (ID: ${props.user?.id || '-'})`
  let confirmTitle = t('Confirm delete')
  let confirmDescription = t(
    'Deleting will permanently remove this subscription record (including benefit details). Continue?'
  )
  if (confirmAction?.type === 'invalidate') {
    confirmTitle = t('Confirm invalidate')
    confirmDescription = t(
      'After invalidating, this subscription will be immediately deactivated. Historical records are not affected. Continue?'
    )
  } else if (confirmAction?.type === 'reset') {
    confirmTitle = t('Reset user subscription quota')
    confirmDescription = t(
      'Reset usage for this user and plan. This does not remove the subscription record.'
    )
  }

  return (
    <>
      <DrawerShell
        open={props.open}
        onOpenChange={props.onOpenChange}
        size='lg'
        ariaTitle={headerTitle}
        ariaDescription={headerDescription}
      >
        <DrawerHeader title={headerTitle} description={headerDescription} />

        <DrawerBody>
          <div className='flex gap-2'>
            <Select
              items={[
                ...plans.map((p) => ({
                  value: String(p.plan.id),
                  label: (
                    <>
                      {p.plan.title}($
                      {Number(p.plan.price_amount || 0).toFixed(2)})
                    </>
                  ),
                })),
              ]}
              value={selectedPlanId}
              onValueChange={(v) => v !== null && setSelectedPlanId(v)}
            >
              <SelectTrigger className='flex-1'>
                <SelectValue placeholder={t('Select subscription plan')} />
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                <SelectGroup>
                  {plans.map((p) => (
                    <SelectItem key={p.plan.id} value={String(p.plan.id)}>
                      {p.plan.title} ($
                      {Number(p.plan.price_amount || 0).toFixed(2)})
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Button
              onClick={handleCreate}
              disabled={creating || !selectedPlanId}
            >
              <Plus className='mr-1 h-4 w-4' />
              {t('Add subscription')}
            </Button>
          </div>

          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>{t('Plan')}</TableHead>
                  <TableHead>{t('Status')}</TableHead>
                  <TableHead>{t('Validity')}</TableHead>
                  <TableHead>{t('Total Quota')}</TableHead>
                  <TableHead className='text-right'>{t('Actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className='py-8 text-center'>
                      {t('Loading...')}
                    </TableCell>
                  </TableRow>
                ) : subs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className='text-muted-foreground py-8 text-center'
                    >
                      {t('No subscription records')}
                    </TableCell>
                  </TableRow>
                ) : (
                  subs.map((record) => {
                    const sub = record.subscription
                    const now = nowSec
                    const isExpired =
                      (sub.end_time || 0) > 0 && sub.end_time < now
                    const isActive = sub.status === 'active' && !isExpired
                    const total = Number(sub.amount_total || 0)
                    const used = Number(sub.amount_used || 0)

                    return (
                      <TableRow key={sub.id}>
                        <TableCell>
                          <TableId value={sub.id} />
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className='font-medium'>
                              {planTitleMap.get(sub.plan_id) ||
                                `#${sub.plan_id}`}
                            </div>
                            <div className='text-muted-foreground text-sm'>
                              {t('Source')}: {sub.source || '-'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <SubscriptionStatusBadge
                            sub={sub}
                            now={nowSec}
                            t={t}
                          />
                        </TableCell>
                        <TableCell>
                          <div className='text-sm'>
                            <div>
                              {t('Start')}: {formatTimestamp(sub.start_time)}
                            </div>
                            <div>
                              {t('End')}: {formatTimestamp(sub.end_time)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {total > 0 ? `${used}/${total}` : t('Unlimited')}
                        </TableCell>
                        <TableCell className='text-right'>
                          <div className='flex justify-end gap-1'>
                            <Button
                              size='sm'
                              variant='outline'
                              disabled={!isActive}
                              onClick={() => {
                                setAdvanceResetTime(true)
                                setConfirmAction({
                                  type: 'reset',
                                  planId: sub.plan_id,
                                })
                              }}
                            >
                              {t('Reset')}
                            </Button>
                            <Button
                              size='sm'
                              variant='outline'
                              disabled={!isActive}
                              onClick={() =>
                                setConfirmAction({
                                  type: 'invalidate',
                                  subId: sub.id,
                                })
                              }
                            >
                              {t('Invalidate')}
                            </Button>
                            <Button
                              size='sm'
                              variant='destructive'
                              onClick={() =>
                                setConfirmAction({
                                  type: 'delete',
                                  subId: sub.id,
                                })
                              }
                            >
                              {t('Delete')}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </DrawerBody>
      </DrawerShell>

      {confirmAction && (
        <ConfirmDialog
          open
          onOpenChange={(v) => !v && setConfirmAction(null)}
          title={confirmTitle}
          desc={confirmDescription}
          handleConfirm={handleConfirmAction}
          destructive={confirmAction.type === 'delete'}
          confirmText={
            confirmAction.type === 'reset' ? t('Reset quotas') : undefined
          }
        >
          {confirmAction.type === 'reset' ? (
            <label className='border-border/70 bg-muted/30 flex items-start gap-3 rounded-lg border p-3 text-sm'>
              <Checkbox
                checked={advanceResetTime}
                onCheckedChange={(checked) => setAdvanceResetTime(checked === true)}
                className='mt-0.5'
              />
              <span className='space-y-1'>
                <Label className='font-medium'>
                  {t('Advance next reset time')}
                </Label>
                <span className='text-muted-foreground block leading-5'>
                  {t(
                    'Keep this on to move the subscription to its next reset window after the quota reset.'
                  )}
                </span>
              </span>
            </label>
          ) : null}
        </ConfirmDialog>
      )}
    </>
  )
}
