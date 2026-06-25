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
import { Server } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { GroupBadge } from '@/components/group-badge'
import {
  formatLatency,
  formatThroughput,
  formatUptimePct,
} from '@/features/performance-metrics/lib/format'
import { getAvailableGroups, isTokenBasedModel } from '../lib/model-helpers'
import {
  buildGroupPerformance,
  buildUptimeSeries,
} from '../lib/mock-stats'
import { formatFixedPrice, formatGroupPrice } from '../lib/price'
import type { PriceType, PricingModel, TokenUnit } from '../types'
import { UptimeSparkline } from './model-details-uptime-sparkline'

// ----------------------------------------------------------------------------
// Providers / Groups comparison table (OpenRouter signature)
// ----------------------------------------------------------------------------
//
// OpenRouter's detail page leads with a "Providers" table that puts every
// serving route side by side: price, latency, throughput, uptime. We don't
// have multiple upstream providers per model, but we DO route a model through
// distinct token groups, each with its own ratio (and therefore price). So we
// treat each enabled GROUP as a "provider" row and decorate it with the
// PLACEHOLDER performance signals from mock-stats (seeded by model name +
// group, so the numbers are stable across renders/refresh).
//
// When the backend ships real per-route metrics, swap buildGroupPerformance
// for the real endpoint; the table shape already mirrors what we expect back.

type ModelDetailsProvidersProps = {
  model: PricingModel
  groupRatio: Record<string, number>
  usableGroup: Record<string, { desc: string; ratio: number }>
  priceRate: number
  usdExchangeRate: number
  tokenUnit: TokenUnit
  showRechargePrice?: boolean
}

export function ModelDetailsProviders(props: ModelDetailsProvidersProps) {
  const { t } = useTranslation()
  const showRechargePrice = props.showRechargePrice ?? false
  const isTokenBased = isTokenBasedModel(props.model)
  const tokenUnitLabel = props.tokenUnit === 'K' ? '1K' : '1M'

  const availableGroups = useMemo(
    () => getAvailableGroups(props.model, props.usableGroup || {}),
    [props.model, props.usableGroup]
  )

  // Performance is keyed by group name; build a lookup so we can pair each
  // pricing row with its placeholder latency/throughput/uptime.
  const performanceByGroup = useMemo(() => {
    const map = new Map<
      string,
      ReturnType<typeof buildGroupPerformance>[number]
    >()
    for (const perf of buildGroupPerformance(props.model)) {
      map.set(perf.group, perf)
    }
    return map
  }, [props.model])

  // 30-day uptime series per group for the inline sparkline.
  const uptimeByGroup = useMemo(() => {
    const map = new Map<string, ReturnType<typeof buildUptimeSeries>>()
    for (const group of availableGroups) {
      map.set(group, buildUptimeSeries(props.model, group))
    }
    return map
  }, [availableGroups, props.model])

  if (availableGroups.length === 0) return null

  const thClass =
    'text-muted-foreground py-2 text-[10px] font-medium tracking-wider uppercase'

  const renderPrice = (group: string, type: PriceType) =>
    formatGroupPrice(
      props.model,
      group,
      type,
      props.tokenUnit,
      showRechargePrice,
      props.priceRate,
      props.usdExchangeRate,
      props.groupRatio
    )

  return (
    <section>
      <div className='mb-2 flex items-center gap-1.5'>
        <Server className='text-muted-foreground/70 size-3.5' />
        <h3 className='text-foreground text-sm font-semibold'>
          {t('Providers')}
        </h3>
      </div>
      <p className='text-muted-foreground/80 mb-3 text-xs'>
        {t('Routing options for this model, compared by price and performance.')}
      </p>

      <div className='-mx-4 overflow-x-auto sm:mx-0'>
        <Table className='text-sm'>
          <TableHeader>
            <TableRow className='hover:bg-transparent'>
              <TableHead className={thClass}>{t('Group')}</TableHead>
              {isTokenBased ? (
                <>
                  <TableHead className={`${thClass} text-right`}>
                    {t('Input')}
                  </TableHead>
                  <TableHead className={`${thClass} text-right`}>
                    {t('Output')}
                  </TableHead>
                </>
              ) : (
                <TableHead className={`${thClass} text-right`}>
                  {t('Price')}
                </TableHead>
              )}
              <TableHead className={`${thClass} text-right`}>
                {t('Latency')}
              </TableHead>
              <TableHead className={`${thClass} text-right`}>
                {t('Throughput')}
              </TableHead>
              <TableHead className={`${thClass} min-w-[150px] text-left`}>
                {t('Uptime')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {availableGroups.map((group) => {
              const perf = performanceByGroup.get(group)
              const uptimeSeries = uptimeByGroup.get(group) ?? []
              return (
                <TableRow key={group}>
                  <TableCell className='py-2.5'>
                    <GroupBadge group={group} size='sm' />
                  </TableCell>
                  {isTokenBased ? (
                    <>
                      <TableCell className='py-2.5 text-right font-mono'>
                        {renderPrice(group, 'input')}
                      </TableCell>
                      <TableCell className='py-2.5 text-right font-mono'>
                        {renderPrice(group, 'output')}
                      </TableCell>
                    </>
                  ) : (
                    <TableCell className='py-2.5 text-right font-mono'>
                      {formatFixedPrice(
                        props.model,
                        group,
                        showRechargePrice,
                        props.priceRate,
                        props.usdExchangeRate,
                        props.groupRatio
                      )}
                    </TableCell>
                  )}
                  <TableCell className='py-2.5 text-right font-mono'>
                    {perf ? formatLatency(perf.ttft_p50_ms) : '—'}
                  </TableCell>
                  <TableCell className='py-2.5 text-right font-mono'>
                    {perf && perf.throughput_tps > 0
                      ? formatThroughput(perf.throughput_tps)
                      : '—'}
                  </TableCell>
                  <TableCell className='py-2.5'>
                    {uptimeSeries.length > 0 ? (
                      <UptimeSparkline size='sm' series={uptimeSeries} />
                    ) : perf ? (
                      <span className='text-muted-foreground font-mono text-sm'>
                        {formatUptimePct(perf.uptime_30d_pct)}
                      </span>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <p className='text-muted-foreground/40 mt-1.5 px-4 text-[10px] sm:px-0'>
        {isTokenBased ? `${t('Prices shown per')} ${tokenUnitLabel} tokens · ` : ''}
        {t('Latency, throughput, and uptime are placeholder estimates.')}
      </p>
    </section>
  )
}
