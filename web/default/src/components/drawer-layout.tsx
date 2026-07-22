import * as React from 'react'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/use-media-query'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription as VaulDrawerDescription,
  DrawerTitle as VaulDrawerTitle,
} from '@/components/ui/drawer'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import {
  sideDrawerHeaderClassName,
  sideDrawerSectionClassName,
} from '@/components/drawer-layout-classes'

// ---------------------------------------------------------------------------
// Composed drawer shell (PART A of the redesign spec).
//
// The legacy `sideDrawer*ClassName` class-string helpers now live in
// `drawer-layout-classes.ts` (a components-free module) so this file stays a
// components-only module for clean React Fast Refresh. The composed components
// below reuse those recipes internally where natural.
// ---------------------------------------------------------------------------

/** Drawer width presets, applied to the desktop (Sheet) panel only. */
type DrawerSize = 'sm' | 'md' | 'lg' | 'xl'

const DRAWER_SIZE_CLASS: Record<DrawerSize, string> = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-[600px]',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-5xl',
}

/**
 * Layout recipe for the DrawerShell panel. Unlike the legacy
 * `sideDrawerContentClassName` (which pins `bg-background`), this leaves the
 * surface to the underlying `SheetContent`/`DrawerContent` `bg-card` token so
 * the shell uses the single canonical surface color from the spec.
 */
const DRAWER_SHELL_LAYOUT_CLASS =
  'flex h-dvh w-full flex-col gap-0 overflow-hidden p-0 shadow-none'

/**
 * Internal: the responsive breakpoint at which the shell switches between the
 * desktop side Sheet and the mobile vaul bottom drawer. Mirrors Tailwind `md`
 * (768px). Kept here so DrawerShell and any future consumer share one source.
 */
const DESKTOP_MEDIA_QUERY = '(min-width: 768px)'

type DrawerShellProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  /** Width preset for the desktop side panel. Defaults to `md`. */
  size?: DrawerSize
  /** Side for the desktop Sheet panel. Defaults to `right`. */
  side?: 'left' | 'right'
  /** Extra classes merged onto the surface (Sheet panel / Drawer content). */
  className?: string
  /**
   * Initial focus target for the desktop Sheet (Base UI `initialFocus`).
   * Defaults to `true`, letting Base UI focus the first tabbable element
   * (typically the first form field). Pass a ref to override.
   */
  initialFocus?: React.RefObject<HTMLElement | null> | boolean
  /**
   * Accessible label/description for the mobile vaul drawer (which has no
   * SheetTitle/SheetDescription auto-wiring). When the header renders its own
   * title/description visually, pass these for screen-reader parity; they are
   * visually hidden on mobile.
   */
  ariaTitle?: React.ReactNode
  ariaDescription?: React.ReactNode
}

/**
 * DrawerShell — the unified, responsive form-drawer wrapper (a.k.a. FormDrawer).
 *
 * Desktop (`md`+): Base UI `Sheet` side panel (focus trap, ESC, scroll-lock,
 * aria) sized by the `size` prop. Mobile (`< md`): vaul bottom `Drawer`
 * (`max-h-[90vh]`, drag-to-dismiss, `repositionInputs` so the soft keyboard
 * does not cover the focused field). Switched via `useMediaQuery`.
 *
 * Compose with `DrawerHeader` / `DrawerBody` / `DrawerFooter` inside. Both the
 * Sheet and the vaul surface use the one `bg-card` surface token + the shared
 * `--overlay` backdrop token (wired in the underlying primitives).
 */
