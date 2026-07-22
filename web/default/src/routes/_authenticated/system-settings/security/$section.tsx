import { createFileRoute, redirect } from '@tanstack/react-router'
import { createLazyRouteComponent } from '@/lib/lazy-route-component'
import {
  SETTINGS_SECTION_ROUTES,
  isSettingsSectionId,
} from '@/features/system-settings/section-route-config'

const routeConfig = SETTINGS_SECTION_ROUTES.security
const SecuritySettings = createLazyRouteComponent(async () => ({
  default: (await import('@/features/system-settings/security'))
    .SecuritySettings,
}))

export const Route = createFileRoute(
  '/_authenticated/system-settings/security/$section'
)({
  beforeLoad: ({ params }) => {
    if (!isSettingsSectionId('security', params.section)) {
      throw redirect({
        to: '/system-settings/security/$section',
        params: { section: routeConfig.defaultSection },
      })
    }
  },
  component: SecuritySettings,
})
