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
import { User, Wallet, LogOut } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { AuthUser } from '@/stores/auth-store'
import useDialogState from '@/hooks/use-dialog'
import { useUserDisplay } from '@/hooks/use-user-display'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { SignOutDialog } from '@/components/sign-out-dialog'
import type { TopNavLink } from '../types'

/**
 * Brand logo component with skeleton loading
 */
interface BrandLogoProps {
  homeUrl: string
  displayLogo: React.ReactNode
  displaySiteName: string
  loading: boolean
  logoLoaded: boolean
  onClick?: () => void
}

function BrandLogo({
  homeUrl,
  displayLogo,
  displaySiteName,
  loading,
  logoLoaded,
  onClick,
}: BrandLogoProps) {
  return (
    <Link
      to={homeUrl}
      className='flex items-center gap-2 text-xl font-bold'
      onClick={onClick}
    >
      <div className='relative h-6 w-6'>
        {loading || !logoLoaded ? (
          <Skeleton className='absolute inset-0 rounded-full' />
        ) : null}
        {displayLogo}
      </div>
      {loading ? <Skeleton className='h-5 w-20' /> : displaySiteName}
    </Link>
  )
}

/**
 * Mobile user profile section with navigation links
 */
interface MobileUserProfileProps {
  user: AuthUser | null
  onNavigate?: () => void
}

