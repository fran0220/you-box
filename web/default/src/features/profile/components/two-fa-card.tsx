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
import { useDialogs } from '@/hooks/use-dialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Panel, PanelBody, PanelHeader } from '@/components/patterns'
import { SettingRow, SettingsPanel } from '@/components/settings'
import { StatusBadge } from '@/components/status-badge'
import { useTwoFA } from '../hooks'
import { TwoFABackupDialog } from './dialogs/two-fa-backup-dialog'
import { TwoFADisableDialog } from './dialogs/two-fa-disable-dialog'
import { TwoFASetupDialog } from './dialogs/two-fa-setup-dialog'

// ============================================================================
// Two-Factor Authentication Card (r2-B13 section 4) — SettingRow form
// ============================================================================

interface TwoFACardProps {
  loading: boolean
}

type DialogKey = 'setup' | 'disable' | 'backup'

export function TwoFACard({ loading: pageLoading }: TwoFACardProps) {
  const { t } = useTranslation()
  const { status, loading, refetch } = useTwoFA(!pageLoading)
  const dialogs = useDialogs<DialogKey>()

  if (pageLoading || loading) {
    return (
      <Panel>
        <PanelHeader>
          <Skeleton className='h-5 w-48' />
        </PanelHeader>
        <PanelBody>
          <Skeleton className='h-14 w-full' />
        </PanelBody>
      </Panel>
    )
  }

  return (
    <>
      <SettingsPanel title={t('Two-Factor Authentication')}>
        <SettingRow
          label={t('Two-Step Verification')}
          description={
            status.enabled
              ? t('Backup codes remaining: {{count}}', {
                  count: status.backup_codes_remaining,
                })
              : t('Add an extra layer of security to your account')
          }
          control={
            <>
              <StatusBadge
                label={status.enabled ? t('Enabled') : t('Disabled')}
                variant={status.enabled ? 'success' : 'neutral'}
                appearance='soft'
                showDot={false}
                copyable={false}
              />
              {status.locked && (
                <StatusBadge
                  label={t('Locked')}
                  variant='danger'
                  appearance='soft'
                  showDot={false}
                  copyable={false}
                />
              )}
              {!status.enabled && (
                <Button size='sm' onClick={() => dialogs.open('setup')}>
                  {t('Enable')}
                </Button>
              )}
            </>
          }
        />

        {status.enabled && (
          <>
            <SettingRow
              label={t('Regenerate Backup Codes')}
              description={t(
                'Backup codes let you sign in when your authenticator is unavailable'
              )}
              control={
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => dialogs.open('backup')}
                >
                  {t('Regenerate')}
                </Button>
              }
            />
            <SettingRow
              label={t('Disable 2FA')}
              description={t(
                'Your account will no longer require a verification code at sign-in'
              )}
              control={
                <Button
                  variant='destructive'
                  size='sm'
                  onClick={() => dialogs.open('disable')}
                >
                  {t('Disable')}
                </Button>
              }
            />
          </>
        )}
      </SettingsPanel>

      {/* Dialogs */}
      <TwoFASetupDialog
        open={dialogs.isOpen('setup')}
        onOpenChange={(open) =>
          open ? dialogs.open('setup') : dialogs.close('setup')
        }
        onSuccess={refetch}
      />

      <TwoFADisableDialog
        open={dialogs.isOpen('disable')}
        onOpenChange={(open) =>
          open ? dialogs.open('disable') : dialogs.close('disable')
        }
        onSuccess={refetch}
      />

      <TwoFABackupDialog
        open={dialogs.isOpen('backup')}
        onOpenChange={(open) =>
          open ? dialogs.open('backup') : dialogs.close('backup')
        }
        onSuccess={refetch}
      />
    </>
  )
}
