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
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Check, Copy, Megaphone, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/auth-store'
import { getUserAvatarFallback, getUserAvatarStyle } from '@/lib/avatar'
import { formatNumber, formatQuota } from '@/lib/format'
import { computeTimeRange } from '@/lib/time'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Metric,
  Panel,
  PanelBody,
  PanelHeader,
  Sparkline,
} from '@/components/patterns'
import { CardStaggerContainer, CardStaggerItem } from '@/components/page-transition'
import { CodeBlock } from '@/components/youbox/code-block'
import { getUserQuotaDates } from '@/features/dashboard/api'
import type { AnnouncementItem } from '@/features/dashboard/types'
import { getApiKeys } from '@/features/keys/api'
import type { ApiKey } from '@/features/keys/types'
import { useAnnouncements, useApiInfo } from '../../hooks/use-status-data'
import { AnnouncementDetailModal } from './announcement-detail-dialog'

const OVERVIEW_RANGE_DAYS = 30
const BANNER_DISMISSED_KEY = 'overview_announcement_dismissed'

const FIRST_CALL_SNIPPET = [
  'curl https://api.you-box.com/v1/chat/completions \\',
  '  -H "Authorization: Bearer $YOUBOX_API_KEY" \\',
  '  -d \'{"model": "gpt-4.1-mini", "messages": [{"role": "user", "content": "Hello"}]}\'',
].join('\n')

function announcementKey(item: AnnouncementItem): string {
  if (item.id !== undefined && item.id !== null) return `id:${item.id}`
  return `hash:${(item.publishDate || '') + (item.content || '').slice(0, 64)}`
}

function relativeTime(
  ts: number,
  t: (key: string, opts?: Record<string, unknown>) => string
): string {
  if (!ts) return t('Never')
  const seconds = Math.max(0, Math.floor(Date.now() / 1000) - ts)
  if (seconds < 60) return t('{{count}}s ago', { count: seconds })
  if (seconds < 3600) {
    return t('{{count}}m ago', { count: Math.floor(seconds / 60) })
  }
  if (seconds < 86400) {
    return t('{{count}}h ago', { count: Math.floor(seconds / 3600) })
  }
  return t('{{count}}d ago', { count: Math.floor(seconds / 86400) })
}

/** Latest announcement as a dismissible one-line banner. */
function AnnouncementBanner() {
  const { t } = useTranslation()
  const { items } = useAnnouncements()
  const [detailOpen, setDetailOpen] = useState(false)
  const [dismissed, setDismissed] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    return window.localStorage.getItem(BANNER_DISMISSED_KEY)
  })

  const latest = items.length > 0 ? items[0] : null
  if (!latest) return null

  const key = announcementKey(latest)
  if (dismissed === key) return null

  return (
    <>
      <div className='border-border bg-card flex items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-sm'>
        <Megaphone className='text-brand size-4 shrink-0' aria-hidden='true' />
        <p className='min-w-0 flex-1 truncate'>{latest.content}</p>
        <Button
          variant='ghost'
          size='sm'
          className='shrink-0'
          onClick={() => setDetailOpen(true)}
        >
          {t('Details')}
        </Button>
        <Button
          variant='ghost'
          size='icon-sm'
          className='shrink-0'
          aria-label={t('Dismiss')}
          onClick={() => {
            window.localStorage.setItem(BANNER_DISMISSED_KEY, key)
            setDismissed(key)
          }}
        >
          <X className='size-4' aria-hidden='true' />
        </Button>
      </div>
      <AnnouncementDetailModal
        open={detailOpen}
        onOpenChange={setDetailOpen}
        announcement={latest}
      />
    </>
  )
}

function ProfileCard() {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.auth.user)
  const avatarName = user?.username || user?.display_name || 'U'

  return (
    <Panel>
      <PanelHeader
        title={t('Profile')}
        actions={
          <Button variant='outline' size='sm' render={<Link to='/profile' />}>
            {t('View Settings')}
          </Button>
        }
      />
      <PanelBody className='flex items-center gap-4'>
        <Avatar className='size-10'>
          <AvatarFallback
            className='font-semibold text-white'
            style={getUserAvatarStyle(avatarName)}
          >
            {getUserAvatarFallback(avatarName)}
          </AvatarFallback>
        </Avatar>
        <div className='grid flex-1 grid-cols-2 gap-4 sm:grid-cols-3'>
          <Metric k={t('Username')} v={user?.username || '—'} />
          <Metric k={t('Email')} v={user?.email || '—'} />
          <Metric k={t('Group')} v={user?.group || 'default'} />
        </div>
      </PanelBody>
    </Panel>
  )
}

function UsageCard() {
  const { t } = useTranslation()

  const window = useMemo(() => computeTimeRange(OVERVIEW_RANGE_DAYS), [])

  const trendQuery = useQuery({
    queryKey: [
      'dashboard',
      'account-overview',
      'usage',
      window.start_timestamp,
      window.end_timestamp,
    ],
    queryFn: async () =>
      getUserQuotaDates({
        start_timestamp: window.start_timestamp,
        end_timestamp: window.end_timestamp,
        default_time: 'day',
      }),
    staleTime: 60 * 1000,
  })

  const { totals, series } = useMemo(() => {
    const items = trendQuery.data?.data ?? []
    const byDay = new Map<string, number>()
    let requests = 0
    let tokens = 0
    let spend = 0
    for (const item of items) {
      requests += Number(item.count) || 0
      tokens += Number(item.token_used) || 0
      spend += Number(item.quota) || 0
      const day = String(item.created_at)
      byDay.set(day, (byDay.get(day) || 0) + (Number(item.count) || 0))
    }
    const sortedDays = [...byDay.keys()].sort()
    return {
      totals: { requests, tokens, spend },
      series: sortedDays.map((day) => byDay.get(day) || 0),
    }
  }, [trendQuery.data?.data])

  return (
    <Panel>
      <PanelHeader
        title={t('Usage (last 30 days)')}
        actions={
          <Button
            variant='outline'
            size='sm'
            render={
              <Link to='/usage-logs/$section' params={{ section: 'common' }} />
            }
          >
            {t('View Usage')}
          </Button>
        }
      />
      <PanelBody>
        {trendQuery.isLoading ? (
          <Skeleton className='h-12 w-full' />
        ) : (
          <div className='flex items-end gap-6'>
            <div className='grid flex-1 grid-cols-3 gap-4'>
              <Metric k={t('Requests')} v={formatNumber(totals.requests)} />
              <Metric k={t('Tokens')} v={formatNumber(totals.tokens)} />
              <Metric k={t('Spend')} v={formatQuota(totals.spend)} />
            </div>
            {series.length > 1 && (
              <div className='hidden w-36 sm:block'>
                <Sparkline data={series} height={32} />
              </div>
            )}
          </div>
        )}
      </PanelBody>
    </Panel>
  )
}

