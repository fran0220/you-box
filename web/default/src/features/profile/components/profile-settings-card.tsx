import { useState } from 'react'
import { Link2, Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Panel, PanelBody, PanelHeader } from '@/components/patterns'
import type { UserProfile } from '../types'
import { AccountBindingsTab } from './tabs/account-bindings-tab'
import { NotificationTab } from './tabs/notification-tab'

// ============================================================================
// Profile Settings Card Component
// ============================================================================

interface ProfileSettingsCardProps {
  profile: UserProfile | null
  loading: boolean
  onProfileUpdate: () => void
}

export function ProfileSettingsCard({
  profile,
  loading,
  onProfileUpdate,
}: ProfileSettingsCardProps) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('bindings')

  if (loading) {
    return (
      <Panel>
        <PanelHeader>
          <Skeleton className='h-5 w-32' />
        </PanelHeader>
        <PanelBody className='space-y-4'>
          <Skeleton className='h-10 w-full' />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className='h-20 w-full' />
          ))}
        </PanelBody>
      </Panel>
    )
  }

  return (
    <Panel>
      <PanelHeader title={t('Settings')} />
      <PanelBody>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className='grid w-full grid-cols-2 items-stretch gap-1 rounded-xl p-1 group-data-horizontal/tabs:h-10'>
            <TabsTrigger
              value='bindings'
              className='h-full gap-2 rounded-lg px-3 py-0 leading-none'
            >
              <Link2 className='h-4 w-4' />
              <span className='hidden sm:inline'>{t('Account Bindings')}</span>
              <span className='sm:hidden'>{t('Bindings')}</span>
            </TabsTrigger>
            <TabsTrigger
              value='settings'
              className='h-full gap-2 rounded-lg px-3 py-0 leading-none'
            >
              <Settings className='h-4 w-4' />
              <span className='hidden sm:inline'>
                {t('Settings & Preferences')}
              </span>
              <span className='sm:hidden'>{t('Settings')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value='bindings' className='mt-4 sm:mt-6'>
            <AccountBindingsTab profile={profile} onUpdate={onProfileUpdate} />
          </TabsContent>

          <TabsContent value='settings' className='mt-4 sm:mt-6'>
            <NotificationTab profile={profile} onUpdate={onProfileUpdate} />
          </TabsContent>
        </Tabs>
      </PanelBody>
    </Panel>
  )
}
