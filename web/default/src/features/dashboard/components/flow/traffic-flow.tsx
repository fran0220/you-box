import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/auth-store'
import { ROLE } from '@/lib/roles'
import { formatCompactNumber, formatQuota } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Panel, PanelBody, PanelHeader } from '@/components/patterns/panel'
import { EmptyState } from '@/components/youbox'
import { getFlowData } from '../../api'
import type { FlowQuotaData } from '../../types'

type FlowAggregate = {
  key: string
  quota: number
  count: number
  tokenUsed: number
}

function aggregate(rows: FlowQuotaData[], getKey: (row: FlowQuotaData) => string) {
  const map = new Map<string, FlowAggregate>()
  rows.forEach((row) => {
    const key = getKey(row) || '-'
    const current = map.get(key) || { key, quota: 0, count: 0, tokenUsed: 0 }
    current.quota += Number(row.quota || 0)
    current.count += Number(row.count || 0)
    current.tokenUsed += Number(row.token_used || 0)
    map.set(key, current)
  })
  return [...map.values()].sort((a, b) => b.quota - a.quota).slice(0, 8)
}

function FlowColumn(props: { title: string; rows: FlowAggregate[]; totalQuota: number }) {
  const { t } = useTranslation()
  return (
    <div className='min-w-0 rounded-lg border border-border/70'>
      <div className='border-border/70 border-b px-3 py-2 font-mono text-[11px] tracking-[0.06em] uppercase'>
        {props.title}
      </div>
      <div className='divide-border/70 divide-y'>
        {props.rows.length === 0 ? (
          <div className='text-muted-foreground px-3 py-4 text-sm'>{t('No data')}</div>
        ) : (
          props.rows.map((row) => {
            const percent = props.totalQuota > 0 ? (row.quota / props.totalQuota) * 100 : 0
            return (
              <div key={row.key} className='space-y-2 px-3 py-3'>
                <div className='flex items-center justify-between gap-3 text-sm'>
                  <span className='truncate'>{row.key}</span>
                  <span className='font-mono text-xs tabular-nums'>{formatQuota(row.quota)}</span>
                </div>
                <div className='bg-muted h-1 overflow-hidden rounded-full'>
                  <div className='bg-primary h-full' style={{ width: `${Math.min(100, percent)}%` }} />
                </div>
                <div className='text-muted-foreground flex justify-between text-xs tabular-nums'>
                  <span>{formatCompactNumber(row.count)} {t('requests')}</span>
                  <span>{formatCompactNumber(row.tokenUsed)} {t('tokens')}</span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export function TrafficFlow() {
  const { t } = useTranslation()
  const userRole = useAuthStore((state) => state.auth.user?.role)
  const isAdmin = Boolean(userRole && userRole >= ROLE.ADMIN)
  const [days, setDays] = useState(7)
  const [username, setUsername] = useState('')
  const [end] = useState(() => Math.floor(Date.now() / 1000))
  const start = end - days * 24 * 60 * 60

  const query = useQuery({
    queryKey: ['dashboard-flow', start, end, username, isAdmin],
    queryFn: async () =>
      getFlowData(
        {
          start_timestamp: start,
          end_timestamp: end,
          username: isAdmin && username.trim() ? username.trim() : undefined,
        },
        isAdmin
      ),
  })

  const rows = useMemo(() => query.data?.data || [], [query.data?.data])
  const totalQuota = rows.reduce((sum, row) => sum + Number(row.quota || 0), 0)
  const totalCount = rows.reduce((sum, row) => sum + Number(row.count || 0), 0)
  const columns = useMemo(
    () => [
      { title: t('Users'), rows: aggregate(rows, (row) => row.username || `#${row.user_id}`) },
      { title: t('Nodes'), rows: aggregate(rows, (row) => row.node_name) },
      { title: t('Channels'), rows: aggregate(rows, (row) => row.channel_name || `#${row.channel_id}`) },
      { title: t('Models'), rows: aggregate(rows, (row) => row.model_name) },
    ],
    [rows, t]
  )

  return (
    <div className='mx-auto w-full max-w-[1180px] space-y-4'>
      <Panel>
        <PanelHeader
          eyebrow={t('Traffic')}
          title={t('Traffic Flow')}
          actions={
            <div className='flex flex-wrap items-center justify-end gap-2'>
              {isAdmin ? (
                <Input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder={t('Filter username')}
                  className='h-8 w-40'
                />
              ) : null}
              {[1, 7, 30].map((value) => (
                <Button
                  key={value}
                  size='sm'
                  variant={days === value ? 'default' : 'outline'}
                  onClick={() => setDays(value)}
                >
                  {t('{{count}}d', { count: value })}
                </Button>
              ))}
            </div>
          }
        />
        <PanelBody>
          <div className='mb-4 grid gap-3 sm:grid-cols-3'>
            <div className='border-border/70 rounded-lg border p-3'>
              <div className='yb-eyebrow'>{t('Quota')}</div>
              <div className='font-display mt-1 text-2xl'>{formatQuota(totalQuota)}</div>
            </div>
            <div className='border-border/70 rounded-lg border p-3'>
              <div className='yb-eyebrow'>{t('Requests')}</div>
              <div className='font-display mt-1 text-2xl'>{formatCompactNumber(totalCount)}</div>
            </div>
            <div className='border-border/70 rounded-lg border p-3'>
              <div className='yb-eyebrow'>{t('Rows')}</div>
              <div className='font-display mt-1 text-2xl'>{formatCompactNumber(rows.length)}</div>
            </div>
          </div>
          {query.isLoading ? (
            <div className='text-muted-foreground py-10 text-center text-sm'>{t('Loading...')}</div>
          ) : rows.length === 0 ? (
            <EmptyState
              title={t('No flow data')}
              description={t('No traffic flow rows were found for this time range.')}
            />
          ) : (
            <div className='grid gap-3 lg:grid-cols-4'>
              {columns.map((column) => (
                <FlowColumn key={column.title} title={column.title} rows={column.rows} totalQuota={totalQuota} />
              ))}
            </div>
          )}
        </PanelBody>
      </Panel>
    </div>
  )
}
