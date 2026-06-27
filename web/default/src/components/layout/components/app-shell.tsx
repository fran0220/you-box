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
import { getCookie } from '@/lib/cookies'
import { cn } from '@/lib/utils'
import { LayoutProvider } from '@/context/layout-provider'
import { SearchProvider } from '@/context/search-provider'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AnimatedOutlet } from '@/components/page-transition'
import { SkipToMain } from '@/components/skip-to-main'
import {
  AppShellContent,
  type AppShellContentMode,
} from './app-shell-content'
import { AppContentScrollRestoration } from './app-content-scroll-restoration'
import { AppSidebar } from './app-sidebar'
import { Footer } from './footer'
import { Header, type HeaderVariant } from './header'

export type AppShellProps = {
  variant: HeaderVariant
  children?: React.ReactNode
  contentMode?: AppShellContentMode
  showFooter?: boolean
}

export function AppShell(props: AppShellProps) {
  const contentMode = props.contentMode ?? 'standard'
  const showFooter = props.showFooter ?? props.variant === 'public'

  if (props.variant === 'public') {
    return (
      <div className='bg-background text-foreground relative flex min-h-svh flex-col overflow-x-clip'>
        <SkipToMain />
        <Header variant='public' />
        <AppShellContent mode={contentMode}>
          {props.children}
        </AppShellContent>
        {showFooter ? <Footer className='max-w-7xl' /> : null}
      </div>
    )
  }

  const defaultOpen = getCookie('sidebar_state') !== 'false'

  return (
    <LayoutProvider>
      <SearchProvider>
        <SidebarProvider defaultOpen={defaultOpen} className='flex-col'>
          <AppContentScrollRestoration />
          <SkipToMain />
          <Header variant='app' />
          <div className='flex min-h-0 w-full flex-1'>
            <AppSidebar />
            <SidebarInset
              className={cn(
                '@container/content',
                'h-[calc(100svh-var(--app-header-height,0px))]',
                'min-h-0 overflow-hidden',
                'peer-data-[variant=inset]:h-[calc(100svh-var(--app-header-height,0px)-(var(--spacing)*4))]'
              )}
            >
              {props.children ?? <AnimatedOutlet />}
            </SidebarInset>
          </div>
        </SidebarProvider>
      </SearchProvider>
    </LayoutProvider>
  )
}
