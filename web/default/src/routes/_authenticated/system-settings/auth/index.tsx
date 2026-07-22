import { createFileRoute, redirect } from '@tanstack/react-router'
import { SETTINGS_SECTION_ROUTES } from '@/features/system-settings/section-route-config'

const routeConfig = SETTINGS_SECTION_ROUTES.auth

export const Route = createFileRoute('/_authenticated/system-settings/auth/')({
  beforeLoad: () => {
    throw redirect({
      to: '/system-settings/auth/$section',
      params: { section: routeConfig.defaultSection },
    })
  },
})
