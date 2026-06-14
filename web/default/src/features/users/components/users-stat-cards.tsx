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
import { ShieldCheck, UserX, Users, Wallet } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatNumber, formatQuota } from '@/lib/format'
import { AnimatedNumber } from '@/components/ui/animated-number'
import { StatCard, StatCardRow } from '@/components/patterns'
import { USER_ROLE, USER_STATUS } from '../constants'
import type { User } from '../types'

type UsersStatCardsProps = {
  /**
   * Users of the CURRENT page only. There is no global user-stats
   * endpoint, so Admins / Banned / Total balance aggregate over the
   * loaded page (r2-B8 §2, mirroring the channels stat header); only
   * Total uses the API pagination total.
   */
  users: User[]
  total: number
  loading?: boolean
}

/**
 * Stat header for /users: Total / Admins / Banned / Total balance.
 * The design's "Active today" and "Paying" tiles have no backing
 * endpoint and were swapped for Admins / Banned (r2-B8 §2).
 */
export function UsersStatCards({ users, total, loading }: UsersStatCardsProps) {
  const { t } = useTranslation()

  const admins = users.filter((u) => u.role >= USER_ROLE.ADMIN).length
  const banned = users.filter((u) => u.status !== USER_STATUS.ENABLED).length
  const balance = users.reduce((sum, u) => sum + (u.quota || 0), 0)

  return (
    <StatCardRow columns={4}>
      <StatCard
        size='sm'
        label={t('Total users')}
        icon={<Users />}
        value={<AnimatedNumber value={total} format={formatNumber} />}
        loading={loading}
      />
      <StatCard
        size='sm'
        label={t('Admins')}
        icon={<ShieldCheck />}
        value={<AnimatedNumber value={admins} format={formatNumber} />}
        loading={loading}
      />
      <StatCard
        size='sm'
        label={t('Banned')}
        icon={<UserX />}
        value={<AnimatedNumber value={banned} format={formatNumber} />}
        loading={loading}
      />
      <StatCard
        size='sm'
        label={t('Total balance')}
        icon={<Wallet />}
        value={<AnimatedNumber value={balance} format={formatQuota} />}
        loading={loading}
      />
    </StatCardRow>
  )
}
