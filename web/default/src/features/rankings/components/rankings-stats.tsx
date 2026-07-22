import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { AnimatedNumber } from '@/components/ui/animated-number'
import { StatCard, StatCardRow } from '@/components/patterns'
import { formatTokens } from '../lib/format'
import type { ModelHistorySeries, ModelRanking, VendorRanking } from '../types'

type RankingsStatsProps = {
  models: ModelRanking[]
  vendors: VendorRanking[]
  history: ModelHistorySeries
}

/**
 * Four headline StatCards under the rankings hero (R2-B14 #7): total
 * tokens served in the period (with a per-bucket sparkline), ranked model
 * count, vendor count, and the fastest-growing model. All values are
 * aggregated from the same snapshot the sections below render, so the
 * design vocabulary maps onto data we actually have (recorded adaptation).
 */
export function RankingsStats(props: RankingsStatsProps) {
  const { t } = useTranslation()

  const totalTokens = useMemo(
    () => props.models.reduce((sum, row) => sum + row.total_tokens, 0),
    [props.models]
  )

  // Aggregate the stacked-bar history into one total-per-bucket series for
  // the Tokens sparkline.
  const tokensSparkline = useMemo(() => {
    const byTs = new Map<string, number>()
    for (const point of props.history.points) {
      byTs.set(point.ts, (byTs.get(point.ts) ?? 0) + point.tokens)
    }
    return Array.from(byTs.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, tokens]) => tokens)
  }, [props.history])

  const topGrowth = useMemo(() => {
    let best: ModelRanking | null = null
    for (const row of props.models) {
      if (!Number.isFinite(row.growth_pct)) continue
      if (best === null || row.growth_pct > best.growth_pct) {
        best = row
      }
    }
    return best
  }, [props.models])

  if (props.models.length === 0) return null

  return (
    <StatCardRow columns={4}>
      <StatCard
        size='sm'
        label={t('Tokens')}
        value={<AnimatedNumber value={totalTokens} format={formatTokens} />}
        sparkline={tokensSparkline.length > 1 ? tokensSparkline : undefined}
      />
      <StatCard
        size='sm'
        label={t('Models')}
        value={<AnimatedNumber value={props.models.length} />}
      />
      <StatCard
        size='sm'
        label={t('Vendors')}
        value={<AnimatedNumber value={props.vendors.length} />}
      />
      {topGrowth && (
        <StatCard
          size='sm'
          label={t('Top growth')}
          value={
            <span className='block max-w-full truncate font-mono text-base font-semibold tracking-normal'>
              {topGrowth.model_name}
            </span>
          }
          delta={{
            direction:
              topGrowth.growth_pct > 0
                ? 'up'
                : topGrowth.growth_pct < 0
                  ? 'down'
                  : 'flat',
            label: `${Math.abs(topGrowth.growth_pct).toFixed(
              Math.abs(topGrowth.growth_pct) >= 100 ? 0 : 1
            )}%`,
          }}
        />
      )}
    </StatCardRow>
  )
}
