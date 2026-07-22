import { createFileRoute, redirect } from '@tanstack/react-router'
import { createLazyRouteComponent } from '@/lib/lazy-route-component'
import {
  SETTINGS_SECTION_ROUTES,
  isSettingsSectionId,
} from '@/features/system-settings/section-route-config'

const routeConfig = SETTINGS_SECTION_ROUTES.operations
const OperationsSettings = createLazyRouteComponent(async () => ({
  default: (await import('@/features/system-settings/operations'))
    .OperationsSettings,
}))

export const Route = createFileRoute(
  '/_authenticated/system-settings/operations/$section'
)({
  beforeLoad: ({ params }) => {
    if (!isSettingsSectionId('operations', params.section)) {
      throw redirect({
        to: '/system-settings/operations/$section',
        params: { section: routeConfig.defaultSection },
      })
    }
  },
  component: OperationsSettings,
})
