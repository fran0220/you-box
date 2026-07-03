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
import { Header } from './header'

export type AppShellProps = {
  /** Mount the console sidebar (authenticated console routes only). */
  withSidebar?: boolean
  children?: React.ReactNode
  contentMode?: AppShellContentMode
  showFooter?: boolean
}

/**
 * The single site shell: sticky header, document scroll, cream `.paper`
 * canvas and footer everywhere. The console sidebar is an optional slot
 * inside the same shell (never a second shell), so public pages, the
 * user console and the admin drill-in workspace share one visual
 * language and one scroll model. Viewport-locked surfaces (playground,
 * chat) opt out via their own fixed-height wrappers and `showFooter`.
 */
export function AppShell(props: AppShellProps) {
  const contentMode = props.contentMode ?? 'standard'
  const showFooter = props.showFooter ?? true

  const body = (
    <>
      <AppShellContent mode={contentMode}>
        {props.children ?? <AnimatedOutlet />}
      </AppShellContent>
      {showFooter ? <Footer /> : null}
    </>
  )

  if (!props.withSidebar) {
    return (
      <SearchProvider>
        <div className='paper bg-background text-foreground relative flex min-h-svh flex-col overflow-x-clip'>
          <SkipToMain />
          <Header />
          {body}
        </div>
      </SearchProvider>
    )
  }

  const defaultOpen = getCookie('sidebar_state') !== 'false'

  return (
    <LayoutProvider>
      <SearchProvider>
        <SidebarProvider
          defaultOpen={defaultOpen}
          className='paper bg-background text-foreground flex-col overflow-x-clip'
        >
          <AppContentScrollRestoration />
          <SkipToMain />
          <Header withSidebar />
          <div className='flex w-full flex-1'>
            <AppSidebar />
            <SidebarInset className='@container/content min-w-0'>
              <div className='flex min-h-[calc(100svh-var(--app-header-height,0px))] flex-1 flex-col'>
                {body}
              </div>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </SearchProvider>
    </LayoutProvider>
  )
}
