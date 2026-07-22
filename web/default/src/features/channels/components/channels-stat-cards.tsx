import { useTranslation } from 'react-i18next'
import { formatNumber } from '@/lib/format'
import { AnimatedNumber } from '@/components/ui/animated-number'
import { Metric, MetricsRow } from '@/components/patterns'
import { CHANNEL_STATUS } from '../constants'
import type { Channel } from '../types'

/**
 * Latency ceiling (ms) for an enabled channel to count as healthy.
 * Matches the LatencyBadge `warnMs` threshold used in the table.
 */
const HEALTHY_LATENCY_MS = 3000

type ChannelsStatCardsProps = {
  /**
   * Raw channels of the CURRENT page (before tag aggregation).
   * There is no global channel-health endpoint, so Healthy / Degraded /
   * Offline aggregate over the loaded page only (r2-B7 §2); Total uses
   * the API pagination total.
   */
  channels: Channel[]
  total: number
  loading?: boolean
}

/**
 * Stat header for /channels: Total / Healthy / Degraded / Offline.
 * Healthy = enabled and fast (or never tested); Degraded = enabled but
 * slower than the latency ceiling; Offline = manually or auto disabled.
 */
export function ChannelsStatCards({
  channels,
  total,
  loading,
}: ChannelsStatCardsProps) {
  const { t } = useTranslation()

  const enabled = channels.filter((c) => c.status === CHANNEL_STATUS.ENABLED)
  // Untested channels (response_time === 0) count as healthy until proven slow.
  const degraded = enabled.filter(
    (c) => (c.response_time || 0) > HEALTHY_LATENCY_MS
  ).length
  const healthy = enabled.length - degraded
  const offline = channels.length - enabled.length

  return (
    <MetricsRow loading={loading} count={4}>
      <Metric
        k={t('Total channels')}
        v={<AnimatedNumber value={total} format={formatNumber} />}
      />
      <Metric
        k={t('Healthy')}
        v={<AnimatedNumber value={healthy} format={formatNumber} />}
      />
      <Metric
        k={t('Degraded')}
        v={<AnimatedNumber value={degraded} format={formatNumber} />}
      />
      <Metric
        k={t('Offline')}
        v={<AnimatedNumber value={offline} format={formatNumber} />}
      />
    </MetricsRow>
  )
}
