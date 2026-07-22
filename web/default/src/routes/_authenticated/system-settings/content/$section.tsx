import { createFileRoute, redirect } from '@tanstack/react-router'
import { createLazyRouteComponent } from '@/lib/lazy-route-component'
import {
  SETTINGS_SECTION_ROUTES,
  isSettingsSectionId,
} from '@/features/system-settings/section-route-config'

const routeConfig = SETTINGS_SECTION_ROUTES.content
const ContentSettings = createLazyRouteComponent(async () => ({
  default: (await import('@/features/system-settings/content')).ContentSettings,
}))

export const Route = createFileRoute(
  '/_authenticated/system-settings/content/$section'
)({
  beforeLoad: ({ params }) => {
    if (!isSettingsSectionId('content', params.section)) {
      throw redirect({
        to: '/system-settings/content/$section',
        params: { section: routeConfig.defaultSection },
      })
    }
  },
  component: ContentSettings,
})
