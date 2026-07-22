import { createFileRoute, redirect } from '@tanstack/react-router'
import { SETTINGS_SECTION_ROUTES } from '@/features/system-settings/section-route-config'

const routeConfig = SETTINGS_SECTION_ROUTES.billing

export const Route = createFileRoute(
  '/_authenticated/system-settings/billing/'
)({
  beforeLoad: () => {
    throw redirect({
      to: '/system-settings/billing/$section',
      params: { section: routeConfig.defaultSection },
    })
  },
})
