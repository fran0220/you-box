/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { createFileRoute, redirect } from '@tanstack/react-router'
import { createLazyRouteComponent } from '@/lib/lazy-route-component'

const DASHBOARD_DEFAULT_SECTION = 'overview'
const DASHBOARD_SECTION_IDS = ['overview', 'users'] as const
const Dashboard = createLazyRouteComponent(async () => ({
  default: (await import('@/features/dashboard')).Dashboard,
}))

export const Route = createFileRoute('/_authenticated/dashboard/$section')({
  beforeLoad: ({ params }) => {
    if (params.section === 'models') {
      throw redirect({
        to: '/usage-logs/$section',
        params: { section: 'common' },
      })
    }
    if (
      !(DASHBOARD_SECTION_IDS as readonly string[]).includes(params.section)
    ) {
      throw redirect({
        to: '/dashboard/$section',
        params: { section: DASHBOARD_DEFAULT_SECTION },
      })
    }
  },
  component: Dashboard,
})