function BalanceCard() {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.auth.user)
  const remainQuota = Number(user?.quota ?? 0)

  return (
    <Panel>
      <PanelHeader
        title={t('Balance')}
        actions={
          <Button size='sm' render={<Link to='/wallet' />}>
            {t('Top up')}
          </Button>
        }
      />
      <PanelBody>
        <div className='font-mono text-3xl font-medium tracking-tight'>
          {formatQuota(remainQuota)}
        </div>
        <p className='text-muted-foreground mt-1 text-[13px]'>
          {t('Used {{amount}} in total', {
            amount: formatQuota(Number(user?.used_quota ?? 0)),
          })}
        </p>
      </PanelBody>
    </Panel>
  )
}

function KeyRow({ apiKey, t }: { apiKey: ApiKey; t: (k: string) => string }) {
  return (
    <div className='flex items-center justify-between gap-3 py-2 text-sm'>
      <span className='min-w-0 flex-1 truncate font-medium'>{apiKey.name}</span>
      <span className='text-muted-foreground hidden font-mono text-xs sm:inline'>
        {apiKey.group || 'default'}
      </span>
      <span className='text-muted-foreground shrink-0 text-xs'>
        {t('Last used')}{' '}
        {relativeTime(Number(apiKey.accessed_time) || 0, t)}
      </span>
    </div>
  )
}

function ApiKeysCard() {
  const { t } = useTranslation()
  const { items: apiInfoItems } = useApiInfo()
  const { copiedText, copyToClipboard } = useCopyToClipboard({
    successMessage: t('Copied to clipboard'),
  })

  const keysQuery = useQuery({
    queryKey: ['dashboard', 'account-overview', 'keys'],
    queryFn: async () => {
      const result = await getApiKeys({ p: 1, size: 3 })
      return result.success ? (result.data?.items ?? []) : []
    },
    staleTime: 60 * 1000,
  })

  const endpoint =
    apiInfoItems[0]?.url ||
    (typeof window !== 'undefined' ? window.location.origin : '')

  const keys = keysQuery.data ?? []

  return (
    <Panel>
      <PanelHeader
        title={t('API Keys')}
        actions={
          <Button variant='outline' size='sm' render={<Link to='/keys' />}>
            {t('Manage keys')}
          </Button>
        }
      />
      <PanelBody>
        <div className='border-border mb-3 flex items-center gap-2 border-b pb-3'>
          <Metric
            k={t('API endpoint')}
            v={<span className='select-all'>{endpoint}</span>}
            className='min-w-0 flex-1 [&>span:last-child]:truncate'
          />
          <Button
            variant='ghost'
            size='icon-sm'
            aria-label={t('Copy')}
            onClick={() => void copyToClipboard(endpoint)}
          >
            {copiedText === endpoint ? (
              <Check className='size-4' aria-hidden='true' />
            ) : (
              <Copy className='size-4' aria-hidden='true' />
            )}
          </Button>
        </div>
        {keysQuery.isLoading ? (
          <Skeleton className='h-16 w-full' />
        ) : keys.length > 0 ? (
          <div className='divide-border divide-y'>
            {keys.map((apiKey) => (
              <KeyRow key={apiKey.id} apiKey={apiKey} t={t} />
            ))}
          </div>
        ) : (
          <div className='space-y-3'>
            <ol className='text-muted-foreground list-inside list-decimal space-y-1 text-[13px]'>
              <li>{t('Create your first API key')}</li>
              <li>{t('Copy the key — it is shown only once')}</li>
              <li>{t('Make your first request')}</li>
            </ol>
            <CodeBlock
              code={FIRST_CALL_SNIPPET}
              language='bash'
              langLabel='BASH'
            />
            <Button size='sm' render={<Link to='/keys' />}>
              {t('Create key')}
            </Button>
          </div>
        )}
      </PanelBody>
    </Panel>
  )
}

/**
 * Account overview — Amp-style account status page: profile, usage,
 * balance and API keys as stacked cards inside a narrow column.
 */
export function AccountOverview() {
  return (
    <div className='mx-auto w-full max-w-3xl'>
      <CardStaggerContainer className='flex flex-col gap-4'>
        <CardStaggerItem>
          <AnnouncementBanner />
        </CardStaggerItem>
        <CardStaggerItem>
          <ProfileCard />
        </CardStaggerItem>
        <CardStaggerItem>
          <UsageCard />
        </CardStaggerItem>
        <CardStaggerItem>
          <BalanceCard />
        </CardStaggerItem>
        <CardStaggerItem>
          <ApiKeysCard />
        </CardStaggerItem>
      </CardStaggerContainer>
    </div>
  )
}
