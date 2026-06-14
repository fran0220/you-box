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
import { CircleDollarSign, Layers, ToggleRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AnimatedNumber } from '@/components/ui/animated-number'
import { StatCard, StatCardRow } from '@/components/patterns'
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
    <StatCardRow columns={3}>
      <StatCard
        size='sm'
        label={t('Total plans')}
        icon={<Layers />}
        value={<AnimatedNumber value={plans.length} />}
        loading={loading}
      />
      <StatCard
        size='sm'
        label={t('Enabled')}
        icon={<ToggleRight />}
        value={<AnimatedNumber value={enabledPlans.length} />}
        loading={loading}
      />
      <StatCard
        size='sm'
        label={t('Enabled value')}
        icon={<CircleDollarSign />}
        value={
          <AnimatedNumber
            value={enabledValue}
            format={(n) => `$${n.toFixed(2)}`}
          />
        }
        loading={loading}
      />
    </StatCardRow>
  )
}
