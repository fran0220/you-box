import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/console/user')({
  beforeLoad: () => {
    throw redirect({ to: '/users' })
  },
})
