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
import { createLazyComponent } from '@/lib/lazy-route-component'
import type { LegalDocId } from '@/features/legal/legal-page'

const LegalPage = createLazyComponent(async () => ({
  default: (await import('@/features/legal/legal-page')).LegalPage,
}))

const VALID_DOCS = new Set<LegalDocId>(['privacy', 'terms', 'dpa'])

export const Route = createFileRoute('/_public/legal/$doc')({
  beforeLoad: ({ params }) => {
    if (!VALID_DOCS.has(params.doc as LegalDocId)) {
      throw redirect({ to: '/legal/$doc', params: { doc: 'privacy' } })
    }
  },
  component: LegalRoute,
})

function LegalRoute() {
  const { doc } = Route.useParams()
  return <LegalPage doc={doc as LegalDocId} />

}
