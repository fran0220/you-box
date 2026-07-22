import { createFileRoute, redirect } from '@tanstack/react-router'
import { SETTINGS_SECTION_ROUTES } from '@/features/system-settings/section-route-config'

const routeConfig = SETTINGS_SECTION_ROUTES.operations

export const Route = createFileRoute(
  '/_authenticated/system-settings/operations/'
)({
  beforeLoad: () => {
    throw redirect({
      to: '/system-settings/operations/$section',
      params: { section: routeConfig.defaultSection },
    })
  },
})
