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
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/auth-store'
import { useStatus } from '@/hooks/use-status'
import { SectionPageLayout } from '@/components/layout'
import { PageHeader } from '@/components/youbox'
import {
  CardStaggerContainer,
  CardStaggerItem,
} from '@/components/page-transition'
import { AccountCard } from './components/account-card'
import { CheckinCalendarCard } from './components/checkin-calendar-card'
import { LanguagePreferencesCard } from './components/language-preferences-card'
import { PasskeyCard } from './components/passkey-card'
import { ProfileSecurityCard } from './components/profile-security-card'
import { ProfileSettingsCard } from './components/profile-settings-card'
import { SidebarModulesCard } from './components/sidebar-modules-card'
import { TwoFACard } from './components/two-fa-card'
import { useProfile } from './hooks'

export function Profile() {
  const { t } = useTranslation()
  const { profile, loading, refreshProfile } = useProfile()
  const { status } = useStatus()
  const permissions = useAuthStore((s) => s.auth.user?.permissions)

  const checkinEnabled = status?.checkin_enabled === true
  const turnstileEnabled = !!(
    status?.turnstile_check && status?.turnstile_site_key
  )
  const turnstileSiteKey = status?.turnstile_site_key || ''
  const canConfigureSidebar = permissions?.sidebar_settings !== false

  return (
    <SectionPageLayout>
      <SectionPageLayout.Content>
        <div className='mx-auto w-full max-w-[980px] space-y-5'>
          <PageHeader
            eyebrow={t('Account')}
            title={t('Profile')}
            subtitle={t(
              'Manage your account, security, bindings, and preferences.'
            )}
          />
          <CardStaggerContainer className='grid w-full gap-4 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start'>
          <CardStaggerItem className='lg:self-start'>
            <div className='lg:sticky lg:top-6'>
              <AccountCard profile={profile} loading={loading} />
            </div>
          </CardStaggerItem>

          <CardStaggerItem>
            <div className='flex min-w-0 flex-col gap-4'>
              <ProfileSettingsCard
                profile={profile}
                loading={loading}
                onProfileUpdate={refreshProfile}
              />
              <ProfileSecurityCard profile={profile} loading={loading} />
              <TwoFACard loading={loading} />
              <PasskeyCard loading={loading} />
              <LanguagePreferencesCard
                profile={profile}
                onProfileUpdate={refreshProfile}
              />
              {canConfigureSidebar && <SidebarModulesCard />}
              {checkinEnabled && (
                <CheckinCalendarCard
                  checkinEnabled={checkinEnabled}
                  turnstileEnabled={turnstileEnabled}
                  turnstileSiteKey={turnstileSiteKey}
                />
              )}
            </div>
          </CardStaggerItem>
          </CardStaggerContainer>
        </div>
      </SectionPageLayout.Content>
    </SectionPageLayout>
  )
}
