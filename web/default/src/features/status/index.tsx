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
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Activity,
  Bell,
  CheckCircle2,
  CreditCard,
  LayoutDashboard,
  Route,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useStatus } from '@/hooks/use-status'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AppShell } from '@/components/layout'
import { PageTransition } from '@/components/page-transition'
import { Panel, PanelHeader } from '@/components/patterns'
import { StatusBadge } from '@/components/status-badge'
import { EmptyState, Eyebrow, StatCard, StatCardRow } from '@/components/youbox'
import { getUptimeStatus } from '@/features/dashboard/api'
import { useAnnouncements } from '@/features/dashboard/hooks/use-status-data'
import type { AnnouncementItem } from '@/features/dashboard/types'
import { getPricing } from '@/features/pricing/api'
import { getPerfMetricsSummary } from '@/features/performance-metrics/api'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ServiceStatusRow } from './components/service-status-row'
import {
  averageErrorRate,
  averageLatencyMs,
  averageMonitorUptime,
  flattenMonitors,
  hasLongUptimeWindow,
  healthForSuccessRate,
  incidentTitleFromContent,
} from './lib/status-helpers'
import { buildVendorRollup } from './lib/vendor-rollup'

const SERVICE_ICONS = [Route, LayoutDashboard, CreditCard, Activity] as const

function incidentVariant(
  type?: AnnouncementItem['type']
): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
  if (type === 'error') return 'danger'
  if (type === 'warning' || type === 'ongoing') return 'warning'
  if (type === 'success') return 'success'
  return 'info'
}

