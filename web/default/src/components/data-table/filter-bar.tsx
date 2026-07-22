import { type ReactNode } from 'react'
import { SearchIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

type FilterBarProps = {
  /** Search slot; use FilterBarSearch for the canonical input. */
  search?: ReactNode
  /** Inline filter controls (selects, date pickers, FilterTabs). */
  children?: ReactNode
  /** Right-aligned actions: Export, primary buttons, view options. */
  actions?: ReactNode
  className?: string
}

/**
 * FilterBar — the v2 table filter row: search → dropdown filters →
 * right-aligned actions, wrapping gracefully on small screens.
 * Replaces ad-hoc toolbar layouts on redesigned list pages.
 */
export function FilterBar({
  search,
  children,
  actions,
  className,
}: FilterBarProps) {
  return (
    <div
      data-slot='filter-bar'
      className={cn('flex flex-wrap items-center gap-2', className)}
    >
      {search}
      {children}
      {actions != null && (
        <div className='ms-auto flex flex-wrap items-center gap-2'>
          {actions}
        </div>
      )}
    </div>
  )
}

type FilterBarSearchProps = Omit<React.ComponentProps<typeof Input>, 'type'> & {
  containerClassName?: string
}

/** Canonical FilterBar search input: leading icon, fluid up to 300px. */
export function FilterBarSearch({
  containerClassName,
  className,
  ...props
}: FilterBarSearchProps) {
  return (
    <div
      className={cn(
        'relative w-full min-w-36 flex-1 sm:max-w-[300px]',
        containerClassName
      )}
    >
      <SearchIcon
        aria-hidden='true'
        className='text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2'
      />
      <Input type='search' className={cn('h-8 ps-8', className)} {...props} />
    </div>
  )
}
