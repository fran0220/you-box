/*
Copyright (C) 2023-2026 QuantumNous
*/

export type LatencyTimePoint = {
  timestamp: string
  group: string
  ttft_ms: number
}

export type UptimeDayPoint = {
  date: string
  uptime_pct: number
  incidents: number
  outage_minutes: number
}

export function aggregateUptime(points: UptimeDayPoint[]): {
  uptime_pct: number
  incidents: number
  outage_minutes: number
} {
  if (points.length === 0) {
    return { uptime_pct: 0, incidents: 0, outage_minutes: 0 }
  }
  const incidents = points.reduce((s, p) => s + p.incidents, 0)
  const outageMinutes = points.reduce((s, p) => s + p.outage_minutes, 0)
  const totalMinutes = points.length * 1_440
  const uptimePct = ((totalMinutes - outageMinutes) / totalMinutes) * 100
  return {
    incidents,
    outage_minutes: outageMinutes,
    uptime_pct: Math.round(uptimePct * 1000) / 1000,
  }
}
