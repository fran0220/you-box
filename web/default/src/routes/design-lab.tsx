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
import { lazy, Suspense } from 'react'
import { createFileRoute, notFound } from '@tanstack/react-router'

// Dev-only gallery. The ternary is statically resolved at build time, so
// production bundles contain neither the route component nor any demo code.
const DesignLab = import.meta.env.DEV
  ? lazy(() => import('@/features/design-lab'))
  : null

export const Route = createFileRoute('/design-lab')({
  beforeLoad: () => {
    if (!import.meta.env.DEV) {
      throw notFound()
    }
  },
  component: DesignLabPage,
})

function DesignLabPage() {
  if (!DesignLab) return null
  return (
    <Suspense fallback={null}>
      <DesignLab />
    </Suspense>
  )
}
