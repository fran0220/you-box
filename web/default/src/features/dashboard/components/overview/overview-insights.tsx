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
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Activity, Coins, Plus, Wallet, Zap } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/auth-store'
import { formatNumber, formatQuota } from '@/lib/format'
import { computeTimeRange } from '@/lib/time'
import { AnimatedNumber } from '@/components/ui/animated-number'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Panel,
  PanelBody,
  PanelHeader,
  ProgressBar,
  StatCard,
  StatCardRow,
  type StatCardDelta,
} from '@/components/patterns'
import { StatusBadge, type StatusVariant } from '@/components/status-badge'
import { PageHeader } from '@/components/youbox'
import { getUserQuotaDates } from '@/features/dashboard/api'
import type { QuotaDataItem } from '@/features/dashboard/types'
import { getUserLogs } from '@/features/usage-logs/api'
import { LOG_TYPE_ENUM } from '@/features/usage-logs/constants'
import type { UsageLog } from '@/features/usage-logs/data/schema'

const RANGE_OPTIONS = [1, 7, 14, 30] as const
type RangeDays = (typeof RANGE_OPTIONS)[number]
type MetricKey = 'requests' | 'tokens' | 'spend'

const LOG_STATUS: Record<number, { label: string; variant: StatusVariant }> = {
  [LOG_TYPE_ENUM.CONSUME]: { label: 'Consume', variant: 'success' },
  [LOG_TYPE_ENUM.ERROR]: { label: 'Error', variant: 'danger' },
  [LOG_TYPE_ENUM.TOPUP]: { label: 'Top-up', variant: 'info' },
  [LOG_TYPE_ENUM.REFUND]: { label: 'Refund', variant: 'info' },
  [LOG_TYPE_ENUM.MANAGE]: { label: 'Manage', variant: 'warning' },
  [LOG_TYPE_ENUM.SYSTEM]: { label: 'System', variant: 'neutral' },
}

function sumSeries(items: QuotaDataItem[], key: MetricKey): number {
  return items.reduce((total, item) => {
    if (key === 'requests') return total + (Number(item.count) || 0)
    if (key === 'tokens') return total + (Number(item.token_used) || 0)
    return total + (Number(item.quota) || 0)
  }, 0)
}

function deltaFor(
  current: number,
  previous: number
): StatCardDelta | undefined {
  if (previous <= 0) return undefined
  const pct = ((current - previous) / previous) * 100
  if (!Number.isFinite(pct)) return undefined
  const rounded = Math.round(pct)
  return {
    direction: rounded > 0 ? 'up' : rounded < 0 ? 'down' : 'flat',
    label: `${rounded > 0 ? '+' : ''}${rounded}%`,
  }
}

function relativeTime(
  ts: number,
  t: (key: string, opts?: Record<string, unknown>) => string
): string {
  const seconds = Math.max(0, Math.floor(Date.now() / 1000) - ts)
  if (seconds < 60) return t('{{count}}s ago', { count: seconds })
  if (seconds < 3600) {
    return t('{{count}}m ago', { count: Math.floor(seconds / 60) })
  }
  if (seconds < 86400) {
    return t('{{count}}h ago', { count: Math.floor(seconds / 3600) })
  }
  return t('{{count}}d ago', { count: Math.floor(seconds / 86400) })
}

