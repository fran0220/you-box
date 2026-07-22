import { createFileRoute, redirect } from '@tanstack/react-router'
import { SETTINGS_SECTION_ROUTES } from '@/features/system-settings/section-route-config'

const routeConfig = SETTINGS_SECTION_ROUTES.models

export const Route = createFileRoute('/_authenticated/system-settings/models/')(
  {
    beforeLoad: () => {
      throw redirect({
        to: '/system-settings/models/$section',
        params: { section: routeConfig.defaultSection },
      })
    },
  }
)