export function DrawerShell({
  open,
  onOpenChange,
  children,
  size = 'md',
  side = 'right',
  className,
  initialFocus = true,
  ariaTitle,
  ariaDescription,
}: DrawerShellProps) {
  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY)

  if (isDesktop) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side={side}
          showCloseButton={false}
          initialFocus={initialFocus}
          className={cn(
            DRAWER_SHELL_LAYOUT_CLASS,
            DRAWER_SIZE_CLASS[size],
            className
          )}
        >
          {/* Hidden a11y label/description so the dialog is named even though
              DrawerHeader renders the visible heading in flow. */}
          {ariaTitle ? <SheetTitle className='sr-only'>{ariaTitle}</SheetTitle> : null}
          {ariaDescription ? (
            <SheetDescription className='sr-only'>
              {ariaDescription}
            </SheetDescription>
          ) : null}
          {children}
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      direction='bottom'
      repositionInputs
    >
      <DrawerContent
        className={cn(
          // Override the primitive's default 80vh cap with the same variant
          // prefix so tailwind-merge replaces it (a bare `max-h-[90vh]` would
          // lose to the higher-specificity `data-[...]` selector instead).
          'flex flex-col gap-0 p-0 data-[vaul-drawer-direction=bottom]:max-h-[90vh]',
          className
        )}
      >
        {ariaTitle ? (
          <VaulDrawerTitle className='sr-only'>{ariaTitle}</VaulDrawerTitle>
        ) : null}
        {ariaDescription ? (
          <VaulDrawerDescription className='sr-only'>
            {ariaDescription}
          </VaulDrawerDescription>
        ) : null}
        {children}
      </DrawerContent>
    </Drawer>
  )
}

/** Backward-/forward-compatible alias: the spec calls the responsive wrapper
 *  "FormDrawer". DrawerShell IS that wrapper. */
export const FormDrawer = DrawerShell

type DrawerHeaderProps = {
  title: React.ReactNode
  description?: React.ReactNode
  icon?: React.ReactNode
  /** Hide the in-flow close button (e.g. for a non-dismissible flow). */
  showClose?: boolean
  /** Optional content rendered between the title block and the close button. */
  actions?: React.ReactNode
  className?: string
}

/**
 * DrawerHeader — sticky, blurred header with the close button IN FLOW.
 *
 * Fixes B4: the legacy Sheet close was `absolute top-3 right-3` and overlapped
 * long titles. Here the icon chip + title + description sit on the left of a
 * flex row and the close button sits on the right of the SAME row, so they can
 * never collide. Renders inside both Sheet and vaul (uses whichever Close
 * primitive is appropriate via the `DrawerCloseButton` below).
 */
export function DrawerHeader({
  title,
  description,
  icon,
  showClose = true,
  actions,
  className,
}: DrawerHeaderProps) {
  return (
    <div className={cn(sideDrawerHeaderClassName(), 'shrink-0', className)}>
      <div className='flex items-start gap-3'>
        {icon ? (
          <span className='bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-md'>
            {icon}
          </span>
        ) : null}
        <div className='min-w-0 flex-1'>
          <h2 className='text-foreground text-base leading-tight font-medium'>
            {title}
          </h2>
          {description ? (
            <p className='text-muted-foreground mt-0.5 text-sm leading-snug'>
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className='flex shrink-0 items-center gap-1'>{actions}</div> : null}
        {showClose ? <DrawerCloseButton /> : null}
      </div>
    </div>
  )
}

/**
 * DrawerCloseButton — the in-flow close control used by DrawerHeader. Renders a
 * ghost icon button wired to Sheet's Close on desktop and vaul's Close on
 * mobile, picked via the same media query as the shell so the correct
 * dismissal primitive is used.
 *
 * Note the two primitives compose differently: Base UI `SheetClose` takes a
 * `render` element, while vaul's `DrawerClose` (Radix) takes `asChild` + a
 * single child — hence the explicit branch instead of a shared element var.
 */
function DrawerCloseButton() {
  const { t } = useTranslation()
  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY)

  if (isDesktop) {
    return (
      <SheetClose
        render={
          <Button variant='ghost' size='icon-sm' className='-mr-1 shrink-0' />
        }
      >
        <CloseGlyph />
        <span className='sr-only'>{t('Close')}</span>
      </SheetClose>
    )
  }

  return (
    <DrawerClose asChild>
      <Button variant='ghost' size='icon-sm' className='-mr-1 shrink-0'>
        <CloseGlyph />
        <span className='sr-only'>{t('Close')}</span>
      </Button>
    </DrawerClose>
  )
}

