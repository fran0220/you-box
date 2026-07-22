import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/console/subscription')({
  beforeLoad: () => {
    throw redirect({ to: '/subscriptions' })
  },
})
