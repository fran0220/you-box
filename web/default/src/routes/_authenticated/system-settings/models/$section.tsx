import { createFileRoute, redirect } from '@tanstack/react-router'
import { createLazyRouteComponent } from '@/lib/lazy-route-component'
import {
  SETTINGS_SECTION_ROUTES,
  isSettingsSectionId,
} from '@/features/system-settings/section-route-config'

const routeConfig = SETTINGS_SECTION_ROUTES.models
const ModelSettings = createLazyRouteComponent(async () => ({
  default: (await import('@/features/system-settings/models')).ModelSettings,
}))

export const Route = createFileRoute(
  '/_authenticated/system-settings/models/$section'
)({
  beforeLoad: ({ params }) => {
    if (!isSettingsSectionId('models', params.section)) {
      throw redirect({
        to: '/system-settings/models/$section',
        params: { section: routeConfig.defaultSection },
      })
    }
  },
  component: ModelSettings,
})
