import { useTranslation } from 'react-i18next'
import { formatNumber, formatQuota } from '@/lib/format'
import { AnimatedNumber } from '@/components/ui/animated-number'
import { Metric, MetricsRow } from '@/components/patterns'
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
    <MetricsRow loading={loading} count={3}>
      <Metric
        k={t('Codes issued')}
        v={<AnimatedNumber value={total} format={formatNumber} />}
      />
      <Metric
        k={t('Unused')}
        v={<AnimatedNumber value={unused} format={formatNumber} />}
      />
      <Metric
        k={t('Redeemed value')}
        v={<AnimatedNumber value={redeemedValue} format={formatQuota} />}
      />
    </MetricsRow>
  )
}
