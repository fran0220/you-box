import { createFileRoute, redirect } from '@tanstack/react-router'
import { SETTINGS_SECTION_ROUTES } from '@/features/system-settings/section-route-config'

const routeConfig = SETTINGS_SECTION_ROUTES.content

export const Route = createFileRoute(
  '/_authenticated/system-settings/content/'
)({
  beforeLoad: () => {
    throw redirect({
      to: '/system-settings/content/$section',
      params: { section: routeConfig.defaultSection },
    })
  },
})
