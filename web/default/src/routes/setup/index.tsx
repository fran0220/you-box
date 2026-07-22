import { createFileRoute, redirect } from '@tanstack/react-router'
import { createLazyRouteComponent } from '@/lib/lazy-route-component'
import { getSetupStatus } from '@/features/setup/api'

const SetupWizard = createLazyRouteComponent(async () => ({
  default: (await import('@/features/setup')).SetupWizard,
}))

export const Route = createFileRoute('/setup/')({
  beforeLoad: async () => {
    const status = await getSetupStatus().catch((error) => {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.warn('[setup.beforeLoad] failed to fetch setup status', error)
      }
      return null
    })

    if (status?.success && status.data?.status) {
      throw redirect({ to: '/' })
    }
  },
  component: SetupWizard,
})
