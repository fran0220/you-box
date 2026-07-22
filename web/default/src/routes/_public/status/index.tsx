import { createFileRoute } from '@tanstack/react-router'
import { createLazyRouteComponent } from '@/lib/lazy-route-component'

const StatusPage = createLazyRouteComponent(async () => ({
  default: (await import('@/features/status')).StatusPage,
}))

export const Route = createFileRoute('/_public/status/')({
  component: StatusPage,
})
