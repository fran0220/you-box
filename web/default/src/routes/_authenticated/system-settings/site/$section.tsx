import { createFileRoute, redirect } from '@tanstack/react-router'
import { createLazyRouteComponent } from '@/lib/lazy-route-component'
import {
  SETTINGS_SECTION_ROUTES,
  isSettingsSectionId,
} from '@/features/system-settings/section-route-config'

const routeConfig = SETTINGS_SECTION_ROUTES.site
const SiteSettings = createLazyRouteComponent(async () => ({
  default: (await import('@/features/system-settings/site')).SiteSettings,
}))

export const Route = createFileRoute(
  '/_authenticated/system-settings/site/$section'
)({
  beforeLoad: ({ params }) => {
    if (!isSettingsSectionId('site', params.section)) {
      throw redirect({
        to: '/system-settings/site/$section',
        params: { section: routeConfig.defaultSection },
      })
    }
  },
  component: SiteSettings,
})