export function StatusPage() {
  const { t } = useTranslation()
  const { status } = useStatus()
  const { items: announcements } = useAnnouncements()

  const uptimeQuery = useQuery({
    queryKey: ['uptime-status'],
    queryFn: getUptimeStatus,
    staleTime: 60_000,
    refetchInterval: 60_000,
    retry: false,
  })

  const perfQuery = useQuery({
    queryKey: ['perf-metrics-summary', 24],
    queryFn: () => getPerfMetricsSummary(24),
    staleTime: 60_000,
    refetchInterval: 60_000,
    retry: false,
  })

  const pricingQuery = useQuery({
    queryKey: ['pricing'],
    queryFn: getPricing,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })

  const monitors = useMemo(
    () => flattenMonitors(uptimeQuery.data?.data ?? []),
    [uptimeQuery.data]
  )
  const perfModels = useMemo(
    () => perfQuery.data?.data.models ?? [],
    [perfQuery.data]
  )

  const avgSuccess = useMemo(() => {
    if (perfModels.length === 0) return NaN
    const total = perfModels.reduce(
      (sum, row) => sum + Number(row.success_rate || 0),
      0
    )
    return total / perfModels.length
  }, [perfModels])

  const avgUptime = averageMonitorUptime(monitors)

  const overall = useMemo(() => {
    if (Number.isFinite(avgSuccess)) {
      return healthForSuccessRate(avgSuccess)
    }
    if (Number.isFinite(avgUptime)) {
      return healthForSuccessRate(avgUptime)
    }
    return healthForSuccessRate(99.98)
  }, [avgSuccess, avgUptime])
  const avgLatency = averageLatencyMs(perfModels)
  const avgErrorRate = averageErrorRate(perfModels)

  const incidents = useMemo(
    () =>
      announcements.filter((item) =>
        ['warning', 'error', 'ongoing', 'success'].includes(item.type ?? '')
      ),
    [announcements]
  )

  const openIncidents = incidents.filter(
    (item) => item.type === 'warning' || item.type === 'error' || item.type === 'ongoing'
  ).length

  const serverAddress =
    (status?.server_address as string | undefined) ||
    (typeof window !== 'undefined' ? window.location.origin : '')

  const statusPageUrl = (status?.status_page_url as string | undefined)?.trim()

  const vendorRows = useMemo(
    () =>
      buildVendorRollup(
        perfModels,
        pricingQuery.data?.data ?? []
      ),
    [perfModels, pricingQuery.data]
  )

  const longUptimeWindow = hasLongUptimeWindow(monitors)

  const loading = uptimeQuery.isLoading || perfQuery.isLoading

  return (
    <AppShell variant='public'>
      <PageTransition>
        <div className='mx-auto w-full max-w-[1000px] px-7 py-12 md:py-14'>
          <Eyebrow className='mb-3'>{t('System status')}</Eyebrow>

          <Card className='border-brand-border bg-surface-card mb-4 flex flex-col gap-4 p-6 shadow-[var(--glow-soft)] sm:flex-row sm:items-center'>
            <div className='bg-success-subtle text-success flex size-12 shrink-0 items-center justify-center rounded-xl'>
              <CheckCircle2 className='size-6' aria-hidden='true' />
            </div>
            <div className='min-w-0 flex-1'>
              <h1 className='font-display text-text-strong text-2xl font-bold tracking-[-0.02em]'>
                {loading ? (
                  <Skeleton className='h-8 w-64' />
                ) : (
                  t(overall.label)
                )}
              </h1>
              <p className='text-muted-foreground mt-1 font-mono text-xs'>
                {t('Last checked just now · auto-refresh on')}
              </p>
            </div>
            {statusPageUrl ? (
              <Button
                variant='secondary'
                size='sm'
                className='shrink-0 gap-2'
                render={
                  <a
                    href={statusPageUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                  />
                }
              >
                <Bell className='size-4' aria-hidden='true' />
                <span>{t('Subscribe')}</span>
              </Button>
            ) : null}
          </Card>

          <StatCardRow columns={4} className='mb-8'>
            <StatCard
              label={longUptimeWindow ? t('Uptime (90d)') : t('Uptime (24h)')}
              value={
                loading ? '—' : Number.isFinite(avgUptime) ? avgUptime.toFixed(2) : '—'
              }
              unit={Number.isFinite(avgUptime) ? '%' : undefined}
              loading={loading}
            />
            <StatCard
              label={t('Gateway latency')}
              value={
                loading
                  ? '—'
                  : Number.isFinite(avgLatency)
                    ? Math.round(avgLatency)
                    : '—'
              }
              unit={Number.isFinite(avgLatency) ? 'ms' : undefined}
              loading={loading}
            />
            <StatCard
              label={t('Error rate (24h)')}
              value={
                loading
                  ? '—'
                  : Number.isFinite(avgErrorRate)
                    ? avgErrorRate.toFixed(2)
                    : '—'
              }
              unit={Number.isFinite(avgErrorRate) ? '%' : undefined}
              loading={loading}
            />
            <StatCard
              label={t('Open incidents')}
              value={loading ? '—' : openIncidents}
              loading={loading}
            />
          </StatCardRow>

          <Panel className='mb-8 overflow-hidden p-0'>
            <PanelHeader
              title={t('Core services')}
              actions={
                <span className='text-muted-foreground font-mono text-[11px]'>
                  {longUptimeWindow
                    ? t('90-day history')
                    : t('24-hour history')}
                </span>
              }
              className='px-5 pt-5'
            />
            {loading ? (
              <div className='space-y-3 px-5 pb-5'>
                <Skeleton className='h-14 w-full' />
                <Skeleton className='h-14 w-full' />
              </div>
            ) : monitors.length === 0 ? (
              <EmptyState
                className='min-h-0 py-10'
                title={t('No uptime monitoring configured')}
                description={t(
                  'Connect Uptime Kuma in System Settings to populate this board.'
                )}
              />
            ) : (
              monitors.map((monitor, index) => {
                const Icon = SERVICE_ICONS[index % SERVICE_ICONS.length]
                return (
                  <ServiceStatusRow
                    key={`${monitor.name}-${index}`}
                    icon={Icon}
                    name={monitor.name}
                    subtitle={
                      index === 0
                        ? `${serverAddress.replace(/^https?:\/\//, '')}/v1`
                        : monitor.group
                    }
                    monitor={monitor}
                  />
                )
              })
            )}
          </Panel>

          {vendorRows.length > 0 ? (
            <Panel className='mb-8 overflow-hidden p-0'>
              <PanelHeader
                title={t('Upstream providers')}
                actions={
                  <span className='text-muted-foreground font-mono text-[11px]'>
                    {t('Routed capacity')}
                  </span>
                }
                className='px-5 pt-5'
              />
              <div className='divide-border/60 divide-y'>
                {vendorRows.slice(0, 8).map((row) => (
                  <div
                    key={row.vendor}
                    className='flex items-center gap-4 px-5 py-3.5'
                  >
                    <Avatar className='size-8 shrink-0 rounded-md'>
                      <AvatarFallback className='bg-surface-3 text-foreground rounded-md text-[11px] font-semibold'>
                        {row.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className='min-w-0 flex-1'>
                      <div className='truncate text-sm font-medium'>
                        {row.vendor}
                      </div>
                      <div className='text-muted-foreground font-mono text-[11px]'>
                        {t('{{count}} models · {{latency}} median', {
                          count: row.modelCount,
                          latency: row.latencyLabel,
                        })}
                      </div>
                    </div>
                    <div className='flex shrink-0 items-center gap-3'>
                      <span className='font-mono text-xs tabular-nums'>
                        {Number.isFinite(row.successRate)
                          ? `${row.successRate.toFixed(2)}%`
                          : '—'}
                      </span>
                      <StatusBadge
                        variant={
                          row.successRate >= 99.9
                            ? 'success'
                            : row.successRate >= 99
                              ? 'warning'
                              : 'danger'
                        }
                      >
                        {row.successRate >= 99.9
                          ? t('Operational')
                          : row.successRate >= 99
                            ? t('Degraded')
                            : t('Down')}
                      </StatusBadge>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          ) : null}

          {incidents.length > 0 ? (
            <section className='space-y-3'>
              <h2 className='font-display text-lg font-semibold tracking-[-0.01em]'>
                {t('Recent incidents')}
              </h2>
              <div className='space-y-3'>
                {incidents.slice(0, 6).map((item, index) => {
                  const title = incidentTitleFromContent(item.content)
                  return (
                    <Card key={`${item.publishDate ?? index}`} className='p-4'>
                      <div className='mb-2 flex flex-wrap items-center gap-2'>
                        <StatusBadge variant={incidentVariant(item.type)}>
                          {item.type === 'success'
                            ? t('Resolved')
                            : item.type === 'warning' || item.type === 'ongoing'
                              ? t('Degraded')
                              : item.type === 'error'
                                ? t('Outage')
                                : t('Update')}
                        </StatusBadge>
                        {title ? (
                          <span className='text-text-strong text-sm font-semibold'>
                            {title}
                          </span>
                        ) : null}
                        <span className='flex-1' />
                        {item.publishDate ? (
                          <span className='text-muted-foreground font-mono text-[11px]'>
                            {item.publishDate}
                          </span>
                        ) : null}
                      </div>
                      <p className='text-muted-foreground text-sm leading-relaxed'>
                        {item.content}
                      </p>
                    </Card>
                  )
                })}
              </div>
            </section>
          ) : null}
        </div>
      </PageTransition>
    </AppShell>
  )
}