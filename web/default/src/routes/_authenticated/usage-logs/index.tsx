import { createFileRoute, redirect } from '@tanstack/react-router'

const USAGE_LOGS_DEFAULT_SECTION = 'common'

export const Route = createFileRoute('/_authenticated/usage-logs/')({
  beforeLoad: () => {
    throw redirect({
      to: '/usage-logs/$section',
      params: { section: USAGE_LOGS_DEFAULT_SECTION },
    })
  },
})
