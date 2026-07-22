import { lazy, Suspense, useEffect } from 'react'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/auth-store'
import { ROLE } from '@/lib/roles'
import { Skeleton } from '@/components/ui/skeleton'
import { SectionPageLayout } from '@/components/layout'
import { FadeIn } from '@/components/page-transition'
import { AccountOverview } from './components/overview/account-overview'
import { TrafficFlow } from './components/flow/traffic-flow'
import {
  type DashboardSectionId,
  DASHBOARD_DEFAULT_SECTION,
} from './section-registry'

const route = getRouteApi('/_authenticated/dashboard/$section')

const LazyUserCharts = lazy(() =>
  import('./components/users/user-charts').then((m) => ({
    default: m.UserCharts,
  }))
)

function ChartsFallback() {
  return (
    <div className='overflow-hidden rounded-lg border'>
      <div className='flex items-center justify-between border-b px-4 py-3 sm:px-5'>
        <Skeleton className='h-5 w-32' />
        <Skeleton className='h-8 w-72' />
      </div>
      <div className='h-96 p-2'>
        <Skeleton className='h-full w-full' />
      </div>
    </div>
  )
}

const SECTION_META: Record<DashboardSectionId, { titleKey: string }> = {
  overview: {
    titleKey: 'Overview',
  },
  users: {
    titleKey: 'User Analytics',
  },
  flow: {
    titleKey: 'Traffic Flow',
  },
}

export function Dashboard() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const params = route.useParams()
  const userRole = useAuthStore((state) => state.auth.user?.role)
  const activeSection = (params.section ??
    DASHBOARD_DEFAULT_SECTION) as DashboardSectionId

  const meta = SECTION_META[activeSection] ?? SECTION_META.overview
  const isAdmin = Boolean(userRole && userRole >= ROLE.ADMIN)

  useEffect(() => {
    if (activeSection === 'users' && !isAdmin) {
      void navigate({
        to: '/dashboard/$section',
        params: { section: DASHBOARD_DEFAULT_SECTION },
        replace: true,
      })
    }
  }, [activeSection, isAdmin, navigate])

  return (
    <SectionPageLayout>
      <SectionPageLayout.Title>{t(meta.titleKey)}</SectionPageLayout.Title>
      <SectionPageLayout.Content>
        {activeSection === 'overview' && <AccountOverview />}
        {activeSection === 'flow' && <TrafficFlow />}
        {activeSection === 'users' && isAdmin && (
          <div className='mx-auto w-full max-w-[1180px]'>
            <FadeIn>
              <Suspense fallback={<ChartsFallback />}>
                <LazyUserCharts />
              </Suspense>
            </FadeIn>
          </div>
        )}
      </SectionPageLayout.Content>
    </SectionPageLayout>
  )
}
