import type { Transition, Variants } from 'motion/react'

/**
 * Motion SSOT (JS side) — mirrors the CSS motion tokens in styles/theme.css
 * (`--ease-*` and `--dur-*`). Keep both in sync so Framer and CSS speak one
 * motion language. Easings are the same bezier curves as the CSS `ease-*`
 * utilities; durations are expressed in seconds here (Framer) vs. ms in CSS.
 */
type Bezier = [number, number, number, number]

export const EASE = {
  out: [0.16, 1, 0.3, 1] as Bezier,
  inOut: [0.65, 0, 0.35, 1] as Bezier,
  spring: [0.34, 1.56, 0.64, 1] as Bezier,
}

export const DUR = {
  instant: 0.08,
  fast: 0.14,
  base: 0.22,
  slow: 0.4,
} as const

export const MOTION_TRANSITION: Record<string, Transition> = {
  default: { duration: DUR.base, ease: EASE.out },
  fast: { duration: DUR.fast, ease: EASE.out },
  slow: { duration: DUR.slow, ease: EASE.out },
  spring: { type: 'spring', damping: 20, stiffness: 300 },
  none: { duration: 0 },
}

export const MOTION_VARIANTS = {
  pageEnter: {
    initial: { opacity: 0, y: 8, filter: 'blur(4px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
    exit: { opacity: 0, y: -4, filter: 'blur(2px)' },
  },
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.96 },
  },
  slideUp: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 16 },
  },
  slideDown: {
    initial: { opacity: 0, y: -16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -16 },
  },
  tableRow: {
    initial: { opacity: 0, y: 4 },
    animate: { opacity: 1, y: 0 },
  },
  cardItem: {
    initial: { opacity: 0, y: 12, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
  },
  sidebarSlide: {
    initial: { opacity: 0, x: -8 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -8 },
  },
} as const

export const STAGGER_VARIANTS: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.04 } },
}

export const STAGGER_ITEM_VARIANTS: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: MOTION_TRANSITION.default },
}

export const TABLE_STAGGER_VARIANTS: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.03 } },
}

export const TABLE_ROW_VARIANTS: Variants = {
  initial: { opacity: 0, y: 4 },
  animate: { opacity: 1, y: 0, transition: MOTION_TRANSITION.fast },
}

export const CARD_STAGGER_VARIANTS: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.05 } },
}

export const CARD_ITEM_VARIANTS: Variants = {
  initial: { opacity: 0, y: 12, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: MOTION_TRANSITION.default,
  },
}

export const SIDEBAR_STAGGER_VARIANTS: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.03, delayChildren: 0.05 } },
}

export const SIDEBAR_ITEM_VARIANTS: Variants = {
  initial: { opacity: 0, x: -8 },
  animate: { opacity: 1, x: 0, transition: MOTION_TRANSITION.fast },
}

/**
 * Overlay motion SSOT (Base UI `data-starting-style` / `data-ending-style`
 * transition strings).
 *
 * Contract: every Base UI overlay primitive (dialog/sheet + popover/dropdown/
 * select/tooltip/toast) shares ONE motion language so a backdrop and the panel
 * it dims animate on the SAME timing curve and the SAME duration token
 * (`duration-base`). Historically these drifted — dialog hardcoded
 * `duration-100` on content while sheet ran a `duration-fast` backdrop against
 * a `duration-base` panel, so the backdrop finished before the panel and the
 * close felt unglued. Importing these constants instead of re-spelling the
 * class strings fixes the desync at the source.
 *
 * Exception: the vaul bottom-drawer (components/ui/drawer.tsx) owns its own
 * drag-/spring-driven slide and keeps a tw-animate-css backdrop fade, so it is
 * deliberately NOT wired to these constants (it still reads the `--z-overlay`
 * token for stacking).
 *
 * Layering pairs with the `--z-*` scale in styles/theme.css: the backdrop sits
 * at `--z-overlay`; anchored popups add their own z-index token such as
 * `--z-popover` or `--z-dropdown`.
 * Callers append their own transform recipe (scale/translate) on top of
 * {@link overlayPopupMotionClassName}.
 */

/** Backdrop recipe for modal overlays (dialog/sheet/drawer). Fades opacity on
 * the shared `duration-base` token and blurs behind where supported. */
export const overlayBackdropClassName =
  'fixed inset-0 z-[var(--z-overlay)] bg-[var(--overlay)] transition-opacity duration-base ease-out data-starting-style:opacity-0 data-ending-style:opacity-0 supports-backdrop-filter:backdrop-blur-xs'

/** Shared transition base for overlay popups (panels, menus, popovers,
 * tooltips). Handles the opacity fade on `duration-base`; callers add their own
 * scale/translate transform classes for the directional motion. */
export const overlayPopupMotionClassName =
  'duration-base ease-out transition data-starting-style:opacity-0 data-ending-style:opacity-0'
