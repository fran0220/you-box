import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { createLazyRouteComponent } from '@/lib/lazy-route-component'
import { ROLE } from '@/lib/roles'

const Subscriptions = createLazyRouteComponent(async () => ({
  default: (await import('@/features/subscriptions')).Subscriptions,
}))

export const Route = createFileRoute('/_authenticated/subscriptions/')({
  beforeLoad: () => {
    const { auth } = useAuthStore.getState()
    if (!auth.user || auth.user.role < ROLE.ADMIN) {
      throw redirect({ to: '/403' })
    }
  },
  component: Subscriptions,
})
