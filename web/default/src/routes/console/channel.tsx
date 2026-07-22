import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/console/channel')({
  beforeLoad: () => {
    throw redirect({ to: '/channels' })
  },
})
