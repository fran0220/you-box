import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/user-agreement')({
  beforeLoad: () => {
    throw redirect({ to: '/legal/$doc', params: { doc: 'terms' } })
  },
})