function MobileUserProfile({ user, onNavigate }: MobileUserProfileProps) {
  const { t } = useTranslation()
  const [signOutOpen, setSignOutOpen] = useDialogState()
  const { displayName, initials, roleLabel } = useUserDisplay(user)

  if (!user) return null

  return (
    <>
      {/* User info section - compact style matching navigation */}
      <div className='flex flex-col text-sm'>
        {/* User header - simplified */}
        <div className='border-border flex items-center gap-2.5 border-b p-2.5'>
          <Avatar className='size-9'>
            <AvatarImage src='/avatars/01.png' alt={`@${displayName}`} />
            <AvatarFallback className='text-xs'>{initials}</AvatarFallback>
          </Avatar>
          <div className='flex flex-1 flex-col gap-0.5 overflow-hidden'>
            <p className='text-foreground truncate font-medium'>
              {displayName}
            </p>
            <div className='flex items-center gap-1.5'>
              <span className='text-muted-foreground text-xs'>{roleLabel}</span>
              {user.group && (
                <>
                  <span className='text-muted-foreground text-xs'>·</span>
                  <span className='text-muted-foreground text-xs'>
                    {String(user.group)}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Navigation links - same style as top nav */}
        <Link
          to='/profile'
          onClick={onNavigate}
          className='text-primary/60 hover:text-primary/80 border-border flex items-center gap-2.5 border-b p-2.5 transition-colors'
        >
          <User className='size-4' />
          {t('Profile')}
        </Link>

        <Link
          to='/wallet'
          onClick={onNavigate}
          className='text-primary/60 hover:text-primary/80 border-border flex items-center gap-2.5 border-b p-2.5 transition-colors'
        >
          <Wallet className='size-4' />
          {t('Wallet')}
        </Link>

        {/* Sign out - consistent style */}
        <Button
          variant='ghost'
          onClick={() => setSignOutOpen(true)}
          className='text-destructive hover:text-destructive/80 h-auto w-full justify-start gap-2.5 p-2.5 hover:bg-transparent'
        >
          <LogOut className='size-4' />
          {t('Sign out')}
        </Button>
      </div>

      <SignOutDialog open={!!signOutOpen} onOpenChange={setSignOutOpen} />
    </>
  )
}

/**
 * Mobile sign in button for unauthenticated users
 */
interface MobileSignInButtonProps {
  onNavigate?: () => void
}

function MobileSignInButton({ onNavigate }: MobileSignInButtonProps) {
  const { t } = useTranslation()
  return (
    <Button
      variant='secondary'
      size='sm'
      className='h-10 w-full'
      render={<Link to='/sign-in' onClick={onNavigate} />}
    >
      {t('Sign in')}
    </Button>
  )
}

/**
 * Mobile drawer component props
 */
export interface MobileDrawerProps {
  isOpen: boolean
  onClose: () => void
  homeUrl: string
  displayLogo: React.ReactNode
  displaySiteName: string
  loading: boolean
  logoLoaded: boolean
  mobileLinksList: TopNavLink[]
  showAuthButtons: boolean
  user: AuthUser | null
  onNavLinkClick?: (
    event: React.MouseEvent<HTMLAnchorElement>,
    link: TopNavLink,
    options?: { closeMobile?: () => void }
  ) => void
}

/**
 * Mobile navigation drawer.
 *
 * Re-hosted on the shared Base UI `Sheet` primitive (side="left") instead of a
 * hand-rolled `motion` overlay. The Sheet supplies the full a11y contract that
 * the old implementation lacked (B2): focus trap, scroll-lock, ESC-to-close,
 * `role="dialog"`, and `aria-labelledby`/`aria-describedby` wiring (via the
 * sr-only `SheetTitle`/`SheetDescription`). Surface uses the canonical `bg-card`
 * token and the overlay uses `bg-[var(--overlay)]` + backdrop-blur (from the
 * Sheet primitive), replacing the divergent `bg-black/50 backdrop-blur-sm`.
 *
 * The external prop contract (`isOpen`/`onClose` + nav content) is preserved;
 * `onClose` fires whenever the Sheet requests dismissal (overlay click, ESC,
 * close button, or link navigation).
 */
export function MobileDrawer({
  isOpen,
  onClose,
  homeUrl,
  displayLogo,
  displaySiteName,
  loading,
  logoLoaded,
  mobileLinksList,
  showAuthButtons,
  user,
  onNavLinkClick,
}: MobileDrawerProps) {
  const { t } = useTranslation()

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <SheetContent
        side='left'
        className='w-[88%] max-w-sm gap-0 p-4 md:hidden'
      >
        {/* Accessible name/description for the dialog. Kept visually hidden
            because the in-flow brand logo serves as the visual heading. */}
        <SheetTitle className='sr-only'>{t('Navigation menu')}</SheetTitle>
        <SheetDescription className='sr-only'>
          {t('Site navigation and account options')}
        </SheetDescription>

        <div className='flex flex-col gap-4'>
          {/* Header with logo (the Sheet renders its own close button) */}
          <div className='flex items-center justify-between'>
            <BrandLogo
              homeUrl={homeUrl}
              displayLogo={displayLogo}
              displaySiteName={displaySiteName}
              loading={loading}
              logoLoaded={logoLoaded}
              onClick={onClose}
            />
          </div>

          {/* Navigation links */}
          <div className='border-border mb-4 flex flex-col rounded-md border text-sm'>
            {loading ? (
              <div className='flex flex-col gap-1 p-2'>
                {Array.from({ length: 4 }, (_, i) => (
                  <Skeleton key={i} className='h-8 w-full' />
                ))}
              </div>
            ) : (
              mobileLinksList.map((link, index) => {
                const label = t(link.title)
                const closeMobile = () => onClose()
                const handleClick = (
                  event: React.MouseEvent<HTMLAnchorElement>
                ) => {
                  if (onNavLinkClick) {
                    onNavLinkClick(event, link, { closeMobile })
                    if (!event.defaultPrevented) onClose()
                    return
                  }
                  onClose()
                }
                return (
                  <div
                    key={`${link.href}-${index}`}
                    className='border-border border-b p-2.5 last:border-b-0'
                  >
                    {link.external ? (
                      <a
                        href={link.href}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-primary/60 hover:text-primary/80 transition-colors'
                        onClick={handleClick}
                      >
                        {label}
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        disabled={link.disabled}
                        className='text-primary/60 hover:text-primary/80 transition-colors'
                        onClick={handleClick}
                      >
                        {label}
                      </Link>
                    )}
                  </div>
                )
              })
            )}
          </div>

          {/* User profile section */}
          {showAuthButtons &&
            (user ? (
              <MobileUserProfile user={user} onNavigate={onClose} />
            ) : (
              <MobileSignInButton onNavigate={onClose} />
            ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}