/** Small inline close glyph kept dependency-light (matches the X in sheet). */
function CloseGlyph() {
  return (
    <svg
      width='16'
      height='16'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={2}
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden
    >
      <path d='M18 6 6 18' />
      <path d='m6 6 12 12' />
    </svg>
  )
}

type DrawerBodyProps = {
  children: React.ReactNode
  className?: string
  /**
   * Render the body AS a `<form>`. When true, the scroll container is the form
   * element itself and `formProps` is spread onto it (e.g. `id`, `onSubmit`).
   */
  asForm?: boolean
  formProps?: React.ComponentProps<'form'>
}

/**
 * DrawerBody — THE single scroll container for a drawer.
 *
 * Owns `overflow-y-auto` and the flex-column layout, and encapsulates the
 * fragile `[&>*]:shrink-0` contract via an internal content stack (a wrapping
 * flex column whose direct children get `shrink-0`). This means the shrink-0
 * fix no longer depends on the `<form>` having flat children — callers can nest
 * freely and still get correct scrolling.
 *
 * WHY shrink-0 on the children: the body is a flex column and its children are
 * frequently Panel/card surfaces with non-visible `overflow`. Per the CSS flex
 * spec, a flex item with non-visible overflow resolves `min-height: auto` to 0,
 * so without `shrink-0` those cards collapse to fit the viewport (clipping
 * their content) instead of overflowing and letting THIS container scroll.
 */
export function DrawerBody({
  children,
  className,
  asForm,
  formProps,
}: DrawerBodyProps) {
  const scrollClasses = cn(
    'flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5',
    className
  )

  if (asForm) {
    return (
      <form {...formProps} className={cn(scrollClasses, formProps?.className)}>
        <DrawerContentStack>{children}</DrawerContentStack>
      </form>
    )
  }

  return (
    <div className={scrollClasses}>
      <DrawerContentStack>{children}</DrawerContentStack>
    </div>
  )
}

/**
 * Internal content stack: a nested `flex flex-col gap-6` wrapper that owns the
 * `[&>*]:shrink-0` contract. By scoping shrink-0 to the wrapper's direct
 * children here, the fix no longer depends on the parent (form/div) having flat
 * children — callers may nest freely. A real element (not `display:contents`)
 * is required because Tailwind's `[&>*]:` selector needs an element to scope to;
 * the matching `gap-6` keeps the spacing identical to the scroll container.
 */
function DrawerContentStack({ children }: { children: React.ReactNode }) {
  return <div className='flex flex-col gap-6 [&>*]:shrink-0'>{children}</div>
}

type DrawerFooterProps = {
  /** Submit/pending state — disables BOTH buttons and swaps the primary label. */
  isSubmitting?: boolean
  /** Primary button label (default: "Save changes"). */
  submitLabel?: React.ReactNode
  /** Primary button label while pending (default: "Saving..."). */
  submittingLabel?: React.ReactNode
  /** Cancel handler. When omitted, the cancel button is not rendered. */
  onCancel?: () => void
  /** Cancel button label (default: "Cancel"). */
  cancelLabel?: React.ReactNode
  /**
   * Associate the primary button with a `<form id>` so it submits via HTML form
   * association (`type='submit'`). Use this OR `onSubmit`.
   */
  formId?: string
  /** Click handler for the primary button (used when not relying on `formId`). */
  onSubmit?: () => void
  /** Replace the default Cancel + Submit pair with fully custom children. */
  children?: React.ReactNode
  className?: string
}

/**
 * DrawerFooter — sticky, blurred footer with one unified action contract.
 *
 * Default layout: `flex flex-wrap justify-end gap-2` (no fixed `grid-cols-2`).
 * On mobile the buttons go full-width and stack with the PRIMARY on top
 * (`flex-col-reverse` so source order Cancel-then-Submit renders Submit first).
 * Uses one `Loader2` spinner and disables BOTH buttons while `isSubmitting`.
 */
