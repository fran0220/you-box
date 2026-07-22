import { useTranslation } from 'react-i18next'
import { formatNumber, formatQuota } from '@/lib/format'
import { getRoleLabel, ROLE } from '@/lib/roles'
import { AnimatedNumber } from '@/components/ui/animated-number'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Metric, Panel, PanelBody } from '@/components/patterns'
import { StatusBadge, type StatusVariant } from '@/components/status-badge'
import { getDisplayName, getUserInitials } from '../lib'
import type { UserProfile } from '../types'

// ============================================================================
// Account Card (r2-B13 section 2) — left column identity card
// ============================================================================
//
// Notes recorded per the structure table:
// - "Change avatar" is intentionally not implemented: there is no avatar
//   upload backend; the avatar renders username initials only.
// - "Member since" row is omitted: GET /api/user/self (controller GetSelf)
//   does not return the account creation timestamp, so the value is not
//   available on this page.

interface AccountCardProps {
  profile: UserProfile | null
  loading: boolean
}

function getRoleVariant(role: number): StatusVariant {
  if (role >= ROLE.SUPER_ADMIN) return 'info'
  if (role >= ROLE.ADMIN) return 'brand'
  return 'neutral'
}

export function AccountCard({ profile, loading }: AccountCardProps) {
  const { t } = useTranslation()

  if (loading) {
    return (
      <Panel>
        <PanelBody>
          <div className='flex flex-col items-center gap-3'>
            <Skeleton className='size-20 rounded-full' />
            <Skeleton className='h-6 w-36' />
            <Skeleton className='h-4 w-44' />
            <Skeleton className='h-5 w-28' />
          </div>
          <div className='border-divider my-4 border-t' />
          <div className='space-y-3'>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className='flex items-center justify-between'>
                <Skeleton className='h-3.5 w-20' />
                <Skeleton className='h-3.5 w-24' />
              </div>
            ))}
          </div>
        </PanelBody>
      </Panel>
    )
  }

  if (!profile) return null

  const displayName = getDisplayName(profile)
  const initials = getUserInitials(profile)
  const metrics = [
    { k: t('Group'), v: profile.group || '-' },
    {
      k: t('API Requests'),
      v: <AnimatedNumber value={profile.request_count} format={formatNumber} />,
    },
    {
      k: t('Current Balance'),
      v: <AnimatedNumber value={profile.quota} format={formatQuota} />,
    },
    {
      k: t('Total Usage'),
      v: <AnimatedNumber value={profile.used_quota} format={formatQuota} />,
    },
  ]

  return (
    <Panel>
      <PanelBody>
        <div className='flex flex-col items-center gap-2 text-center'>
          <Avatar className='size-20'>
            <AvatarFallback className='bg-brand-subtle text-brand text-xl font-medium'>
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className='min-w-0 space-y-0.5'>
            <h2 className='font-display truncate text-xl font-bold tracking-[-0.01em]'>
              {displayName}
            </h2>
            <p className='text-muted-foreground truncate font-mono text-xs'>
              {profile.email || profile.username}
            </p>
          </div>

          <div className='flex flex-wrap items-center justify-center gap-1.5'>
            <StatusBadge
              label={getRoleLabel(profile.role)}
              variant={getRoleVariant(profile.role)}
              appearance='soft'
              showDot={false}
              copyable={false}
            />
            {profile.email && (
              <StatusBadge
                label={t('Verified')}
                variant='success'
                appearance='soft'
                showDot={false}
                copyable={false}
              />
            )}
          </div>
        </div>

        <div className='border-divider my-4 border-t' />

        <div className='space-y-3'>
          {metrics.map((metric) => (
            <Metric
              key={String(metric.k)}
              k={metric.k}
              v={metric.v}
              className='flex-row items-center justify-between gap-2'
            />
          ))}
        </div>
      </PanelBody>
    </Panel>
  )
}
