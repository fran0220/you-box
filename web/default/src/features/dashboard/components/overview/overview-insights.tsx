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
import { cn } from '@/lib/utils'
import {
  Eyebrow,
  Panel,
  PanelBody,
  PanelHeader,
  ProgressBar,
  Sparkline,
  StatCard,
  StatCardRow,
  type StatCardDelta,
} from '@/components/patterns'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FilterTabs } from '@/components/data-table'
import { StatusBadge, type StatusVariant } from '@/components/status-badge'
import { getUserQuotaDates } from '@/features/dashboard/api'
import type { QuotaDataItem } from '@/features/dashboard/types'
import { getUserLogs } from '@/features/usage-logs/api'
import { LOG_TYPE_ENUM } from '@/features/usage-logs/constants'
import type { UsageLog } from '@/features/usage-logs/data/schema'

/**
 * R2-B1 overview insights — the SCREENS.dashboard structure:
 * header (greeting + range + new key) → 4 StatCards → requests-over-time
 * panel (metric tabs) → spend-by-model → recent activity + credit balance.
 * Replaces the legacy SummaryCards block.
 */

const RANGE_OPTIONS = [1, 7, 14, 30] as const
type RangeDays = (typeof RANGE_OPTIONS)[number]

type MetricKey = 'requests' | 'tokens' | 'spend'

const CHART_BUCKETS = 28

function sumSeries(items: QuotaDataItem[], key: MetricKey): number {
  return items.reduce((total, item) => {
    if (key === 'requests') return total + (Number(item.count) || 0)
    if (key === 'tokens') return total + (Number(item.token_used) || 0)
    return total + (Number(item.quota) || 0)
  }, 0)
}

function bucketize(
  items: QuotaDataItem[],
  key: MetricKey,
  start: number,
  end: number,
  buckets: number
): number[] {
  const series = Array.from({ length: buckets }, () => 0)
  if (end <= start) return series
  for (const item of items) {
    const ts = Number(item.created_at) || start
    const index = Math.min(
      buckets - 1,
      Math.max(0, Math.floor(((ts - start) / (end - start)) * buckets))
    )
    if (key === 'requests') series[index] += Number(item.count) || 0
    else if (key === 'tokens') series[index] += Number(item.token_used) || 0
    else series[index] += Number(item.quota) || 0
  }
  return series
}

function deltaFor(current: number, previous: number): StatCardDelta | undefined {
  if (previous <= 0) return undefined
  const pct = ((current - previous) / previous) * 100
  if (!Number.isFinite(pct)) return undefined
  const rounded = Math.round(pct)
  return {
    direction: rounded > 0 ? 'up' : rounded < 0 ? 'down' : 'flat',
    label: `${rounded > 0 ? '+' : ''}${rounded}%`,
  }
}

function modelInitials(name: string): string {
  return name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 2).toUpperCase() || '?'
}

const LOG_STATUS: Record<number, { label: string; variant: StatusVariant }> = {
  [LOG_TYPE_ENUM.CONSUME]: { label: 'Consume', variant: 'success' },
  [LOG_TYPE_ENUM.ERROR]: { label: 'Error', variant: 'danger' },
  [LOG_TYPE_ENUM.TOPUP]: { label: 'Top-up', variant: 'info' },
  [LOG_TYPE_ENUM.REFUND]: { label: 'Refund', variant: 'info' },
  [LOG_TYPE_ENUM.MANAGE]: { label: 'Manage', variant: 'warning' },
  [LOG_TYPE_ENUM.SYSTEM]: { label: 'System', variant: 'neutral' },
}

