import { createFileRoute } from '@tanstack/react-router'
import { createLazyRouteComponent } from '@/lib/lazy-route-component'

const AgentDevices = createLazyRouteComponent(async () => ({
  default: (await import('@/features/agent')).AgentDevices,
}))

export const Route = createFileRoute('/_authenticated/agent/devices')({
  component: AgentDevices,
})
