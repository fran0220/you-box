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
