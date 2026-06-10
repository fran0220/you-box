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
import { Activity, AlertTriangle, PowerOff, Server } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatNumber } from '@/lib/format'
import { StatCard, StatCardRow } from '@/components/patterns'
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
    <StatCardRow columns={4}>
      <StatCard
        size='sm'
        label={t('Total channels')}
        icon={<Server />}
        value={formatNumber(total)}
        loading={loading}
      />
      <StatCard
        size='sm'
        label={t('Healthy')}
        icon={<Activity />}
        value={formatNumber(healthy)}
        loading={loading}
      />
      <StatCard
        size='sm'
        label={t('Degraded')}
        icon={<AlertTriangle />}
        value={formatNumber(degraded)}
        loading={loading}
      />
      <StatCard
        size='sm'
        label={t('Offline')}
        icon={<PowerOff />}
        value={formatNumber(offline)}
        loading={loading}
      />
    </StatCardRow>
  )
}
