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
import { type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/auth-store'
import { SectionPageLayout } from '@/components/layout'
import { PageHeader } from '@/components/youbox'
import {
  CardStaggerContainer,
  CardStaggerItem,
} from '@/components/page-transition'
import { AccountCard } from './components/account-card'
import { LanguagePreferencesCard } from './components/language-preferences-card'
import { PasskeyCard } from './components/passkey-card'
import { ProfileSecurityCard } from './components/profile-security-card'
import { ProfileSettingsCard } from './components/profile-settings-card'
import { SidebarModulesCard } from './components/sidebar-modules-card'
import { TwoFACard } from './components/two-fa-card'
import { useProfile } from './hooks'

const SECTIONS = [
  { id: 'account', titleKey: 'Account' },
  { id: 'security', titleKey: 'Security' },
  { id: 'preferences', titleKey: 'Preferences' },
] as const

function SettingsSection({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: ReactNode
}) {
  return (
    <section id={id} className='scroll-mt-20'>
      <h2 className='text-muted-foreground mb-3 font-mono text-[11px] font-medium tracking-[0.08em] uppercase'>
        {title}
      </h2>
      <div className='flex flex-col gap-4'>{children}</div>
    </section>
  )
}

/**
 * Settings — account, security and preferences in anchored sections
 * with a slim side nav (Amp-style settings organization).
 */
export function Profile() {
  const { t } = useTranslation()
  const { profile, loading, refreshProfile } = useProfile()
  const permissions = useAuthStore((s) => s.auth.user?.permissions)

  const canConfigureSidebar = permissions?.sidebar_settings !== false

  return (
    <SectionPageLayout>
      <SectionPageLayout.Content>
        <div className='mx-auto w-full max-w-4xl space-y-5'>
          <PageHeader
            title={t('Settings')}
            subtitle={t(
              'Manage your account, security, bindings, and preferences.'
            )}
          />
          <div className='grid w-full gap-6 lg:grid-cols-[150px_minmax(0,1fr)] lg:items-start'>
            <nav
              aria-label={t('Settings')}
              className='top-20 hidden lg:sticky lg:block'
            >
              <ul className='flex flex-col gap-0.5 text-sm'>
                {SECTIONS.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className='text-muted-foreground hover:text-foreground hover:bg-muted/60 block rounded-md px-2.5 py-1.5 transition-colors'
                    >
                      {t(section.titleKey)}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <CardStaggerContainer className='flex min-w-0 flex-col gap-8'>
              <CardStaggerItem>
                <SettingsSection id='account' title={t('Account')}>
                  <AccountCard profile={profile} loading={loading} />
                  <ProfileSettingsCard
                    profile={profile}
                    loading={loading}
                    onProfileUpdate={refreshProfile}
                  />
                </SettingsSection>
              </CardStaggerItem>

              <CardStaggerItem>
                <SettingsSection id='security' title={t('Security')}>
                  <ProfileSecurityCard profile={profile} loading={loading} />
                  <TwoFACard loading={loading} />
                  <PasskeyCard loading={loading} />
                </SettingsSection>
              </CardStaggerItem>

              <CardStaggerItem>
                <SettingsSection id='preferences' title={t('Preferences')}>
                  <LanguagePreferencesCard
                    profile={profile}
                    onProfileUpdate={refreshProfile}
                  />
                  {canConfigureSidebar && <SidebarModulesCard />}
                </SettingsSection>
              </CardStaggerItem>
            </CardStaggerContainer>
          </div>
        </div>
      </SectionPageLayout.Content>
    </SectionPageLayout>
  )
}
