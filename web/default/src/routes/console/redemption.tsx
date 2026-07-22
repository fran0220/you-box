import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/console/redemption')({
  beforeLoad: () => {
    throw redirect({ to: '/redemption-codes' })
  },
})
