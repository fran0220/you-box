import { createFileRoute, redirect } from '@tanstack/react-router'
import { createLazyRouteComponent } from '@/lib/lazy-route-component'
import { productHasFeature } from '@/products'

const AgentDevices = createLazyRouteComponent(async () => ({
  default: (await import('@/features/agent')).AgentDevices,
}))

export const Route = createFileRoute('/_authenticated/agent/devices')({
  beforeLoad: () => {
    if (!productHasFeature('agent_desktop')) {
      throw redirect({ to: '/' })
    }
  },
  component: AgentDevices,
})
