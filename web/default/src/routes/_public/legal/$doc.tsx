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
