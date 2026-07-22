import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/console/token')({
  beforeLoad: () => {
    throw redirect({ to: '/keys' })
  },
})
