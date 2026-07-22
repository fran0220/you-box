import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/console/models')({
  beforeLoad: () => {
    throw redirect({ to: '/models' })
  },
})
