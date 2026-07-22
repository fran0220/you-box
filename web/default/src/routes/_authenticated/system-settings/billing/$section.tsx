import { createFileRoute, redirect } from '@tanstack/react-router'
import { createLazyRouteComponent } from '@/lib/lazy-route-component'
import {
  SETTINGS_SECTION_ROUTES,
  isSettingsSectionId,
} from '@/features/system-settings/section-route-config'

const routeConfig = SETTINGS_SECTION_ROUTES.billing
const BillingSettings = createLazyRouteComponent(async () => ({
  default: (await import('@/features/system-settings/billing')).BillingSettings,
}))

export const Route = createFileRoute(
  '/_authenticated/system-settings/billing/$section'
)({
  beforeLoad: ({ params }) => {
    if (!isSettingsSectionId('billing', params.section)) {
      throw redirect({
        to: '/system-settings/billing/$section',
        params: { section: routeConfig.defaultSection },
      })
    }
  },
  component: BillingSettings,
})
