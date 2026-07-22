import z from 'zod'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { createLazyRouteComponent } from '@/lib/lazy-route-component'
import { getFreshModuleAccess } from '@/lib/nav-modules'

const ModelCompare = createLazyRouteComponent(async () => ({
  default: (await import('@/features/pricing/components/model-compare'))
    .ModelCompare,
}))

const compareSearchSchema = z.object({
  models: z.string().optional(),
})

export const Route = createFileRoute('/_public/pricing/compare')({
  validateSearch: compareSearchSchema,
  beforeLoad: async ({ location }) => {
    const access = await getFreshModuleAccess('pricing')
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
  component: ModelCompare,
})
