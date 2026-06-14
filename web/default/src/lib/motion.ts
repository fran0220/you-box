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
