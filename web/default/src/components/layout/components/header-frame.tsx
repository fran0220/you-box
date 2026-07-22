import { cn } from '@/lib/utils'
import { SidebarTrigger } from '@/components/ui/sidebar'

type HeaderFrameProps = React.HTMLAttributes<HTMLElement> & {
  showSidebarTrigger?: boolean
  innerClassName?: string
}

/** Sticky header shell sized by `--app-header-height`. */
export function HeaderFrame({
  className,
  innerClassName,
  showSidebarTrigger = false,
  children,
  ...props
}: HeaderFrameProps) {
  return (
    <header
      data-slot='app-header'
      className={cn(
        'border-border sticky top-0 z-[var(--z-sticky)] h-[var(--app-header-height,3.75rem)] w-full shrink-0 border-b backdrop-blur-[18px]',
        'bg-[color-mix(in_srgb,var(--bg)_82%,transparent)]',
        className
      )}
      {...props}
    >
      {/* Full-bleed inner row: identical header geometry on public and
          console pages so navigating between them never shifts the chrome. */}
      <div
        className={cn(
          'flex h-full w-full items-center gap-4 px-[var(--gutter,24px)]',
          innerClassName
        )}
      >
        {showSidebarTrigger ? (
          <SidebarTrigger
            variant='ghost'
            className='size-8 shrink-0 md:hidden'
          />
        ) : null}
        {children}
      </div>
    </header>
  )
}
