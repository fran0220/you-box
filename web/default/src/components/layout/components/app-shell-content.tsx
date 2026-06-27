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
import { cn } from '@/lib/utils'
import { Main } from './main'

export type AppShellContentMode = 'standard' | 'fluid' | 'bare'

type AppShellContentProps = {
  mode?: AppShellContentMode
  children: React.ReactNode
  className?: string
}

/**
 * Page content container for AppShell.
 * - standard: centered max-w-7xl section padding (marketing / docs-style pages)
 * - fluid: full-width Main column (authenticated section pages use SectionPageLayout inside)
 * - bare: full viewport height, no padding (home sections, chat, playground)
 */
export function AppShellContent(props: AppShellContentProps) {
  const mode = props.mode ?? 'standard'

  if (mode === 'bare') {
    return (
      <div
        className={cn(
          'bg-background text-foreground flex min-h-[calc(100svh-var(--app-header-height,3rem))] min-w-0 flex-1 flex-col',
          props.className
        )}
      >
        {props.children}
      </div>
    )
  }

  if (mode === 'fluid') {
    return (
      <Main fluid className={cn('min-h-0 flex-1', props.className)}>
        {props.children}
      </Main>
    )
  }

  return (
    <main
      className={cn(
        'mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:px-6',
        props.className
      )}
    >
      {props.children}
    </main>
  )
}
