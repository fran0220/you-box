import { type TFunction } from 'i18next'
import { ROLE } from '@/lib/roles'
import { ADMIN_VIEW } from '../config/admin.config'
import { SYSTEM_SETTINGS_VIEW } from '../config/system-settings.config'
import type { NavGroup, SidebarView } from '../types'

/**
 * Registered nested sidebar views.
 *
 * Each entry describes a contextual sidebar that replaces the root
 * navigation when the user enters that workspace (Vercel-style
 * "drill-in" pattern). Add new entries here to register a new view.
 *
 * Match priority is array order; the first matching `pathPattern` wins.
 */
const SIDEBAR_VIEWS: readonly SidebarView[] = [SYSTEM_SETTINGS_VIEW, ADMIN_VIEW]

/**
 * Resolve the active nested view for the given path.
 *
 * @returns Matching {@link SidebarView}, or `null` when the root
 *          navigation should be displayed.
 */
export function resolveSidebarView(pathname: string): SidebarView | null {
  return SIDEBAR_VIEWS.find((view) => view.pathPattern.test(pathname)) ?? null
}

export function canAccessSidebarView(
  view: SidebarView,
  userRole?: number
): boolean {
  if (view.id === 'admin') return Boolean(userRole && userRole >= ROLE.ADMIN)
  if (view.id === 'system-settings') return userRole === ROLE.SUPER_ADMIN
  return true
}

/**
 * Backwards-compatible helper for consumers (e.g. command palette) that
 * just need the navigation groups for the current path, without caring
 * about the view metadata.
 *
 * @returns Nav groups for the matched view, or `null` if no nested view
 *          matches (callers should then fall back to root nav groups).
 */
export function getNavGroupsForPath(
  pathname: string,
  t: TFunction,
  userRole?: number
): NavGroup[] | null {
  const view = resolveSidebarView(pathname)
  return view && canAccessSidebarView(view, userRole)
    ? view.getNavGroups(t, userRole)
    : null
}
