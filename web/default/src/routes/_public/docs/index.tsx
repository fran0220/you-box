import { createFileRoute } from '@tanstack/react-router'
import { createLazyRouteComponent } from '@/lib/lazy-route-component'

const ApiDocs = createLazyRouteComponent(async () => ({
  default: (await import('@/features/api-docs')).ApiDocs,
}))

export const Route = createFileRoute('/_public/docs/')({
  component: ApiDocs,
})
