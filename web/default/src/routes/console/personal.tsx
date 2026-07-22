import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/console/personal')({
  beforeLoad: () => {
    throw redirect({ to: '/profile' })
  },
})
