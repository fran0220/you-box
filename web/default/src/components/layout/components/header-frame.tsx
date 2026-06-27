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
      className={cn(
        'border-border sticky top-0 z-[var(--z-sticky)] h-[var(--app-header-height,3.75rem)] w-full shrink-0 border-b backdrop-blur-[18px]',
        'bg-[color-mix(in_srgb,var(--bg)_82%,transparent)]',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'mx-auto flex h-full w-full max-w-[var(--container-xl,1280px)] items-center gap-4 px-[var(--gutter,24px)]',
          innerClassName
        )}
      >
        {showSidebarTrigger ? (
          <SidebarTrigger variant='ghost' className='size-8 shrink-0' />
        ) : null}
        {children}
      </div>
    </header>
  )
}
