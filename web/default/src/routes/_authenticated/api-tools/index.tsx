import { createFileRoute } from '@tanstack/react-router'
import { createLazyRouteComponent } from '@/lib/lazy-route-component'

const ApiTools = createLazyRouteComponent(async () => ({
  default: (await import('@/features/api-tools')).ApiTools,
}))

export const Route = createFileRoute('/_authenticated/api-tools/')({
  component: ApiTools,
})
