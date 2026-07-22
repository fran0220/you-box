import { useProduct } from '@/products'
import { getCookie } from '@/lib/cookies'
import { cn } from '@/lib/utils'
import { LayoutProvider } from '@/context/layout-provider'
import { SearchProvider } from '@/context/search-provider'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AnimatedOutlet } from '@/components/page-transition'
import { SkipToMain } from '@/components/skip-to-main'
import { AppContentScrollRestoration } from './app-content-scroll-restoration'
import { AppShellContent, type AppShellContentMode } from './app-shell-content'
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
 * The single site shell: sticky header, document scroll, and the parchment
 * `.paper` marketing canvas (gated by `ui.paperMarketing`). Console sidebar is
 * an optional slot inside the same shell.
 */
export function AppShell(props: AppShellProps) {
  const contentMode = props.contentMode ?? 'standard'
  const showFooter = props.showFooter ?? true
  const product = useProduct()
  const shellClass = cn(
    product.ui.paperMarketing && 'paper',
    'bg-background text-foreground relative flex min-h-svh flex-col overflow-x-clip'
  )

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
        <div className={shellClass}>
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
          className={cn(shellClass, 'flex-col')}
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
