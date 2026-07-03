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
import { isSidebarModuleEnabled } from '@/lib/nav-modules'

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
    if (!isSidebarModuleEnabled('chat', 'playground')) {
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
