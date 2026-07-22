import { createFileRoute, redirect } from '@tanstack/react-router'
import { SETTINGS_SECTION_ROUTES } from '@/features/system-settings/section-route-config'

const routeConfig = SETTINGS_SECTION_ROUTES.security

export const Route = createFileRoute(
  '/_authenticated/system-settings/security/'
)({
  beforeLoad: () => {
    throw redirect({
      to: '/system-settings/security/$section',
      params: { section: routeConfig.defaultSection },
    })
  },
})
