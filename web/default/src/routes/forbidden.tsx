import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/forbidden')({
  beforeLoad: () => {
    throw redirect({ to: '/403' })
  },
})
