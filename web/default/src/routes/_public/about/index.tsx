import { createFileRoute } from '@tanstack/react-router'
import { createLazyRouteComponent } from '@/lib/lazy-route-component'

const About = createLazyRouteComponent(async () => ({
  default: (await import('@/features/about')).About,
}))

export const Route = createFileRoute('/_public/about/')({
  component: About,
})
