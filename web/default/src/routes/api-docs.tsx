import { createFileRoute, redirect } from '@tanstack/react-router'

/** Legacy docs_link value from seeded system settings; canonical route is /docs. */
export const Route = createFileRoute('/api-docs')({
  beforeLoad: () => {
    throw redirect({ to: '/docs' })
  },
})
