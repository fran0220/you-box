import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { createLazyRouteComponent } from '@/lib/lazy-route-component'

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
  validateSearch: searchSchema,
  component: AgentAuthorize,
})
