import z from 'zod'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { createLazyRouteComponent } from '@/lib/lazy-route-component'
import { getFreshModuleAccess } from '@/lib/nav-modules'

const Pricing = createLazyRouteComponent(async () => ({
  default: (await import('@/features/pricing')).Pricing,
}))

const pricingSearchSchema = z.preprocess(
  (raw) => {
    if (raw == null || typeof raw !== 'object') return raw
    const next = { ...(raw as Record<string, unknown>) }
    const legacyKeys = [
      'inputModalities',
      'outputModalities',
      'series',
      'supportedParameters',
      'ctxMin',
      'ctxMax',
    ]
    for (const key of legacyKeys) {
      delete next[key]
    }
    return next
  },
  z.object({
    search: z.string().optional().catch(undefined),
    sort: z.string().optional().catch(undefined),
    providers: z.string().optional().catch(undefined),
    modelTypes: z.string().optional().catch(undefined),
    groups: z.string().optional().catch(undefined),
    categories: z.string().optional().catch(undefined),
    endpointTypes: z.string().optional().catch(undefined),
    quotaTypes: z.string().optional().catch(undefined),
    priceMin: z.number().optional().catch(undefined),
    priceMax: z.number().optional().catch(undefined),
    tokenUnit: z.enum(['M', 'K']).optional().catch(undefined),
    view: z.enum(['list', 'card', 'table']).optional().catch(undefined),
    rechargePrice: z.boolean().optional().catch(undefined),
    model: z.string().optional().catch(undefined),
  })
)

export const Route = createFileRoute('/_public/pricing/')({
  validateSearch: pricingSearchSchema,
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
  component: Pricing,
})
