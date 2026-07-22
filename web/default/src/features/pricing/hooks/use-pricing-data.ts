import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import { useStatus } from '@/hooks/use-status'
import { getPricing } from '../api'
import {
  getInputPriceUsdPerM,
  getOutputPriceUsdPerM,
} from '../lib/model-helpers'
import type { EnrichedPricingModel } from '../types'

function translateCatalogText(
  t: TFunction,
  key: string | undefined,
  fallback: string | undefined
): string | undefined {
  const translationKey = key || fallback
  if (!translationKey) return fallback

  return t(translationKey, { defaultValue: fallback ?? translationKey })
}

export function usePricingData() {
  const { t } = useTranslation()
  const { status } = useStatus()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['pricing'],
    queryFn: getPricing,
    staleTime: 5 * 60 * 1000,
  })

  const priceRate = useMemo(
    () => Math.max((status?.price as number) ?? 1, 0.001),
    [status?.price]
  )
  const usdExchangeRate = useMemo(
    () => Math.max((status?.usd_exchange_rate as number) ?? priceRate, 0.001),
    [status?.usd_exchange_rate, priceRate]
  )

  const models = useMemo<EnrichedPricingModel[]>(() => {
    if (!data?.data || !data?.vendors) return []

    const vendorMap = new Map(data.vendors.map((v) => [v.id, v]))

    return data.data.map((model) => {
      const vendor = model.vendor_id
        ? vendorMap.get(model.vendor_id)
        : undefined
      const description = translateCatalogText(
        t,
        model.description_key,
        model.description
      )
      const vendorDescription = translateCatalogText(
        t,
        vendor?.description_key,
        vendor?.description
      )
      const base = {
        ...model,
        description,
        key: model.model_name,
        vendor_name: vendor?.name,
        vendor_icon: vendor?.icon,
        vendor_description: vendorDescription,
        vendor_description_key: vendor?.description_key,
        group_ratio: data.group_ratio,
      }
      return {
        ...base,
        promptPriceUsdPerM: getInputPriceUsdPerM(base),
        completionPriceUsdPerM: getOutputPriceUsdPerM(base),
      }
    })
  }, [data, t])

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
