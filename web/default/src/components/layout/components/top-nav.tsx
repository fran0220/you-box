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
import { useMemo, useState } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'
import { useTopNavLinks } from '@/hooks/use-top-nav-links'
import { useSystemConfig } from '@/hooks/use-system-config'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/dialog'
import { resolveTopNavLinks } from '../lib/resolve-top-nav-links'
import { useTopNavAuthPrompt } from '../hooks/use-top-nav-auth-prompt'
import type { TopNavLink } from '../types'
import { HeaderLogo } from './header-logo'
import { MobileDrawer } from './mobile-drawer'

type TopNavProps = {
  className?: string
  /** When false, desktop links are hidden (e.g. app header keeps search-first layout). */
  showDesktopLinks?: boolean
  /** When true, renders the mobile menu trigger + shared MobileDrawer. */
  showMobileMenu?: boolean
  /** Override resolved links (testing); default uses useTopNavLinks + defaultTopNavLinks. */
  links?: TopNavLink[]
}

/**
 * Sole renderer for `useTopNavLinks` / `defaultTopNavLinks`.
 * Desktop horizontal links + shared mobile drawer.
 */
export function TopNav(props: TopNavProps) {
  const { t } = useTranslation()
  const dynamicLinks = useTopNavLinks()
  const resolved = resolveTopNavLinks(dynamicLinks)
  const links = props.links ?? resolved
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const showDesktopLinks = props.showDesktopLinks ?? true
  const showMobileMenu = props.showMobileMenu ?? true
  const [mobileOpen, setMobileOpen] = useState(false)
  const { auth } = useAuthStore()
  const user = auth.user
  const {
    systemName,
    logo: systemLogo,
    loading,
    logoLoaded,
  } = useSystemConfig()
  const {
    authPromptTarget,
    authPromptSecondsLeft,
    closeAuthPrompt,
    navigateToSignIn,
    handleNavLinkClick,
  } = useTopNavAuthPrompt()

  const normalizedLinks = useMemo(
    () =>
      links.map((link) => ({
        isActive: pathname === link.href,
        disabled: false,
        external: false,
        ...link,
      })),
    [links, pathname]
  )

  const closeMobile = () => setMobileOpen(false)

  const linkClassName = (isActive: boolean, disabled?: boolean) =>
    cn(
      'duration-fast rounded-sm px-3 py-1.5 text-[13px] font-medium transition-colors sm:text-sm',
      isActive
        ? 'bg-surface-2 text-foreground'
        : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground',
      disabled && 'pointer-events-none opacity-50'
    )

  const renderLink = (
    link: TopNavLink & { isActive: boolean },
    closeOnNavigate?: boolean
  ) => {
    const label = t(link.title)
    const onClick = (event: React.MouseEvent<HTMLAnchorElement>) =>
      handleNavLinkClick(event, link, {
        closeMobile: closeOnNavigate ? closeMobile : undefined,
      })

    if (link.external) {
      return (
        <a
          key={`${link.href}-${link.title}`}
          href={link.href}
          target='_blank'
          rel='noopener noreferrer'
          aria-disabled={link.disabled}
          tabIndex={link.disabled ? -1 : undefined}
          onClick={onClick}
          className={linkClassName(link.isActive, link.disabled)}
        >
          {label}
        </a>
      )
    }

    return (
      <Link
        key={`${link.href}-${link.title}`}
        to={link.href}
        disabled={link.disabled}
        onClick={onClick}
        className={linkClassName(link.isActive, link.disabled)}
      >
        {label}
      </Link>
    )
  }

  const mobileLinksForDrawer: TopNavLink[] = normalizedLinks.map(
    ({ title, href, disabled, requiresAuth, external }) => ({
      title,
      href,
      disabled,
      requiresAuth,
      external,
    })
  )

  return (
    <>
      {showDesktopLinks ? (
        <nav
          className={cn(
            'hidden items-center gap-0.5 lg:flex',
            props.className
          )}
        >
          {normalizedLinks.map((link) => renderLink(link))}
        </nav>
      ) : null}

      {showMobileMenu ? (
        <>
          <div className='flex items-center lg:hidden'>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='size-9'
              onClick={() => setMobileOpen((open) => !open)}
              aria-label={t('Toggle navigation menu')}
            >
              <div className='relative size-4'>
                <span
                  className={cn(
                    'absolute inset-x-0 block h-[1.5px] origin-center rounded-full bg-current transition-all duration-300',
                    mobileOpen ? 'top-[7px] rotate-45' : 'top-[3px]'
                  )}
                />
                <span
                  className={cn(
                    'absolute inset-x-0 top-[7px] block h-[1.5px] rounded-full bg-current transition-all duration-300',
                    mobileOpen ? 'scale-x-0 opacity-0' : 'opacity-100'
                  )}
                />
                <span
                  className={cn(
                    'absolute inset-x-0 block h-[1.5px] origin-center rounded-full bg-current transition-all duration-300',
                    mobileOpen ? 'top-[7px] -rotate-45' : 'top-[11px]'
                  )}
                />
              </div>
            </Button>
          </div>

          <MobileDrawer
            isOpen={mobileOpen}
            onClose={closeMobile}
            homeUrl='/'
            displayLogo={
              <HeaderLogo
                src={systemLogo}
                loading={loading}
                logoLoaded={logoLoaded}
                className='size-full rounded-lg object-contain'
              />
            }
            displaySiteName={systemName}
            loading={loading}
            logoLoaded={logoLoaded}
            mobileLinksList={mobileLinksForDrawer}
            showAuthButtons
            user={user}
            onNavLinkClick={handleNavLinkClick}
          />
        </>
      ) : null}

      <Dialog
        open={!!authPromptTarget}
        onOpenChange={(open) => {
          if (!open) closeAuthPrompt()
        }}
        title={t('Sign in required')}
        description={t('Please sign in to view {{module}}.', {
          module: authPromptTarget?.title || '',
        })}
        contentClassName='sm:max-w-md'
        contentHeight='auto'
        footer={
          <>
            <Button variant='outline' onClick={closeAuthPrompt}>
              {t('Cancel')}
            </Button>
            <Button onClick={navigateToSignIn}>{t('Sign in now')}</Button>
          </>
        }
      >
        <div className='bg-muted/40 text-muted-foreground rounded-lg px-3 py-2 text-sm'>
          {t('Redirecting to sign in in {{seconds}} seconds.', {
            seconds: authPromptSecondsLeft,
          })}
        </div>
      </Dialog>
    </>
  )
}
