import { useTranslation } from 'react-i18next'
import { useDialogs } from '@/hooks/use-dialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Panel, PanelBody, PanelHeader } from '@/components/patterns'
import { SettingRow, SettingsPanel } from '@/components/settings'
import type { UserProfile } from '../types'
import { AccessTokenDialog } from './dialogs/access-token-dialog'
import { ChangePasswordDialog } from './dialogs/change-password-dialog'
import { DeleteAccountDialog } from './dialogs/delete-account-dialog'

// ============================================================================
// Profile Security Card (r2-B13 section 4) — SettingRow list
// ============================================================================

interface ProfileSecurityCardProps {
  profile: UserProfile | null
  loading: boolean
}

type DialogKey = 'password' | 'token' | 'delete'

export function ProfileSecurityCard({
  profile,
  loading,
}: ProfileSecurityCardProps) {
  const { t } = useTranslation()
  const dialogs = useDialogs<DialogKey>()

  if (loading) {
    return (
      <Panel>
        <PanelHeader>
          <Skeleton className='h-5 w-32' />
        </PanelHeader>
        <PanelBody className='space-y-3'>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className='h-14 w-full' />
          ))}
        </PanelBody>
      </Panel>
    )
  }

  if (!profile) return null

  return (
    <>
      <SettingsPanel title={t('Security')}>
        <SettingRow
          label={t('Password')}
          description={t('Update your password to keep your account secure')}
          control={
            <Button
              variant='outline'
              size='sm'
              onClick={() => dialogs.open('password')}
            >
              {t('Change Password')}
            </Button>
          }
        />
        <SettingRow
          label={t('Access Token')}
          description={t('Generate and manage your API access token')}
          control={
            <Button
              variant='outline'
              size='sm'
              onClick={() => dialogs.open('token')}
            >
              {t('Manage')}
            </Button>
          }
        />
        <SettingRow
          label={t('Delete Account')}
          description={t('Permanently delete your account and all data')}
          control={
            <Button
              variant='destructive'
              size='sm'
              onClick={() => dialogs.open('delete')}
            >
              {t('Delete Account')}
            </Button>
          }
        />
      </SettingsPanel>

      {/* Dialogs */}
      <ChangePasswordDialog
        open={dialogs.isOpen('password')}
        onOpenChange={(open) =>
          open ? dialogs.open('password') : dialogs.close('password')
        }
        username={profile.username}
      />

      <AccessTokenDialog
        open={dialogs.isOpen('token')}
        onOpenChange={(open) =>
          open ? dialogs.open('token') : dialogs.close('token')
        }
      />

      <DeleteAccountDialog
        open={dialogs.isOpen('delete')}
        onOpenChange={(open) =>
          open ? dialogs.open('delete') : dialogs.close('delete')
        }
        username={profile.username}
      />
    </>
  )
}
