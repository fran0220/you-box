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
import { Gauge, HeartPulse, Timer } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AnimatedNumber } from '@/components/ui/animated-number'
import { Skeleton } from '@/components/ui/skeleton'
import { MonoCell } from '@/components/data-table'
import {
  Panel,
  PanelHeader,
  StatCard,
  StatCardRow,
} from '@/components/patterns'
import { StatusBadge, type StatusVariant } from '@/components/status-badge'
import { getPerfMetricsSummary } from '@/features/performance-metrics/api'
import {
  formatLatency,
  formatThroughput,
  formatUptimePct,
} from '@/features/performance-metrics/lib/format'
import type { PerfModelSummary } from '@/features/performance-metrics/types'

const PERFORMANCE_WINDOW_HOURS = 24
const TOP_MODEL_LIMIT = 5

type WeightedMetric = 'avg_latency_ms' | 'avg_tps' | 'success_rate'

function simpleAverage(
  rows: PerfModelSummary[],
  metric: WeightedMetric,
  isValid: (value: number) => boolean
): number {
  let total = 0
  let count = 0
  for (const row of rows) {
    const value = Number(row[metric])
    if (!isValid(value)) continue
    total += value
    count++
  }
  return count > 0 ? total / count : NaN
}

function healthFor(rate: number): { label: string; variant: StatusVariant } {
  if (!Number.isFinite(rate)) return { label: 'Unknown', variant: 'neutral' }
  if (rate >= 99.9) return { label: 'Operational', variant: 'success' }
  if (rate >= 99) return { label: 'Degraded', variant: 'warning' }
  return { label: 'Down', variant: 'danger' }
}

export function PerformanceHealthPanel() {
  const { t } = useTranslation()
  const metricsQuery = useQuery({
    queryKey: ['perf-metrics-summary', PERFORMANCE_WINDOW_HOURS],
    queryFn: () => getPerfMetricsSummary(PERFORMANCE_WINDOW_HOURS),
    staleTime: 60 * 1000,
    retry: false,
  })

  const models = useMemo(
    () => metricsQuery.data?.data.models ?? [],
    [metricsQuery.data]
  )

  const summary = useMemo(() => {
    return {
      avgLatencyMs: Math.round(
        simpleAverage(
          models,
          'avg_latency_ms',
          (v) => Number.isFinite(v) && v > 0
        )
      ),
      avgTps: simpleAverage(
        models,
        'avg_tps',
        (v) => Number.isFinite(v) && v > 0
      ),
      successRate: simpleAverage(models, 'success_rate', Number.isFinite),
    }
  }, [models])

  const topModels = useMemo(() => models.slice(0, TOP_MODEL_LIMIT), [models])
  const loading = metricsQuery.isLoading
  const hasData = models.length > 0

  return (
    <Panel className='h-full'>
      <PanelHeader
        eyebrow={t('performance')}
        title={t('Performance health')}
        actions={
          <span className='text-muted-foreground font-mono text-[11px]'>
            {t('Performance metrics for the last 24 hours')}
          </span>
        }
      />
      <div className='space-y-4 p-4 sm:p-5'>
        <StatCardRow columns={3}>
          <StatCard
            size='sm'
            icon={<HeartPulse />}
            label={t('Success rate')}
            value={
              <AnimatedNumber
                value={summary.successRate}
                format={formatUptimePct}
              />
            }
            loading={loading}
          />
          <StatCard
            size='sm'
            icon={<Timer />}
            label={t('Average latency')}
            value={
              <AnimatedNumber
                value={summary.avgLatencyMs}
                format={formatLatency}
              />
            }
            loading={loading}
          />
          <StatCard
            size='sm'
            icon={<Gauge />}
            label={t('Throughput')}
            value={
              <AnimatedNumber
                value={summary.avgTps}
                format={formatThroughput}
              />
            }
            loading={loading}
          />
        </StatCardRow>

        {metricsQuery.isError ? (
          <p className='text-muted-foreground text-center text-sm'>
            {t('Failed to load')}
          </p>
        ) : loading ? (
          <div className='space-y-1'>
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className='h-6 w-full rounded' />
            ))}
          </div>
        ) : !hasData ? (
          <p className='text-muted-foreground py-4 text-center text-sm'>
            {t('No performance data yet')}
          </p>
        ) : (
            <div className='overflow-hidden rounded-md border'>
              <table className='w-full text-sm'>
                <thead className='bg-surface-2'>
                  <tr className='text-muted-foreground border-b font-mono text-[10px] tracking-[0.06em] uppercase'>
                    <th className='px-3 py-2 text-left font-medium'>
                      {t('Model')}
                    </th>
                    <th className='px-3 py-2 text-left font-medium'>
                      {t('Status')}
                    </th>
                    <th className='px-3 py-2 text-right font-medium'>
                      {t('Success rate')}
                    </th>
                    <th className='hidden px-3 py-2 text-right font-medium sm:table-cell'>
                      {t('Average latency')}
                    </th>
                    <th className='hidden px-3 py-2 text-right font-medium sm:table-cell'>
                      {t('Throughput')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topModels.map((model) => {
                    const health = healthFor(model.success_rate)
                    return (
                      <tr
                        key={model.model_name}
                        className='border-divider hover:bg-surface-hover border-b transition-colors last:border-b-0'
                      >
                        <td className='max-w-44 truncate px-3 py-2 font-mono text-xs'>
                          {model.model_name}
                        </td>
                        <td className='px-3 py-2'>
                          <StatusBadge
                            appearance='soft'
                            variant={health.variant}
                            label={t(health.label)}
                            copyable={false}
                          />
                        </td>
                        <td className='px-3 py-2'>
                          <MonoCell className='text-xs'>
                            {formatUptimePct(model.success_rate)}
                          </MonoCell>
                        </td>
                        <td className='hidden px-3 py-2 sm:table-cell'>
                          <MonoCell className='text-xs'>
                            {formatLatency(model.avg_latency_ms)}
                          </MonoCell>
                        </td>
                        <td className='hidden px-3 py-2 sm:table-cell'>
                          <MonoCell className='text-xs'>
                            {formatThroughput(model.avg_tps)}
                          </MonoCell>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
        )}
      </div>
    </Panel>
  )
}
