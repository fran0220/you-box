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
