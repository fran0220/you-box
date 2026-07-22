import { defaultTopNavLinks } from '../config/top-nav.config'
import type { TopNavLink } from '../types'

/** Backend-driven links with static fallback — used only by TopNav. */
export function resolveTopNavLinks(dynamicLinks: TopNavLink[]): TopNavLink[] {
  return dynamicLinks.length > 0 ? dynamicLinks : defaultTopNavLinks
}