export function DrawerFooter({
  isSubmitting = false,
  submitLabel,
  submittingLabel,
  onCancel,
  cancelLabel,
  formId,
  onSubmit,
  children,
  className,
}: DrawerFooterProps) {
  const { t } = useTranslation()

  return (
    <div
      className={cn(
        'border-border/70 bg-background/95 flex shrink-0 flex-col-reverse gap-2 border-t px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:flex-row sm:flex-wrap sm:justify-end sm:px-6 sm:py-4',
        className
      )}
    >
      {children ?? (
        <>
          {onCancel ? (
            <Button
              type='button'
              variant='outline'
              onClick={onCancel}
              disabled={isSubmitting}
              className='w-full sm:w-auto'
            >
              {cancelLabel ?? t('Cancel')}
            </Button>
          ) : null}
          <Button
            type={formId ? 'submit' : 'button'}
            form={formId}
            onClick={onSubmit}
            disabled={isSubmitting}
            className='w-full sm:w-auto'
          >
            {isSubmitting ? (
              <>
                <Loader2 className='size-4 animate-spin' />
                {submittingLabel ?? t('Saving...')}
              </>
            ) : (
              (submitLabel ?? t('Save changes'))
            )}
          </Button>
        </>
      )}
    </div>
  )
}

type DrawerSectionProps = {
  /**
   * Visual treatment:
   * - `card` — eyebrow + display title block above the body (large drawers).
   * - `divider` — lighter, bottom-divider section (mid drawers).
   */
  variant?: 'card' | 'divider'
  /** Optional eyebrow (small uppercase label) — only shown for `card`. */
  eyebrow?: React.ReactNode
  /** Optional section title rendered by the section itself. For richer headers
   *  with an icon chip + description, render `DrawerSectionHeader` as a child
   *  instead and omit `title`. */
  title?: React.ReactNode
  children: React.ReactNode
  className?: string
}

/**
 * DrawerSection — one section idiom with a `variant` prop, replacing the legacy
 * `SideDrawerSection` and ad-hoc `SettingsPanel`-in-drawer usage.
 *
 * `divider` mirrors the legacy `sideDrawerSectionClassName` (bottom hairline,
 * collapses on the last child). `card` adds an eyebrow + display title for the
 * large editors.
 */
export function DrawerSection({
  variant = 'divider',
  eyebrow,
  title,
  children,
  className,
}: DrawerSectionProps) {
  if (variant === 'card') {
    return (
      <section
        className={cn(
          'border-border/60 bg-card flex flex-col gap-4 rounded-lg border p-4 sm:p-5',
          className
        )}
      >
        {(eyebrow || title) && (
          <div className='flex flex-col gap-1'>
            {eyebrow ? (
              <span className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
                {eyebrow}
              </span>
            ) : null}
            {title ? (
              <h3 className='text-foreground text-base leading-tight font-semibold tracking-tight'>
                {title}
              </h3>
            ) : null}
          </div>
        )}
        {children}
      </section>
    )
  }

  return (
    <section className={sideDrawerSectionClassName(className)}>
      {title ? (
        <h3 className='text-sm leading-none font-semibold tracking-tight'>
          {title}
        </h3>
      ) : null}
      {children}
    </section>
  )
}

type DrawerSectionHeaderProps = {
  title: React.ReactNode
  description?: React.ReactNode
  icon?: React.ReactNode
  /** Optional trailing actions (e.g. a chevron for collapsibles). */
  actions?: React.ReactNode
  className?: string
}

/**
 * DrawerSectionHeader — icon chip (`bg-muted size-8 rounded-md`) + title +
 * optional description. Replaces `SideDrawerSectionHeader`, channel's local
 * `CardHeading`/`SubHeading`, and subscriptions' hand-rolled `<h3>`.
 */
