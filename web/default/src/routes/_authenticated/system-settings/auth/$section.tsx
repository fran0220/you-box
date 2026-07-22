import { createFileRoute, redirect } from '@tanstack/react-router'
import { createLazyRouteComponent } from '@/lib/lazy-route-component'
import {
  SETTINGS_SECTION_ROUTES,
  isSettingsSectionId,
} from '@/features/system-settings/section-route-config'

const routeConfig = SETTINGS_SECTION_ROUTES.auth
const AuthSettings = createLazyRouteComponent(async () => ({
  default: (await import('@/features/system-settings/auth')).AuthSettings,
}))

export const Route = createFileRoute(
  '/_authenticated/system-settings/auth/$section'
)({
  beforeLoad: ({ params }) => {
    if (!isSettingsSectionId('auth', params.section)) {
      throw redirect({
        to: '/system-settings/auth/$section',
        params: { section: routeConfig.defaultSection },
      })
    }
  },
  component: AuthSettings,
})
