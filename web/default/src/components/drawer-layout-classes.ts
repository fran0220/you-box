import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Drawer/Sheet class-string helpers (the legacy `sideDrawer*` recipes).
//
// These pure class-string builders live in their own module (no component
// exports) so the composed `Drawer*` shell in `drawer-layout.tsx` can stay a
// components-only module (clean React Fast Refresh). They remain the SSOT for
// the bare class recipes and are still consumed by the handful of Sheet-based
// surfaces that are not form mutate-drawers (config-drawer, channel-test-dialog,
// group-ratio-form, model-pricing-sheet, the marketplace mobile filter sheet).
// ---------------------------------------------------------------------------

export const sideDrawerContentClassName = (className?: string) =>
  cn(
    'bg-background text-foreground flex h-dvh w-full flex-col gap-0 overflow-hidden p-0 shadow-none',
    className
  )

export const sideDrawerHeaderClassName = (className?: string) =>
  cn(
    'border-border/70 bg-background/95 border-b px-4 py-3 text-start backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-6 sm:py-4',
    className
  )

export const sideDrawerFormClassName = (className?: string) =>
  cn(
    // Direct children must not shrink: the scroll container is a flex column,
    // and its children are often Panel cards with `overflow-hidden`. Per spec,
    // a flex item with non-visible overflow resolves `min-height: auto` to 0,
    // so without `shrink-0` the cards collapse to fit the viewport and clip
    // their content instead of letting the container scroll.
    'flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5 [&>*]:shrink-0',
    className
  )

export const sideDrawerFooterClassName = (className?: string) =>
  cn(
    'border-border/70 bg-background/95 grid grid-cols-2 gap-2 border-t px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:flex sm:flex-row sm:justify-end sm:px-6 sm:py-4',
    className
  )

export const sideDrawerSectionClassName = (className?: string) =>
  cn(
    'border-border/60 flex flex-col gap-4 border-b pb-6 last:border-b-0 last:pb-0',
    className
  )

export const sideDrawerSwitchItemClassName = (className?: string) =>
  cn(
    'border-border/60 flex min-h-16 flex-row items-center justify-between gap-3 border-y py-3',
    className
  )
