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
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { resetPlanSubscriptions } from '../../api'
import { useSubscriptions } from '../subscriptions-provider'

export function ResetPlanSubscriptionsDialog() {
  const { t } = useTranslation()
  const { open, setOpen, currentRow, triggerRefresh } = useSubscriptions()
  const [loading, setLoading] = useState(false)
  const [advanceResetTime, setAdvanceResetTime] = useState(true)

  if (open !== 'reset-plan' || !currentRow) return null

  const handleConfirm = async () => {
    setLoading(true)
    try {
      const res = await resetPlanSubscriptions(currentRow.plan.id, {
        advance_reset_time: advanceResetTime,
      })
      if (res.success) {
        toast.success(res.data?.message || t('Subscription quotas reset'))
        triggerRefresh()
        setOpen(null)
      }
    } catch {
      toast.error(t('Operation failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <ConfirmDialog
      open
      onOpenChange={(v) => !v && setOpen(null)}
      title={t('Reset plan subscription quotas')}
      desc={t(
        'Reset usage for all active subscriptions under this plan. This is useful after changing a quota cycle or correcting usage accounting.'
      )}
      handleConfirm={handleConfirm}
      isLoading={loading}
      confirmText={t('Reset quotas')}
      destructive
    >
      <label className='border-border/70 bg-muted/30 flex items-start gap-3 rounded-lg border p-3 text-sm'>
        <Checkbox
          checked={advanceResetTime}
          onCheckedChange={(checked) => setAdvanceResetTime(checked === true)}
          className='mt-0.5'
        />
        <span className='space-y-1'>
          <Label className='font-medium'>{t('Advance next reset time')}</Label>
          <span className='text-muted-foreground block leading-5'>
            {t(
              'Keep this on to move each subscription to its next reset window after the quota reset.'
            )}
          </span>
        </span>
      </label>
    </ConfirmDialog>
  )
}