function relativeTime(
  ts: number,
  t: (key: string, opts?: Record<string, unknown>) => string
) {
  const seconds = Math.max(0, Math.floor(Date.now() / 1000) - ts)
  if (seconds < 60) return t('{{count}}s ago', { count: seconds })
  if (seconds < 3600) return t('{{count}}m ago', { count: Math.floor(seconds / 60) })
  if (seconds < 86400) return t('{{count}}h ago', { count: Math.floor(seconds / 3600) })
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
  const [metric, setMetric] = useState<MetricKey>('requests')

  const remainQuota = Number(user?.quota ?? 0)
  const usedQuota = Number(user?.used_quota ?? 0)

  // Double window: the first half feeds period-over-period deltas.
  const window = useMemo(() => {
    const full = computeTimeRange(rangeDays * 2)
    const mid = Math.floor((full.start_timestamp + full.end_timestamp) / 2)
    return { ...full, mid }
  }, [rangeDays])

  const trendQuery = useQuery({
    queryKey: ['dashboard', 'overview', 'insights', window.start_timestamp, window.end_timestamp],
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
      const result = await getUserLogs({ p: 1, page_size: 6 })
      return result.success ? ((result.data?.items ?? []) as UsageLog[]) : []
    },
    staleTime: 60 * 1000,
  })

  const split = useMemo(() => {
    const items = trendQuery.data?.data ?? []
    const current = items.filter((item) => Number(item.created_at) >= window.mid)
    const previous = items.filter((item) => Number(item.created_at) < window.mid)
    return { current, previous }
  }, [trendQuery.data?.data, window.mid])

  const totals = useMemo(
    () => ({
      requests: sumSeries(split.current, 'requests'),
      tokens: sumSeries(split.current, 'tokens'),
      spend: sumSeries(split.current, 'spend'),
      prevRequests: sumSeries(split.previous, 'requests'),
      prevTokens: sumSeries(split.previous, 'tokens'),
      prevSpend: sumSeries(split.previous, 'spend'),
    }),
    [split]
  )

  const chartSeries = useMemo(
    () =>
      bucketize(split.current, metric, window.mid, window.end_timestamp, CHART_BUCKETS),
    [split.current, metric, window.mid, window.end_timestamp]
  )

  const spendByModel = useMemo(() => {
    const byModel = new Map<string, number>()
    for (const item of split.current) {
      const name = item.model_name || t('Unknown')
      byModel.set(name, (byModel.get(name) ?? 0) + (Number(item.quota) || 0))
    }
    const rows = Array.from(byModel.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
    const max = rows[0]?.[1] ?? 0
    return { rows, max }
  }, [split.current, t])

  const dailySpend = useMemo(() => {
    const buckets = rangeDays === 1 ? 12 : Math.min(rangeDays, 14)
    return bucketize(split.current, 'spend', window.mid, window.end_timestamp, buckets)
  }, [split.current, rangeDays, window.mid, window.end_timestamp])

  const totalQuota = usedQuota + remainQuota
  const burnPerDay = totals.spend / rangeDays
  const runwayDays =
    remainQuota > 0 && burnPerDay > 0 ? remainQuota / burnPerDay : null

  const rangeLabel: Record<RangeDays, string> = {
    1: t('Today'),
    7: t('Last 7 days'),
    14: t('Last 14 days'),
    30: t('Last 30 days'),
  }

  const dateLabels = useMemo(() => {
    const start = new Date(window.mid * 1000)
    const end = new Date(window.end_timestamp * 1000)
    const middle = new Date((window.mid + window.end_timestamp) * 500)
    const fmt = (d: Date) =>
      rangeDays === 1
        ? `${String(d.getHours()).padStart(2, '0')}:00`
        : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    return [fmt(start), fmt(middle), fmt(end)]
  }, [window.mid, window.end_timestamp, rangeDays])

  const loading = trendQuery.isLoading
  const maxDailySpend = Math.max(...dailySpend, 1)

  const metricTitle: Record<MetricKey, string> = {
    requests: t('{{value}} requests', { value: formatNumber(totals.requests) }),
    tokens: t('{{value}} tokens', { value: formatNumber(totals.tokens) }),
    spend: t('{{value}} spend', { value: formatQuota(totals.spend) }),
  }

  return (
    <div className='flex flex-col gap-4'>
      {/* 1. header: greeting + range select + primary action */}
      <div className='flex flex-wrap items-center gap-3'>
        <p className='text-muted-foreground min-w-0 flex-1 basis-60 truncate text-sm'>
          {t(greetingKey())}
          {user?.username ? `, ${user.username}` : ''}.{' '}
          {t("Here's your activity for {{range}}.", {
            range: rangeLabel[rangeDays].toLowerCase(),
          })}
        </p>
        <div className='flex shrink-0 items-center gap-2'>
          <Select
            value={String(rangeDays)}
            onValueChange={(v) => setRangeDays(Number(v) as RangeDays)}
          >
            <SelectTrigger size='sm' className='w-36' aria-label={t('Time range')}>
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
        </div>
      </div>

      {/* 2. stat row */}
      <StatCardRow columns={4}>
        <StatCard
          icon={<Activity />}
          label={t('Requests')}
          value={formatNumber(totals.requests)}
          delta={deltaFor(totals.requests, totals.prevRequests)}
          loading={loading}
        />
        <StatCard
          icon={<Coins />}
          label={t('Spend')}
          value={formatQuota(totals.spend)}
          delta={deltaFor(totals.spend, totals.prevSpend)}
          loading={loading}
        />
        <StatCard
          icon={<Zap />}
          label={t('Tokens')}
          value={formatNumber(totals.tokens)}
          delta={deltaFor(totals.tokens, totals.prevTokens)}
          loading={loading}
        />
        <StatCard
          icon={<Wallet />}
          label={t('Balance')}
          value={formatQuota(remainQuota)}
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

      {/* 3+4. requests-over-time + spend by model */}
      <div className='grid gap-4 xl:grid-cols-[1.7fr_1fr]'>
        <Panel>
          <PanelHeader
            eyebrow={t('usage over time')}
            title={metricTitle[metric]}
            actions={
              <FilterTabs<MetricKey>
                label={t('Chart metric')}
                value={metric}
                onValueChange={setMetric}
                items={[
                  { value: 'requests', label: t('Requests') },
                  { value: 'tokens', label: t('Tokens') },
                  { value: 'spend', label: t('Spend') },
                ]}
              />
            }
          />
          <PanelBody>
            {loading ? (
              <div className='bg-surface-2 h-[170px] rounded-md motion-safe:animate-pulse' />
            ) : (
              <Sparkline data={chartSeries} height={170} />
            )}
            <div className='text-muted-foreground mt-3 flex justify-between font-mono text-[11px]'>
              {dateLabels.map((label, index) => (
                <span key={index}>{label}</span>
              ))}
            </div>
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader
            title={t('Spend by model')}
            actions={
              <span className='text-muted-foreground font-mono text-[11px]'>
                {rangeLabel[rangeDays]}
              </span>
            }
          />
          <PanelBody className='flex flex-col gap-4'>
            {spendByModel.rows.length === 0 ? (
              <p className='text-muted-foreground py-6 text-center text-sm'>
                {t('No usage in this period')}
              </p>
            ) : (
              spendByModel.rows.map(([name, amount]) => (
                <div key={name}>
                  <div className='mb-1.5 flex items-center gap-2.5'>
                    <Avatar className='size-6'>
                      <AvatarFallback className='font-display text-[9px] font-semibold'>
                        {modelInitials(name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className='min-w-0 flex-1 truncate text-[13px] font-medium'>
                      {name}
                    </span>
                    <span className='text-muted-foreground font-mono text-[13px]'>
                      {formatQuota(amount)}
                    </span>
                  </div>
                  <ProgressBar
                    value={amount}
                    max={spendByModel.max || 1}
                    label={name}
                  />
                </div>
              ))
            )}
          </PanelBody>
        </Panel>
      </div>

      {/* 5+6. recent activity + credit balance */}
      <div className='grid gap-4 xl:grid-cols-2'>
        <Panel>
          <PanelHeader
            title={t('Recent activity')}
            actions={
              <Button variant='ghost' size='sm' render={<Link to='/usage-logs' />}>
                {t('View all')}
              </Button>
            }
          />
          <div>
            {(logsQuery.data ?? []).length === 0 ? (
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
              <Button variant='outline' size='sm' render={<Link to='/wallet' />}>
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
            <div className='text-muted-foreground flex justify-between font-mono text-xs'>
              <span>
                {t('Used')} {formatQuota(usedQuota)}
              </span>
              <span>
                {runwayDays !== null
                  ? t('~{{count}} days left at current rate', {
                      count: Math.min(999, Math.floor(runwayDays)),
                    })
                  : t('No recent usage')}
              </span>
            </div>
            <div className='bg-divider my-5 h-px' />
            <Eyebrow className='mb-3'>{t('daily spend')}</Eyebrow>
            <div
              className='flex h-20 items-end gap-1.5'
              role='img'
              aria-label={t('Daily spend chart')}
            >
              {dailySpend.map((value, index) => (
                <div
                  key={index}
                  className={cn(
                    'bg-brand min-h-0.5 flex-1 rounded-[2px]',
                    index !== dailySpend.length - 1 && 'opacity-50'
                  )}
                  style={{ height: `${Math.max(3, (value / maxDailySpend) * 100)}%` }}
                />
              ))}
            </div>
            <div className='text-muted-foreground mt-2 flex justify-between font-mono text-[11px]'>
              <span>{dateLabels[0]}</span>
              <span>{dateLabels[2]}</span>
            </div>
          </PanelBody>
        </Panel>
      </div>
    </div>
  )
}
