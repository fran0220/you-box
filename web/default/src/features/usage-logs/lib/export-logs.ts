import type { UsageLog } from '../data/schema'
import { fetchLogsByCategory } from './utils'

const EXPORT_PAGE_SIZE = 100
// Safety cap so an unbounded date range cannot pull an unbounded export.
const MAX_EXPORT_ROWS = 10000

export interface ExportLogsConfig {
  isAdmin: boolean
  searchParams: Record<string, unknown>
  columnFilters: Array<{ id: string; value: unknown }>
}

export interface ExportLogsResult {
  exported: number
  total: number
  /** True when the export hit MAX_EXPORT_ROWS before fetching everything. */
  truncated: boolean
}

function csvEscape(value: unknown): string {
  const s = value == null ? '' : String(value)
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

function toCsv(rows: string[][]): string {
  return rows.map((row) => row.map(csvEscape).join(',')).join('\r\n')
}

function triggerDownload(filename: string, csv: string) {
  // Prefix a BOM so Excel detects UTF-8 (model/user names may be non-ASCII).
  const blob = new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Export the currently-filtered common usage logs to a CSV file. Pages through
 * the same endpoint the table uses (so filters/date range match exactly),
 * bounded by MAX_EXPORT_ROWS.
 */
export async function exportCommonLogsCsv(
  config: ExportLogsConfig
): Promise<ExportLogsResult> {
  const items: UsageLog[] = []
  let total = 0
  let page = 1

  while (items.length < MAX_EXPORT_ROWS) {
    const res = await fetchLogsByCategory({
      logCategory: 'common',
      isAdmin: config.isAdmin,
      page,
      pageSize: EXPORT_PAGE_SIZE,
      searchParams: config.searchParams,
      columnFilters: config.columnFilters,
    })

    if (!res?.success) break
    const data = res.data
    total = data?.total ?? 0
    const batch = (data?.items ?? []) as UsageLog[]
    items.push(...batch)

    if (batch.length < EXPORT_PAGE_SIZE) break
    if (items.length >= total) break
    page += 1
  }

  const exported = Math.min(items.length, MAX_EXPORT_ROWS)
  const rows: string[][] = [
    [
      'time',
      'type',
      'model',
      'token',
      'user',
      'channel',
      'prompt_tokens',
      'completion_tokens',
      'total_tokens',
      'use_time_s',
      'quota',
      'group',
      'request_id',
    ],
  ]

  for (const log of items.slice(0, MAX_EXPORT_ROWS)) {
    rows.push([
      new Date(log.created_at * 1000).toISOString(),
      String(log.type),
      log.model_name,
      log.token_name,
      log.username,
      log.channel_name || (log.channel ? String(log.channel) : ''),
      String(log.prompt_tokens),
      String(log.completion_tokens),
      String(log.prompt_tokens + log.completion_tokens),
      String(log.use_time),
      String(log.quota),
      log.group,
      log.request_id,
    ])
  }

  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
  triggerDownload(`usage-logs-${stamp}.csv`, toCsv(rows))

  return { exported, total, truncated: total > exported }
}
