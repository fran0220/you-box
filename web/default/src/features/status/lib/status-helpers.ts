import type { StatusVariant } from '@/components/status-badge'
import type { UptimeGroupResult, UptimeMonitor } from '@/features/dashboard/types'
import type { PerfModelSummary } from '@/features/performance-metrics/types'

export type OverallHealth = {
  label: string
  variant: StatusVariant
  description: string
}

export function healthForSuccessRate(rate: number): OverallHealth {
  if (!Number.isFinite(rate)) {
    return {
      label: 'Unknown',
      variant: 'neutral',
      description: 'Metrics unavailable',
    }
  }
  if (rate >= 99.9) {
    return {
      label: 'All systems operational',
      variant: 'success',
      description: 'All monitored services are healthy',
    }
  }
  if (rate >= 99) {
    return {
      label: 'Partial degradation',
      variant: 'warning',
      description: 'Some services are experiencing issues',
    }
  }
  return {
    label: 'Major outage',
    variant: 'danger',
    description: 'Multiple services are down or degraded',
  }
}

export function flattenMonitors(groups: UptimeGroupResult[]): UptimeMonitor[] {
  return groups.flatMap((group) => group.monitors ?? [])
}

export function averageMonitorUptime(monitors: UptimeMonitor[]): number {
  if (monitors.length === 0) return NaN
  const total = monitors.reduce((sum, monitor) => sum + (monitor.uptime ?? 0), 0)
  return (total / monitors.length) * 100
}

export function worstMonitorStatus(monitors: UptimeMonitor[]): number {
  if (monitors.length === 0) return 1
  return monitors.reduce(
    (worst, monitor) => (monitor.status < worst ? monitor.status : worst),
    1
  )
}

export function monitorStatusVariant(status: number): StatusVariant {
  if (status === 1) return 'success'
  if (status === 2) return 'warning'
  if (status === 0) return 'danger'
  return 'info'
}

export function monitorStatusLabel(status: number): string {
  if (status === 1) return 'Operational'
  if (status === 2) return 'Degraded'
  if (status === 0) return 'Down'
  return 'Info'
}

export function averageLatencyMs(models: PerfModelSummary[]): number {
  let total = 0
  let count = 0
  for (const row of models) {
    const value = Number(row.avg_latency_ms)
    if (!Number.isFinite(value) || value <= 0) continue
    total += value
    count++
  }
  return count > 0 ? total / count : NaN
}

export function averageErrorRate(models: PerfModelSummary[]): number {
  let total = 0
  let count = 0
  for (const row of models) {
    const rate = Number(row.success_rate)
    if (!Number.isFinite(rate)) continue
    total += 100 - rate
    count++
  }
  return count > 0 ? total / count : NaN
}

function statusToBarClass(status: number): string {
  if (status === 1) return 'bg-success'
  if (status === 2) return 'bg-warning'
  if (status === 0) return 'bg-danger'
  return 'bg-muted-foreground/30'
}

export function buildUptimeBars(
  status: number,
  history?: number[],
  count = 40
): string[] {
  if (history && history.length > 0) {
    return history.map((value) => statusToBarClass(value))
  }
  const base = statusToBarClass(status)
  return Array.from({ length: count }, () => base)
}

export function hasLongUptimeWindow(monitors: UptimeMonitor[]): boolean {
  return monitors.some(
    (monitor) =>
      Number.isFinite(monitor.uptime) &&
      Number.isFinite(monitor.uptime_24h) &&
      Math.abs((monitor.uptime ?? 0) - (monitor.uptime_24h ?? 0)) > 0.0001
  )
}

export function incidentTitleFromContent(content: string): string {
  const trimmed = content.trim()
  if (!trimmed) return ''
  const firstLine = trimmed.split('\n')[0]?.trim() ?? ''
  const plain = firstLine.replace(/^#+\s*/, '').replace(/\*\*/g, '')
  if (plain.length <= 120) return plain
  const sentence = plain.match(/^[^.!?]+[.!?]?/)?.[0]?.trim()
  return sentence && sentence.length <= 120 ? sentence : `${plain.slice(0, 117)}…`
}