import { useTranslation } from 'react-i18next'
import { AnimatedNumber } from '@/components/ui/animated-number'
import { Metric, MetricsRow } from '@/components/patterns'
import type { PlanRecord } from '../types'

type SubscriptionsStatCardsProps = {
  /**
   * The full plan list as loaded by the table. The admin plans endpoint
   * returns every plan without server-side pagination (the table paginates
   * client-side), so these aggregates cover all plans, not just the
   * visible page (r2-B10 §3).
   */
  plans: PlanRecord[]
  loading?: boolean
}

/**
 * Stat header for /subscriptions: Total plans / Enabled / Enabled value.
 * The design's MRR tile has no backing data, so it was swapped for the
 * summed price of enabled plans ("Enabled value", r2-B10 §3). Currency is
 * pinned to USD by the plan form, hence the `$` prefix.
 */
export function SubscriptionsStatCards({
  plans,
  loading,
}: SubscriptionsStatCardsProps) {
  const { t } = useTranslation()

  const enabledPlans = plans.filter((record) => record.plan.enabled)
  const enabledValue = enabledPlans.reduce(
    (sum, record) => sum + Number(record.plan.price_amount || 0),
    0
  )

  return (
    <MetricsRow loading={loading} count={3}>
      <Metric k={t('Total plans')} v={<AnimatedNumber value={plans.length} />} />
      <Metric
        k={t('Enabled')}
        v={<AnimatedNumber value={enabledPlans.length} />}
      />
      <Metric
        k={t('Enabled value')}
        v={
          <AnimatedNumber
            value={enabledValue}
            format={(n) => `$${n.toFixed(2)}`}
          />
        }
      />
    </MetricsRow>
  )
}
