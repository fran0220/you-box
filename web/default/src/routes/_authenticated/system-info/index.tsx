import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { createLazyRouteComponent } from '@/lib/lazy-route-component'
import { ROLE } from '@/lib/roles'

const SystemInfo = createLazyRouteComponent(async () => ({
  default: (await import('@/features/system-info')).SystemInfo,
}))

export const Route = createFileRoute('/_authenticated/system-info/')({
  beforeLoad: () => {
    const { auth } = useAuthStore.getState()

    if (auth.user?.role !== ROLE.SUPER_ADMIN) {
      throw redirect({ to: '/403' })
    }
  },
  component: SystemInfo,
})
