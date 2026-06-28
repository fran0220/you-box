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
import { Share2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatQuota } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { CopyButton } from '@/components/copy-button'
import { Panel, PanelBody, PanelHeader } from '@/components/patterns'
import type { UserWalletData } from '../types'

interface AffiliateRewardsCardProps {
  user: UserWalletData | null
  affiliateLink: string
  onTransfer: () => void
  complianceConfirmed?: boolean
  loading?: boolean
}

export function AffiliateRewardsCard({
  user,
  affiliateLink,
  onTransfer,
  complianceConfirmed = true,
  loading,
}: AffiliateRewardsCardProps) {
  const { t } = useTranslation()
  if (loading) {
    return (
      <Panel>
        <PanelHeader title={t('Referral Program')} />
        <PanelBody className='space-y-4'>
          <Skeleton className='h-4 w-full max-w-md' />
          <div className='grid grid-cols-3 gap-3'>
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className='h-12 rounded-md' />
            ))}
          </div>
          <Skeleton className='h-9 w-full' />
        </PanelBody>
      </Panel>
    )
  }

  const hasRewards = (user?.aff_quota ?? 0) > 0

  return (
    <Panel>
      <PanelHeader title={t('Referral Program')} />
      <PanelBody className='space-y-4'>
        <div className='flex min-w-0 items-start gap-3'>
          <div className='bg-brand-subtle text-brand flex size-10 shrink-0 items-center justify-center rounded-[10px]'>
            <Share2 className='size-[19px]' aria-hidden />
          </div>
          <p className='text-muted-foreground m-0 text-sm leading-snug'>
            {t(
              'Earn rewards when your referrals add funds. Transfer accumulated rewards to your balance anytime.'
            )}
          </p>
        </div>

        <div className='grid grid-cols-3 gap-2 text-center'>
          {[
            [t('Pending'), formatQuota(user?.aff_quota ?? 0)],
            [t('Total Earned'), formatQuota(user?.aff_history_quota ?? 0)],
            [t('Invites'), String(user?.aff_count ?? 0)],
          ].map(([label, value]) => (
            <div
              key={label}
              className='bg-muted/30 rounded-md border px-2 py-2.5'
            >
              <div
                className='text-muted-foreground truncate font-mono text-[10px] font-medium tracking-wider uppercase'
                title={label}
              >
                {label}
              </div>
              <div className='text-foreground mt-1 truncate font-display text-sm font-semibold tabular-nums'>
                {value}
              </div>
            </div>
          ))}
        </div>

        <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
          <Input
            value={affiliateLink}
            readOnly
            className='h-9 min-w-0 flex-1 font-mono text-xs'
          />
          <div className='flex shrink-0 items-center gap-2'>
            <CopyButton
              value={affiliateLink}
              variant='outline'
              className='size-9 shrink-0'
              iconClassName='size-4'
              tooltip={t('Copy referral link')}
              aria-label={t('Copy referral link')}
            />
            {hasRewards ? (
              <Button
                onClick={onTransfer}
                disabled={!complianceConfirmed}
                className='h-9 shrink-0 px-3'
                size='sm'
              >
                {t('Transfer to Balance')}
              </Button>
            ) : null}
          </div>
        </div>
        {!complianceConfirmed ? (
          <p className='text-muted-foreground m-0 text-xs'>
            {t(
              'Referral reward transfer is disabled until the administrator confirms compliance terms.'
            )}
          </p>
        ) : null}
      </PanelBody>
    </Panel>
  )
}
