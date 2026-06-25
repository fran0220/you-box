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
import { useStatus } from '@/hooks/use-status'
import { getPricing } from '../api'
import { buildModelStats, buildSupportedParameters } from '../lib/mock-stats'
import { deriveModelMetadata } from '../lib/model-metadata'
import {
  getInputPriceUsdPerM,
  getOutputPriceUsdPerM,
} from '../lib/model-helpers'
import type { EnrichedPricingModel } from '../types'

export function usePricingData() {
  const { status } = useStatus()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['pricing'],
    queryFn: getPricing,
    staleTime: 5 * 60 * 1000,
  })

  // Ensure rates never reach zero to prevent division errors
  const priceRate = useMemo(
    () => Math.max((status?.price as number) ?? 1, 0.001),
    [status?.price]
  )
  const usdExchangeRate = useMemo(
    () => Math.max((status?.usd_exchange_rate as number) ?? priceRate, 0.001),
    [status?.usd_exchange_rate, priceRate]
  )

  // Models are enriched with derived metadata (series/context/modalities/
  // supported-params) and PLACEHOLDER usage stats (tokens/week, growth,
  // latency) so the OpenRouter-style list can render without a metrics
  // backend. Raw PricingModel fields are preserved verbatim, so existing
  // consumers that read `model.model_name`, `model.model_ratio`, etc. keep
  // working. New consumers read `model.stats` / `model.meta` / the flattened
  // `promptPriceUsdPerM`. Stats are seeded by model name → stable on refresh.
  const models = useMemo<EnrichedPricingModel[]>(() => {
    if (!data?.data || !data?.vendors) return []

    const vendorMap = new Map(data.vendors.map((v) => [v.id, v]))

    return data.data.map((model) => {
      const vendor = model.vendor_id
        ? vendorMap.get(model.vendor_id)
        : undefined
      const base = {
        ...model,
        key: model.model_name,
        vendor_name: vendor?.name,
        vendor_icon: vendor?.icon,
        vendor_description: vendor?.description,
        group_ratio: data.group_ratio,
      }
      const supportedParameters = buildSupportedParameters(base).map(
        (p) => p.name
      )
      return {
        ...base,
        stats: buildModelStats(base),
        meta: deriveModelMetadata(base, supportedParameters),
        promptPriceUsdPerM: getInputPriceUsdPerM(base),
        completionPriceUsdPerM: getOutputPriceUsdPerM(base),
      }
    })
  }, [data])

  return {
    models,
    vendors: data?.vendors ?? [],
    groupRatio: data?.group_ratio ?? {},
    usableGroup: data?.usable_group ?? {},
    endpointMap: data?.supported_endpoint ?? {},
    autoGroups: data?.auto_groups ?? [],
    isLoading,
    error,
    refetch,
    priceRate,
    usdExchangeRate,
  }
}
