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
import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getPerfMetricsSummary } from '@/features/performance-metrics/api'
import { DEFAULT_TOKEN_UNIT } from '../constants'
import type { EnrichedPricingModel, TokenUnit } from '../types'
import { ModelCard } from './model-card'
import type { ModelPerfBadgeData } from './model-perf-badge'

export interface ModelCardGridProps {
  models: EnrichedPricingModel[]
  priceRate?: number
  usdExchangeRate?: number
  tokenUnit?: TokenUnit
  showRechargePrice?: boolean
}

/**
 * Optional card-grid view (demoted from the default). Renders the FULL filtered
 * catalog with no pagination — the dense list is the primary surface; cards are
 * a visual alternative the user opts into.
 */
export function ModelCardGrid(props: ModelCardGridProps) {
  // One-shot stagger: animate cards only briefly after mount / view-switch so
  // filtering/search doesn't re-animate on every keystroke.
  const [staggering, setStaggering] = useState(true)
  useEffect(() => {
    const timer = setTimeout(() => setStaggering(false), 700)
    return () => clearTimeout(timer)
  }, [])
  const tokenUnit = props.tokenUnit ?? DEFAULT_TOKEN_UNIT

  const perfQuery = useQuery({
    queryKey: ['perf-metrics-summary', 24],
    queryFn: () => getPerfMetricsSummary(24),
    staleTime: 60 * 1000,
    retry: false,
  })

  const perfMap = useMemo(() => {
    const map = new Map<string, ModelPerfBadgeData>()
    for (const model of perfQuery.data?.data?.models ?? []) {
      map.set(model.model_name, model)
    }
    return map
  }, [perfQuery.data])

  if (props.models.length === 0) {
    return null
  }

  return (
    <div
      className='grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3'
      data-grid-stagger={staggering ? '' : undefined}
    >
      {props.models.map((model) => (
        <ModelCard
          key={model.id ?? model.model_name}
          model={model}
          tokenUnit={tokenUnit}
          priceRate={props.priceRate}
          usdExchangeRate={props.usdExchangeRate}
          showRechargePrice={props.showRechargePrice}
          perf={perfMap.get(model.model_name || '')}
        />
      ))}
    </div>
  )
}