export function DrawerSectionHeader({
  title,
  description,
  icon,
  actions,
  className,
}: DrawerSectionHeaderProps) {
  return (
    <div className={cn('flex items-start gap-3', className)}>
      {icon ? (
        <span className='bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-md'>
          {icon}
        </span>
      ) : null}
      <div className='min-w-0 flex-1'>
        <h3 className='text-sm leading-none font-semibold tracking-tight'>
          {title}
        </h3>
        {description ? (
          <p className='text-muted-foreground mt-1 text-xs leading-5'>
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className='flex shrink-0 items-center gap-1'>{actions}</div> : null}
    </div>
  )
}

type DrawerSwitchGroupProps = {
  children: React.ReactNode
  className?: string
}

/**
 * DrawerSwitchGroup — a vertical stack of `DrawerSwitchRow`s with a single
 * shared `divide-y` rule and a bounding hairline, so adjacent switch rows share
 * one divider treatment (replaces per-row `border-y` doubling).
 */
export function DrawerSwitchGroup({
  children,
  className,
}: DrawerSwitchGroupProps) {
  return (
    <div
      className={cn(
        'divide-border/60 border-border/60 flex flex-col divide-y rounded-lg border',
        className
      )}
    >
      {children}
    </div>
  )
}

type DrawerSwitchRowProps = {
  /** Row label (typically a FormLabel). */
  label: React.ReactNode
  /** Optional supporting description. */
  description?: React.ReactNode
  /** The control on the right (typically a Switch). */
  control: React.ReactNode
  className?: string
}

/**
 * DrawerSwitchRow — one switch-row height/padding idiom (matches the legacy
 * `sideDrawerSwitchItemClassName` row height). The row itself is border-less;
 * wrap a set of rows in `DrawerSwitchGroup` to get the shared `divide-y`
 * separators and bounding hairline.
 */
export function DrawerSwitchRow({
  label,
  description,
  control,
  className,
}: DrawerSwitchRowProps) {
  return (
    <div
      className={cn(
        'flex min-h-16 flex-row items-center justify-between gap-3 px-3 py-3',
        className
      )}
    >
      <div className='flex min-w-0 flex-col gap-0.5'>
        <span className='text-sm font-medium'>{label}</span>
        {description ? (
          <span className='text-muted-foreground text-xs leading-5'>
            {description}
          </span>
        ) : null}
      </div>
      <div className='shrink-0'>{control}</div>
    </div>
  )
}

type DrawerFieldActionsProps = {
  children: React.ReactNode
  className?: string
}

/**
 * DrawerFieldActions — a per-field action button row (e.g. template / clear /
 * visual-edit clusters). Wraps onto multiple lines on narrow widths.
 */
export function DrawerFieldActions({
  children,
  className,
}: DrawerFieldActionsProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {children}
    </div>
  )
}

type DrawerLoadingStateProps = {
  /** Heading text (default: "Loading channel details"). */
  title?: React.ReactNode
  /** Supporting text under the heading. */
  description?: React.ReactNode
  className?: string
}

/**
 * DrawerLoadingState — skeleton placeholder shown inside the scroll container
 * while an edit-mode detail fetch is in flight (generalizes channel's
 * `ChannelEditorLoadingState`). Defaults reuse the existing channel copy so the
 * channel migration is a drop-in; pass `title`/`description` to retheme.
 */
export function DrawerLoadingState({
  title,
  description,
  className,
}: DrawerLoadingStateProps) {
  const { t } = useTranslation()
  return (
    <div
      className={cn(
        'border-border/60 flex flex-col gap-4 rounded-lg border p-4',
        className
      )}
      aria-live='polite'
    >
      <div>
        <p className='text-sm font-medium'>
          {title ?? t('Loading channel details')}
        </p>
        <p className='text-muted-foreground mt-1 text-xs'>
          {description ??
            t('Please wait before editing to avoid overwriting saved values.')}
        </p>
      </div>
      <div className='grid gap-4 sm:grid-cols-2'>
        <Skeleton className='h-10 w-full' />
        <Skeleton className='h-10 w-full' />
      </div>
      <Skeleton className='h-24 w-full' />
      <Skeleton className='h-32 w-full' />
    </div>
  )
}
