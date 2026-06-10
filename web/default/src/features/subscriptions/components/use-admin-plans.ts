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
import { useQuery } from '@tanstack/react-query'
import { getAdminPlans } from '../api'
import type { PlanRecord } from '../types'
import { useSubscriptions } from './subscriptions-provider'

/**
 * Shared admin plan list query (r2-B10). Both the management table and
 * the collapsible plan preview panel consume this hook; the identical
 * queryKey lets React Query dedupe them into a single fetch, and the
 * provider's refreshTrigger keeps both in sync after mutations.
 */
export function useAdminPlans() {
  const { refreshTrigger } = useSubscriptions()

  return useQuery<PlanRecord[]>({
    queryKey: ['admin-subscription-plans', refreshTrigger],
    queryFn: async () => {
      const result = await getAdminPlans()
      return result.data || []
    },
    placeholderData: (prev) => prev,
  })
}
