import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/console/task')({
  beforeLoad: () => {
    throw redirect({
      to: '/usage-logs/$section',
      params: { section: 'task' },
    })
  },
})
