import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/console/playground')({
  beforeLoad: () => {
    throw redirect({ to: '/playground' })
  },
})
