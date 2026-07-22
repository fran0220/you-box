import { createFileRoute, redirect } from '@tanstack/react-router'
import { SETTINGS_SECTION_ROUTES } from '@/features/system-settings/section-route-config'

const routeConfig = SETTINGS_SECTION_ROUTES.site

export const Route = createFileRoute('/_authenticated/system-settings/site/')({
  beforeLoad: () => {
    throw redirect({
      to: '/system-settings/site/$section',
      params: { section: routeConfig.defaultSection },
    })
  },
})
