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
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/auth-store'
import { formatQuota } from '@/lib/format'
import { useNotifications } from '@/hooks/use-notifications'
import { Button } from '@/components/ui/button'
import { LanguageSwitcher } from '@/components/language-switcher'
import { NotificationPopover } from '@/components/notification-popover'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { HeaderFrame } from './header-frame'
import { SystemBrand } from './system-brand'
import { TopNav } from './top-nav'

export type HeaderProps = {
  /** True when the console sidebar is mounted (shows the mobile sidebar trigger). */
  withSidebar?: boolean
  showTopNav?: boolean
  showSearch?: boolean
  showNotifications?: boolean
  showLanguageSwitcher?: boolean
}

/**
 * One header for the whole site. `withSidebar` only controls structural
 * chrome (sidebar trigger, mobile nav); everything else is
 * driven by the auth state so a signed-in user sees the same header on
 * /docs as on /keys, and visitors get the same header everywhere.
 */
export function Header(props: HeaderProps) {
  const { t } = useTranslation()
  const withSidebar = props.withSidebar ?? false

  const notifications = useNotifications()
  const user = useAuthStore((s) => s.auth.user)
  const quota = user?.quota
  const isAuthenticated = !!user

  const showTopNav = props.showTopNav ?? true
  const showSearch = props.showSearch ?? isAuthenticated
  const showNotifications = props.showNotifications ?? isAuthenticated
  const showLanguageSwitcher = props.showLanguageSwitcher ?? true

  return (
    <HeaderFrame showSidebarTrigger={withSidebar}>
      <SystemBrand variant='inline' />
      <div className='ms-auto flex min-w-0 flex-1 items-center justify-end gap-1 sm:gap-2'>
        {showTopNav ? (
          withSidebar ? (
            <div className='me-1 hidden lg:block'>
              <TopNav showDesktopLinks showMobileMenu={false} />
            </div>
          ) : (
            <TopNav className='me-1' showDesktopLinks showMobileMenu />
          )
        ) : null}
        {showSearch ? <Search /> : null}
        {isAuthenticated && typeof quota === 'number' ? (
          <Link
            to='/wallet'
            className='border-border bg-surface-2 hover:bg-surface-3 duration-fast hidden h-7 items-center gap-1.5 rounded-full border px-3 font-mono text-xs font-medium transition-colors md:inline-flex'
          >
            <span
              aria-hidden='true'
              className='bg-success size-1.5 rounded-full'
            />
            {formatQuota(quota)}
          </Link>
        ) : null}
        {showNotifications ? (
          <NotificationPopover
            open={notifications.popoverOpen}
            onOpenChange={notifications.setPopoverOpen}
            unreadCount={notifications.unreadCount}
            activeTab={notifications.activeTab}
            onTabChange={notifications.setActiveTab}
            notice={notifications.notice}
            announcements={notifications.announcements}
            loading={notifications.loading}
            onMarkAllRead={notifications.markAllRead}
          />
        ) : null}
        {showLanguageSwitcher ? <LanguageSwitcher /> : null}
        <ThemeSwitch />
        {isAuthenticated ? (
          <ProfileDropdown />
        ) : (
          <>
            <div className='bg-border/40 mx-1 hidden h-4 w-px sm:block' />
            <Button
              size='sm'
              className='hidden h-8 rounded-md px-3.5 text-xs font-medium sm:inline-flex'
              render={<Link to='/sign-in' />}
            >
              {t('Sign in')}
            </Button>
          </>
        )}
      </div>
    </HeaderFrame>
  )
}
