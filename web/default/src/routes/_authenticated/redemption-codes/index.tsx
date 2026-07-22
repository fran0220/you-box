import z from 'zod'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { createLazyRouteComponent } from '@/lib/lazy-route-component'
import { ROLE } from '@/lib/roles'
import { REDEMPTION_STATUS_VALUES } from '@/features/redemption-codes/constants'

const Redemptions = createLazyRouteComponent(async () => ({
  default: (await import('@/features/redemption-codes')).Redemptions,
}))

const redemptionsSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  filter: z.string().optional().catch(''),
  status: z.array(z.enum(REDEMPTION_STATUS_VALUES)).optional().catch([]),
})

export const Route = createFileRoute('/_authenticated/redemption-codes/')({
  beforeLoad: () => {
    const { auth } = useAuthStore.getState()

    if (!auth.user || auth.user.role < ROLE.ADMIN) {
      throw redirect({
        to: '/403',
      })
    }
  },
  validateSearch: redemptionsSearchSchema,
  component: Redemptions,
})
