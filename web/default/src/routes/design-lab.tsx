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
