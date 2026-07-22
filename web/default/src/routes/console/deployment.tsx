import z from 'zod'
import { createFileRoute, redirect } from '@tanstack/react-router'

const deploymentSearchSchema = z.object({
  deployment_id: z.string().optional().catch(undefined),
})

export const Route = createFileRoute('/console/deployment')({
  validateSearch: deploymentSearchSchema,
  beforeLoad: ({ search }) => {
    throw redirect({
      to: '/models/$section',
      params: { section: 'deployments' },
      search: search.deployment_id ? { dFilter: search.deployment_id } : {},
    })
  },
})
