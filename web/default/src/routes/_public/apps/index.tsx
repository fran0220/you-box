import { createFileRoute, redirect } from '@tanstack/react-router'
import { createLazyRouteComponent } from '@/lib/lazy-route-component'
import { productHasFeature } from '@/products'

const AppsRankings = createLazyRouteComponent(async () => ({
  default: (await import('@/features/apps')).AppsRankings,
}))

export const Route = createFileRoute('/_public/apps/')({
  beforeLoad: () => {
    if (!productHasFeature('rankings')) {
      throw redirect({ to: '/' })
    }
  },
  component: AppsRankings,
})
