import { createFileRoute } from '@tanstack/react-router'
import { createLazyRouteComponent } from '@/lib/lazy-route-component'

const Profile = createLazyRouteComponent(async () => ({
  default: (await import('@/features/profile')).Profile,
}))

export const Route = createFileRoute('/_authenticated/profile/')({
  component: Profile,
})