function greetingKey(): string {
  const hour = new Date().getHours()
  if (hour < 6) return 'Good evening'
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export function OverviewInsights() {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.auth.user)
  const [rangeDays, setRangeDays] = useState<RangeDays>(7)

  const remainQuota = Number(user?.quota ?? 0)
  const usedQuota = Number(user?.used_quota ?? 0)
  const totalQuota = usedQuota + remainQuota

  const window = useMemo(() => {
    const full = computeTimeRange(rangeDays * 2)
    const mid = Math.floor((full.start_timestamp + full.end_timestamp) / 2)
    return { ...full, mid }
  }, [rangeDays])

  const trendQuery = useQuery({
    queryKey: [
      'dashboard',
      'overview',
      'summary',
      rangeDays,
      window.start_timestamp,
      window.end_timestamp,
    ],
    queryFn: async () =>
      getUserQuotaDates({
        start_timestamp: window.start_timestamp,
        end_timestamp: window.end_timestamp,
        default_time: rangeDays === 1 ? 'hour' : 'day',
      }),
    staleTime: 60 * 1000,
  })

  const logsQuery = useQuery({
    queryKey: ['dashboard', 'overview', 'recent-logs'],
    queryFn: async () => {
      const result = await getUserLogs({ p: 1, page_size: 5 })
      return result.success ? ((result.data?.items ?? []) as UsageLog[]) : []
    },
    staleTime: 60 * 1000,
  })

  const split = useMemo(() => {
    const items = trendQuery.data?.data ?? []
    const currentPeriod = items.filter(
      (item) => Number(item.created_at) >= window.mid
    )
    const previousPeriod = items.filter(
      (item) => Number(item.created_at) < window.mid
    )
    return { currentPeriod, previousPeriod }
  }, [trendQuery.data?.data, window.mid])

  const totals = useMemo(
    () => ({
      requests: sumSeries(split.currentPeriod, 'requests'),
      tokens: sumSeries(split.currentPeriod, 'tokens'),
      spend: sumSeries(split.currentPeriod, 'spend'),
      prevRequests: sumSeries(split.previousPeriod, 'requests'),
      prevTokens: sumSeries(split.previousPeriod, 'tokens'),
      prevSpend: sumSeries(split.previousPeriod, 'spend'),
    }),
    [split]
  )

  const rangeLabel: Record<RangeDays, string> = {
    1: t('Today'),
    7: t('Last 7 days'),
    14: t('Last 14 days'),
    30: t('Last 30 days'),
  }

  const loading = trendQuery.isLoading
  const logsError = logsQuery.isError
  const burnPerDay = totals.spend / rangeDays
  const runwayDays =
    remainQuota > 0 && burnPerDay > 0 ? remainQuota / burnPerDay : null

  return (
    <div className='flex flex-col gap-4'>
      <PageHeader
        className='mb-1'
        title={
          <>
            {t(greetingKey())}
            {user?.username ? `, ${user.username}` : ''}
          </>
        }
        subtitle={t(
          'Use this workspace to create keys, watch usage, and fix issues quickly.'
        )}
        actions={
          <>
            <Select
              value={String(rangeDays)}
              onValueChange={(value) =>
                setRangeDays(Number(value) as RangeDays)
              }
            >
              <SelectTrigger
                size='sm'
                className='w-36'
                aria-label={t('Time range')}
              >
                <SelectValue>{rangeLabel[rangeDays]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {RANGE_OPTIONS.map((days) => (
                  <SelectItem key={days} value={String(days)}>
                    {rangeLabel[days]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size='sm' render={<Link to='/keys' />}>
              <Plus data-icon='inline-start' />
              {t('New Key')}
            </Button>
          </>
        }
      />

      <StatCardRow columns={4}>
        <StatCard
          icon={<Activity />}
          label={t('Requests')}
          value={
            <AnimatedNumber value={totals.requests} format={formatNumber} />
          }
          delta={deltaFor(totals.requests, totals.prevRequests)}
          loading={loading}
        />
        <StatCard
          icon={<Coins />}
          label={t('Spend')}
          value={<AnimatedNumber value={totals.spend} format={formatQuota} />}
          delta={deltaFor(totals.spend, totals.prevSpend)}
          loading={loading}
        />
        <StatCard
          icon={<Zap />}
          label={t('Tokens')}
          value={<AnimatedNumber value={totals.tokens} format={formatNumber} />}
          delta={deltaFor(totals.tokens, totals.prevTokens)}
          loading={loading}
        />
        <StatCard
          icon={<Wallet />}
          label={t('Balance')}
          value={<AnimatedNumber value={remainQuota} format={formatQuota} />}
          delta={
            runwayDays !== null
              ? {
                  direction: runwayDays < 3 ? 'down' : 'up',
                  label:
                    runwayDays < 1
                      ? t('Less than 1 day left')
                      : t('~{{count}} days left', {
                          count: Math.min(999, Math.floor(runwayDays)),
                        }),
                  tone: runwayDays < 3 ? 'danger' : 'success',
                }
              : undefined
          }
          loading={loading}
        />
      </StatCardRow>

      <div className='grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]'>
        <Panel>
          <PanelHeader
            title={t('Recent activity')}
            actions={
              <Button
                variant='ghost'
                size='sm'
                render={<Link to='/usage-logs' />}
              >
                {t('View all')}
              </Button>
            }
          />
          <div>
            {logsError ? (
              <div className='flex flex-col items-center gap-2 px-5 py-8 text-center'>
                <p className='text-muted-foreground text-sm'>
                  {t('Failed to load')}
                </p>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    void logsQuery.refetch()
                  }}
                >
                  {t('Try again')}
                </Button>
              </div>
            ) : (logsQuery.data ?? []).length === 0 ? (
              <p className='text-muted-foreground px-5 py-8 text-center text-sm'>
                {logsQuery.isLoading ? t('Loading') : t('No recent requests')}
              </p>
            ) : (
              (logsQuery.data ?? []).map((log, index) => {
                const status = LOG_STATUS[Number(log.type)] ?? {
                  label: 'Unknown',
                  variant: 'neutral' as StatusVariant,
                }

                return (
                  <div
                    key={log.id ?? index}
                    className='border-divider flex items-center gap-3 border-b px-4 py-3 last:border-b-0 sm:px-5'
                  >
                    <div className='min-w-0 flex-1'>
                      <div className='truncate text-sm font-medium'>
                        {log.model_name || t(status.label)}
                      </div>
                      <div className='text-muted-foreground truncate font-mono text-xs'>
                        {log.token_name || '—'}
                      </div>
                    </div>
                    <StatusBadge
                      appearance='soft'
                      variant={status.variant}
                      label={t(status.label)}
                      copyable={false}
                    />
                    <span className='w-16 text-right font-mono text-[13px] tabular-nums'>
                      {Number(log.type) === LOG_TYPE_ENUM.CONSUME
                        ? formatQuota(Number(log.quota) || 0)
                        : '—'}
                    </span>
                    <span className='text-muted-foreground w-16 text-right font-mono text-xs'>
                      {relativeTime(Number(log.created_at) || 0, t)}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </Panel>

        <Panel>
          <PanelHeader
            title={t('Credit balance')}
            actions={
              <Button
                variant='outline'
                size='sm'
                render={<Link to='/wallet' />}
              >
                <Plus data-icon='inline-start' />
                {t('Top up')}
              </Button>
            }
          />
          <PanelBody>
            <div className='flex items-baseline gap-2'>
              <span className='font-display text-foreground text-[34px] leading-none font-bold tracking-[-0.03em]'>
                {formatQuota(remainQuota)}
              </span>
              <span className='text-muted-foreground font-mono text-[13px]'>
                / {formatQuota(totalQuota)} {t('total')}
              </span>
            </div>
            <ProgressBar
              value={usedQuota}
              max={totalQuota || 1}
              label={t('Used quota')}
              className='mt-4 mb-2 h-2'
            />
            <div className='text-muted-foreground flex justify-between gap-3 font-mono text-xs'>
              <span>
                {t('Used')} {formatQuota(usedQuota)}
              </span>
              <span className='text-right'>
                {runwayDays !== null
                  ? t('~{{count}} days left at current rate', {
                      count: Math.min(999, Math.floor(runwayDays)),
                    })
                  : t('No recent usage')}
              </span>
            </div>
            <div className='bg-divider my-5 h-px' />
            <div className='grid gap-2 text-sm'>
              <div className='flex items-center justify-between gap-3'>
                <span className='text-muted-foreground'>
                  {t('Current range')}
                </span>
                <span className='font-mono'>{rangeLabel[rangeDays]}</span>
              </div>
              <div className='flex items-center justify-between gap-3'>
                <span className='text-muted-foreground'>
                  {t('Period spend')}
                </span>
                <span className='font-mono'>{formatQuota(totals.spend)}</span>
              </div>
              <div className='flex items-center justify-between gap-3'>
                <span className='text-muted-foreground'>
                  {t('Average daily spend')}
                </span>
                <span className='font-mono'>{formatQuota(burnPerDay)}</span>
              </div>
            </div>
          </PanelBody>
        </Panel>
      </div>
    </div>
  )
}
