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
import type { PricingModel } from '@/features/pricing/types'
import type { PerfModelSummary } from '@/features/performance-metrics/types'
import { formatLatency } from '@/features/performance-metrics/lib/format'

export type VendorRollupRow = {
  vendor: string
  initials: string
  modelCount: number
  medianLatencyMs: number
  successRate: number
  latencyLabel: string
}

function vendorFromModel(
  modelName: string,
  vendorByModel: Map<string, string>
): string {
  const mapped = vendorByModel.get(modelName)
  if (mapped) return mapped
  const slash = modelName.indexOf('/')
  if (slash > 0) {
    const prefix = modelName.slice(0, slash).trim()
    if (prefix) return prefix.charAt(0).toUpperCase() + prefix.slice(1)
  }
  return modelName
}

function initialsForVendor(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

function median(values: number[]): number {
  if (values.length === 0) return NaN
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2
  }
  return sorted[mid]
}

export function buildVendorRollup(
  perfModels: PerfModelSummary[],
  pricingModels: PricingModel[]
): VendorRollupRow[] {
  const vendorByModel = new Map<string, string>()
  for (const model of pricingModels) {
    if (model.model_name && model.vendor_name) {
      vendorByModel.set(model.model_name, model.vendor_name)
    }
  }

  const buckets = new Map<
    string,
    { latencies: number[]; successRates: number[]; count: number }
  >()

  for (const row of perfModels) {
    const vendor = vendorFromModel(row.model_name, vendorByModel)
    const bucket = buckets.get(vendor) ?? {
      latencies: [],
      successRates: [],
      count: 0,
    }
    bucket.count += 1
    const latency = Number(row.avg_latency_ms)
    if (Number.isFinite(latency) && latency > 0) {
      bucket.latencies.push(latency)
    }
    const rate = Number(row.success_rate)
    if (Number.isFinite(rate)) {
      bucket.successRates.push(rate)
    }
    buckets.set(vendor, bucket)
  }

  return [...buckets.entries()]
    .map(([vendor, bucket]) => {
      const medianLatencyMs = median(bucket.latencies)
      const successRate =
        bucket.successRates.length > 0
          ? bucket.successRates.reduce((sum, v) => sum + v, 0) /
            bucket.successRates.length
          : NaN
      return {
        vendor,
        initials: initialsForVendor(vendor),
        modelCount: bucket.count,
        medianLatencyMs,
        successRate,
        latencyLabel: Number.isFinite(medianLatencyMs)
          ? formatLatency(medianLatencyMs)
          : '—',
      }
    })
    .sort((a, b) => b.modelCount - a.modelCount)
}