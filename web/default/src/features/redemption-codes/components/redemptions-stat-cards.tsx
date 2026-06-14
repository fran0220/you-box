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
import { CircleDashed, Ticket, Wallet } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatNumber, formatQuota } from '@/lib/format'
import { AnimatedNumber } from '@/components/ui/animated-number'
import { StatCard, StatCardRow } from '@/components/patterns'
import { REDEMPTION_STATUS } from '../constants'
import type { Redemption } from '../types'

type RedemptionsStatCardsProps = {
  /**
   * Redemptions of the CURRENT page only. There is no global
   * redemption-stats endpoint, so Unused / Redeemed value aggregate over
   * the loaded page (r2-B9 §2, mirroring the users/channels stat
   * headers); only Codes issued uses the API pagination total.
   */
  redemptions: Redemption[]
  total: number
  loading?: boolean
}

/**
 * Stat header for /redemption-codes: Codes issued / Unused / Redeemed
 * value. The design's "Active" and "Value redeemed" tiles map to Unused
 * (status=1 count) and the redeemed-quota sum per data semantics
 * (r2-B9 §2).
 */
export function RedemptionsStatCards({
  redemptions,
  total,
  loading,
}: RedemptionsStatCardsProps) {
  const { t } = useTranslation()

  const unused = redemptions.filter(
    (r) => r.status === REDEMPTION_STATUS.ENABLED
  ).length
  const redeemedValue = redemptions
    .filter((r) => r.status === REDEMPTION_STATUS.USED)
    .reduce((sum, r) => sum + (r.quota || 0), 0)

  return (
    <StatCardRow columns={3}>
      <StatCard
        size='sm'
        label={t('Codes issued')}
        icon={<Ticket />}
        value={<AnimatedNumber value={total} format={formatNumber} />}
        loading={loading}
      />
      <StatCard
        size='sm'
        label={t('Unused')}
        icon={<CircleDashed />}
        value={<AnimatedNumber value={unused} format={formatNumber} />}
        loading={loading}
      />
      <StatCard
        size='sm'
        label={t('Redeemed value')}
        icon={<Wallet />}
        value={<AnimatedNumber value={redeemedValue} format={formatQuota} />}
        loading={loading}
      />
    </StatCardRow>
  )
}
