import { createFileRoute, redirect } from '@tanstack/react-router'
import { createLazyComponent } from '@/lib/lazy-route-component'
import { isChatEntryEnabled } from '@/lib/nav-modules'

const Playground = createLazyComponent(async () => ({
  default: (await import('@/features/playground')).Playground,
}))

type PlaygroundSearch = {
  model?: string
}

export const Route = createFileRoute('/_authenticated/playground/')({
  validateSearch: (search: Record<string, unknown>): PlaygroundSearch => ({
    model:
      typeof search.model === 'string' && search.model.trim()
        ? search.model.trim()
        : undefined,
  }),
  beforeLoad: () => {
    if (!isChatEntryEnabled()) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: PlaygroundPage,
})

function PlaygroundPage() {
  const { model } = Route.useSearch()
  return (
    <div className='flex h-[calc(100svh-var(--app-header-height,0px))] min-h-0 flex-col overflow-hidden'>
      <Playground initialModel={model} />
    </div>
  )
}
