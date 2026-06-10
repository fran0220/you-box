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
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { formatQuota } from '@/lib/format'
import { computeTimeRange } from '@/lib/time'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DeltaBadge,
  Eyebrow,
  Metric,
  Panel,
  PanelBody,
} from '@/components/patterns'
import { getUserQuotaDates } from '@/features/dashboard/api'
import type { UserWalletData } from '../types'

interface BalanceHeroCardProps {
  user: UserWalletData | null
  loading?: boolean
}

/**
 * Aggregate the current user's quota burn over the trailing 7 days to
 * estimate how long the remaining balance lasts (runway).
 */
function useUsage7d() {
  return useQuery({
    queryKey: ['wallet-usage-7d'],
    queryFn: async () => {
      const range = computeTimeRange(7)
      const res = await getUserQuotaDates({ ...range, default_time: 'day' })
      return res?.data ?? []
    },
    staleTime: 60 * 1000,
    select: (items) => items.reduce((sum, item) => sum + (item.quota ?? 0), 0),
  })
}

/**
 * Balance hero (r2-B3 section 2): `// balance` eyebrow + display-size
 * balance, Used/Requests metrics (absorbs the old WalletStatsCard) and a
 * runway health DeltaBadge estimated from 7-day usage.
 */
export function BalanceHeroCard({ user, loading }: BalanceHeroCardProps) {
  const { t } = useTranslation()
  const usage7d = useUsage7d()

  if (loading) {
    return (
      <Panel>
        <PanelBody className='flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between'>
          <div className='space-y-3'>
            <Skeleton className='h-3 w-20' />
            <Skeleton className='h-10 w-44' />
            <div className='flex gap-8'>
              <Skeleton className='h-9 w-24' />
              <Skeleton className='h-9 w-24' />
            </div>
          </div>
          <div className='space-y-2 sm:text-right'>
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-3 w-32' />
          </div>
        </PanelBody>
      </Panel>
    )
  }

  const quota = user?.quota ?? 0
  const burn7d = usage7d.data ?? 0
  const burnPerDay = burn7d / 7
  const runwayDays = burnPerDay > 0 ? Math.floor(quota / burnPerDay) : null
  const lowBalance = runwayDays !== null && runwayDays <= 3
  const runwayLabel =
    runwayDays === null
      ? t('No recent usage')
      : t('~{{days}} days at current rate', {
          days: runwayDays > 999 ? '999+' : runwayDays.toLocaleString(),
        })

  return (
    <Panel>
      <PanelBody className='flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between'>
        <div className='min-w-0'>
          <Eyebrow>{t('Balance')}</Eyebrow>
          <div className='font-display text-foreground mt-1 text-[40px] font-bold tracking-[-0.03em] break-all'>
            {formatQuota(quota)}
          </div>
          <div className='mt-3 flex flex-wrap items-start gap-x-8 gap-y-3'>
            <Metric k={t('Used')} v={formatQuota(user?.used_quota ?? 0)} />
            <Metric
              k={t('Requests')}
              v={(user?.request_count ?? 0).toLocaleString()}
            />
          </div>
        </div>
        <div className='flex shrink-0 flex-col gap-1 sm:items-end sm:text-right'>
          {usage7d.isLoading ? (
            <>
              <Skeleton className='h-4 w-20' />
              <Skeleton className='h-3.5 w-32' />
            </>
          ) : (
            <>
              {lowBalance ? (
                <DeltaBadge direction='down' tone='danger'>
                  {t('Low balance')}
                </DeltaBadge>
              ) : (
                <DeltaBadge direction='up' tone='success'>
                  {t('Healthy')}
                </DeltaBadge>
              )}
              <span className='text-muted-foreground text-xs'>
                {runwayLabel}
              </span>
            </>
          )}
        </div>
      </PanelBody>
    </Panel>
  )
}
