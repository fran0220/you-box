import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/console/midjourney')({
  beforeLoad: () => {
    throw redirect({
      to: '/usage-logs/$section',
      params: { section: 'drawing' },
    })
  },
})
