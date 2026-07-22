import z from 'zod'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { createLazyRouteComponent } from '@/lib/lazy-route-component'
import { getFreshModuleAccess } from '@/lib/nav-modules'
import { productHasFeature } from '@/products'

const Rankings = createLazyRouteComponent(async () => ({
  default: (await import('@/features/rankings')).Rankings,
}))

const rankingsSearchSchema = z.object({
  period: z
    .enum(['today', 'week', 'month', 'year', 'all'])
    .optional()
    .catch(undefined),
})

export const Route = createFileRoute('/_public/rankings/')({
  validateSearch: rankingsSearchSchema,
  beforeLoad: async ({ location }) => {
    if (!productHasFeature('rankings')) {
      throw redirect({ to: '/' })
    }
    const access = await getFreshModuleAccess('rankings')
    if (!access.enabled) {
      throw redirect({ to: '/' })
    }
    if (access.requireAuth) {
      const { auth } = useAuthStore.getState()
      if (!auth.user) {
        throw redirect({
          to: '/sign-in',
          search: { redirect: location.href },
        })
      }
    }
  },
  component: Rankings,
})
