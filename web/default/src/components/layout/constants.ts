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
/**
 * Layout constants and configurations
 */

/**
 * @deprecated The mobile navigation drawer is now hosted on the shared Base UI
 * `Sheet` shell (see `components/mobile-drawer.tsx`), which owns its own
 * enter/exit motion, focus trap, scroll-lock, ESC handling and overlay token.
 * These hand-rolled `motion` variants are no longer consumed by the drawer and
 * are retained only for the public `layout` barrel export's backward
 * compatibility; a later cleanup wave removes them.
 */
export const MOBILE_DRAWER_ANIMATION = {
  overlay: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  },
  drawer: {
    hidden: { opacity: 0, y: 100 },
    visible: {
      opacity: 1,
      y: 0,
      rotate: 0,
      transition: {
        type: 'spring',
        damping: 15,
        stiffness: 200,
        staggerChildren: 0.03,
      },
    },
    exit: {
      opacity: 0,
      y: 100,
      transition: { duration: 0.1 },
    },
  },
  menuItem: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
} as const

/**
 * @deprecated Superseded by the shared `Sheet` shell used by
 * `components/mobile-drawer.tsx`. The drawer now renders its surface with the
 * canonical `bg-card` token and its overlay with `bg-[var(--overlay)]` +
 * backdrop-blur (from the Sheet primitive), replacing the divergent
 * `bg-black/50 backdrop-blur-sm`. Retained only for the public `layout` barrel
 * export's backward compatibility; a later cleanup wave removes it. The overlay
 * class string here is aligned to the canonical overlay token so any incidental
 * reader stays consistent with the rest of the overlay system.
 */
export const MOBILE_DRAWER_CONFIG = {
  overlayTransitionDuration: 0.2,
  drawerClassName:
    'fixed inset-y-0 left-0 z-[var(--z-overlay)] w-[88%] max-w-sm border-r border-border bg-card p-4 shadow-none md:hidden',
  overlayClassName:
    'fixed inset-0 z-[var(--z-overlay)] bg-[var(--overlay)] supports-backdrop-filter:backdrop-blur-xs',
} as const
