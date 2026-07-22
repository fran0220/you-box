import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_public/legal/')({
  beforeLoad: () => {
    throw redirect({ to: '/legal/$doc', params: { doc: 'privacy' } })
  },
})