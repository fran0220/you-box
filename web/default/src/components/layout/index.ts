/**
 * Public surface of the Layout module.
 */

// Core components
export { AppShell } from './components/app-shell'
export { AppShellContent } from './components/app-shell-content'
export type { AppShellContentMode } from './components/app-shell-content'
export { AppSidebar } from './components/app-sidebar'
export { HeaderLogo } from './components/header-logo'
export { NavLinkItem, NavLinkList } from './components/nav-link-item'
export { Header } from './components/header'
export type { HeaderProps } from './components/header'
export { ScrollRestoration } from './components/scroll-restoration'
export { Main } from './components/main'
export { PageFooterPortal } from './components/page-footer'
export { NavGroup } from './components/nav-group'
export { SectionPageLayout } from './components/section-page-layout'
export { SidebarViewHeader } from './components/sidebar-view-header'
export { SystemBrand } from './components/system-brand'
export { TopNav } from './components/top-nav'

// Configuration
export { SYSTEM_SETTINGS_VIEW } from './config/system-settings.config'
export { defaultTopNavLinks } from './config/top-nav.config'

// Sidebar view registry
export {
  getNavGroupsForPath,
  resolveSidebarView,
} from './lib/sidebar-view-registry'

// Type exports (type-only to avoid conflicts with components above)
export type {
  NavCollapsible,
  NavGroup as NavGroupType,
  NavItem,
  NavLink,
  ResolvedSidebarView,
  SidebarData,
  SidebarView,
  SidebarViewParent,
  TopNavLink,
} from './types'
export type { SectionPageLayoutProps } from './components/section-page-layout'
