import { useTranslation } from 'react-i18next'
import { formatNumber, formatQuota } from '@/lib/format'
import { AnimatedNumber } from '@/components/ui/animated-number'
import { Metric, MetricsRow } from '@/components/patterns'
import { USER_ROLE, USER_STATUS } from '../constants'
import type { User } from '../types'

type UsersStatCardsProps = {
  /**
   * Users of the CURRENT page only. There is no global user-stats
   * endpoint, so Admins / Banned / Total balance aggregate over the
   * loaded page; only Total uses the API pagination total.
   */
  users: User[]
  total: number
  loading?: boolean
}

/**
 * Stat summary for /users: Total / Admins / Banned / Total balance
 * as an inline metric row.
 */
export function UsersStatCards({ users, total, loading }: UsersStatCardsProps) {
  const { t } = useTranslation()

  const admins = users.filter((u) => u.role >= USER_ROLE.ADMIN).length
  const banned = users.filter((u) => u.status !== USER_STATUS.ENABLED).length
  const balance = users.reduce((sum, u) => sum + (u.quota || 0), 0)

  return (
    <MetricsRow loading={loading} count={4}>
      <Metric
        k={t('Total users')}
        v={<AnimatedNumber value={total} format={formatNumber} />}
      />
      <Metric
        k={t('Admins')}
        v={<AnimatedNumber value={admins} format={formatNumber} />}
      />
      <Metric
        k={t('Banned')}
        v={<AnimatedNumber value={banned} format={formatNumber} />}
      />
      <Metric
        k={t('Total balance')}
        v={<AnimatedNumber value={balance} format={formatQuota} />}
      />
    </MetricsRow>
  )
}
