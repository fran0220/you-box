import z from 'zod'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { createLazyRouteComponent } from '@/lib/lazy-route-component'
import { productHasFeature } from '@/products'

const AgentAuthorize = createLazyRouteComponent(async () => ({
  default: (await import('@/features/agent')).AgentAuthorize,
}))

const searchSchema = z.object({
  client_id: z.string().optional().catch('youbox-agent'),
  device_id: z.string().optional().catch(''),
  device_label: z.string().optional().catch(''),
  state: z.string().optional().catch(''),
  code_challenge: z.string().optional().catch(''),
  code_challenge_method: z.string().optional().catch('S256'),
})

export const Route = createFileRoute('/_authenticated/agent/authorize')({
  beforeLoad: () => {
    if (!productHasFeature('agent_desktop')) {
      throw redirect({ to: '/' })
    }
  },
  validateSearch: searchSchema,
  component: AgentAuthorize,
})
