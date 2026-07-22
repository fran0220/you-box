import { createFileRoute, redirect } from '@tanstack/react-router'
import { createLazyRouteComponent } from '@/lib/lazy-route-component'
import {
  DASHBOARD_DEFAULT_SECTION,
  DASHBOARD_SECTION_IDS,
} from '@/features/dashboard/section-registry'

const Dashboard = createLazyRouteComponent(async () => ({
  default: (await import('@/features/dashboard')).Dashboard,
}))

export const Route = createFileRoute('/_authenticated/dashboard/$section')({
  beforeLoad: ({ params }) => {
    if (params.section === 'models') {
      throw redirect({
        to: '/usage-logs/$section',
        params: { section: 'common' },
      })
    }
    if (
      !(DASHBOARD_SECTION_IDS as readonly string[]).includes(params.section)
    ) {
      throw redirect({
        to: '/dashboard/$section',
        params: { section: DASHBOARD_DEFAULT_SECTION },
      })
    }
  },
  component: Dashboard,
})
