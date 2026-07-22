import { createFileRoute, redirect } from '@tanstack/react-router'

const DASHBOARD_DEFAULT_SECTION = 'overview'

export const Route = createFileRoute('/_authenticated/dashboard/')({
  beforeLoad: () => {
    throw redirect({
      to: '/dashboard/$section',
      params: { section: DASHBOARD_DEFAULT_SECTION },
    })
  },
})
