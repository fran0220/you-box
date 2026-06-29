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
import { Tabs as TabsPrimitive } from '@base-ui/react/tabs'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

function Tabs({
  className,
  orientation = 'horizontal',
  ...props
}: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot='tabs'
      data-orientation={orientation}
      className={cn(
        'group/tabs flex gap-2 data-horizontal:flex-col',
        className
      )}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  'group/tabs-list relative inline-flex w-fit items-center justify-center rounded-md p-[3px] text-[var(--text-secondary)] group-data-horizontal/tabs:min-h-8 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col data-[variant=line]:rounded-none data-[variant=line]:gap-[18px]',
  {
    variants: {
      variant: {
        default: 'border-border bg-surface-inset border',
        line: 'border-divider gap-1 border-b bg-transparent pb-0',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

function TabsList({
  className,
  variant = 'default',
  children,
  ...props
}: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot='tabs-list'
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    >
      <TabsIndicator variant={variant} />
      {children}
    </TabsPrimitive.List>
  )
}

/**
 * Sliding active-tab indicator for the default (pill) variant. Base UI's
 * `Tabs.Indicator` exposes the active tab's geometry as
 * `--active-tab-{left,top,width,height}` (measured from the list's padding
 * box), so an absolutely-positioned span translated by those vars overlays
 * the active tab exactly and animates between tabs. It stays `hidden` until
 * measured, so there's no first-paint jump. The `line` variant keeps its
 * per-trigger `::after` underline instead.
 */
function TabsIndicator({ variant }: VariantProps<typeof tabsListVariants>) {
  if (variant === 'line') return null
  return (
    <TabsPrimitive.Indicator
      data-slot='tabs-indicator'
      className={cn(
        'bg-surface-2 pointer-events-none absolute top-0 left-0 z-0 rounded-sm shadow-xs',
        'h-(--active-tab-height) w-(--active-tab-width)',
        'translate-x-(--active-tab-left) translate-y-(--active-tab-top)',
        'duration-base transition-[translate,width,height] ease-out motion-reduce:transition-none'
      )}
    />
  )
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot='tabs-trigger'
      className={cn(
        "relative inline-flex h-[30px] flex-1 items-center justify-center gap-1.5 rounded-sm border border-transparent px-3.5 text-sm font-medium whitespace-nowrap text-[var(--text-secondary)] transition-colors duration-fast ease-out hover:text-foreground focus-visible:shadow-[var(--ring)] group-data-vertical/tabs:h-auto group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start group-data-[variant=line]/tabs-list:h-[38px] group-data-[variant=line]/tabs-list:rounded-none group-data-[variant=line]/tabs-list:px-0.5 disabled:pointer-events-none disabled:opacity-50 has-data-[icon=inline-end]:pr-1 has-data-[icon=inline-start]:pl-1 aria-disabled:pointer-events-none aria-disabled:opacity-50 group-data-[variant=line]/tabs-list:data-active:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        'group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent',
        'data-active:bg-transparent data-active:text-[var(--text-strong)] data-active:shadow-xs',
        'after:bg-brand after:absolute after:opacity-0 after:transition-opacity group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:bottom-[-5px] group-data-horizontal/tabs:after:h-0.5 group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:-right-1 group-data-vertical/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100',
        className
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot='tabs-content'
      keepMounted={false}
      className={cn(
        'flex-1 text-sm outline-none',
        // Base UI may keep visited panels mounted without the `hidden` attr during
        // transitions; inactive panels use tabIndex=-1 (VAL-PRICING-018 stacking).
        '[&[tabindex="-1"]]:hidden',
        'data-[hidden]:hidden',
        '[hidden]:hidden',
        className
      )}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
