import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { RefreshCw, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { formatTimestamp } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/status-badge'
import { EmptyState, SettingsSection } from '@/components/youbox'

type SystemInstance = {
  node_name: string
  status: 'online' | 'stale'
  started_at: number
  last_seen_at: number
  info?: {
    node?: { name?: string }
    role?: { is_master?: boolean }
    runtime?: { version?: string }
    resources?: {
      cpu?: { usage_percent?: number }
      memory?: { usage_percent?: number }
    }
  }
  [key: string]: unknown
}

type SystemInstanceMutationResponse = {
  success: boolean
  message?: string
}

async function getSystemInstances(): Promise<SystemInstance[]> {
  const res = await api.get<{
    success: boolean
    message?: string
    data?: SystemInstance[]
  }>('/api/system-info/instances')
  if (!res.data.success || !Array.isArray(res.data.data)) {
    throw new Error(res.data.message || 'Failed to load system instances')
  }
  return res.data.data
}

async function deleteStaleInstances(): Promise<void> {
  const res = await api.delete<SystemInstanceMutationResponse>(
    '/api/system-info/stale-instances'
  )
  if (!res.data.success) {
    throw new Error(res.data.message || 'Failed to delete stale instances')
  }
}

async function deleteInstance(nodeName: string): Promise<void> {
  const res = await api.delete<SystemInstanceMutationResponse>(
    `/api/system-info/instances/${encodeURIComponent(nodeName)}`
  )
  if (!res.data.success) {
    throw new Error(res.data.message || 'Failed to delete system instance')
  }
}

function isStaleInstance(instance: SystemInstance): boolean {
  return instance.status === 'stale'
}

function instanceTime(instance: SystemInstance): string {
  const value = instance.last_seen_at || instance.started_at || 0
  return typeof value === 'number' && value > 0 ? formatTimestamp(value) : '-'
}

function formatPercent(value?: number): string {
  return typeof value === 'number' && Number.isFinite(value)
    ? `${value.toFixed(1)}%`
    : '-'
}

export function SystemInstancesPanel() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: ['system-info', 'instances'],
    queryFn: getSystemInstances,
    refetchInterval: 30_000,
  })

  const refresh = async () => {
    await queryClient.invalidateQueries({
      queryKey: ['system-info', 'instances'],
    })
  }

  const deleteStaleMutation = useMutation({
    mutationFn: deleteStaleInstances,
    onSuccess: () => {
      toast.success(t('Stale instances deleted'))
      void refresh()
    },
    onError: (error) =>
      toast.error(
        error instanceof Error ? error.message : t('Operation failed')
      ),
  })
  const deleteOneMutation = useMutation({
    mutationFn: deleteInstance,
    onSuccess: () => {
      toast.success(t('Instance deleted'))
      void refresh()
    },
    onError: (error) =>
      toast.error(
        error instanceof Error ? error.message : t('Operation failed')
      ),
  })

  const instances = query.data || []
  const staleCount = instances.filter(isStaleInstance).length

  return (
    <SettingsSection
      title={t('System Instances')}
      description={t(
        'Review active gateway nodes and clean up stale instance records.'
      )}
      footer={
        <div className='flex flex-wrap items-center gap-2'>
          <Button
            variant='outline'
            disabled={query.isFetching}
            onClick={() => void query.refetch()}
          >
            <RefreshCw className='size-4' />
            {t('Refresh')}
          </Button>
          <Button
            variant='outline'
            disabled={staleCount === 0 || deleteStaleMutation.isPending}
            loading={deleteStaleMutation.isPending}
            onClick={() => deleteStaleMutation.mutate()}
          >
            <Trash2 className='size-4' />
            {t('Delete stale instances')}
          </Button>
        </div>
      }
    >
      {query.isLoading ? (
        <div className='text-muted-foreground py-8 text-sm'>
          {t('Loading...')}
        </div>
      ) : query.isError ? (
        <EmptyState
          title={t('Failed to load system instances')}
          description={
            query.error instanceof Error ? query.error.message : undefined
          }
          actionLabel={t('Retry')}
          onAction={() => void query.refetch()}
        />
      ) : instances.length === 0 ? (
        <EmptyState
          title={t('No system instances')}
          description={t(
            'No instance heartbeat records were returned by the server.'
          )}
        />
      ) : (
        <div className='divide-border/70 divide-y'>
          {instances.map((instance) => {
            const nodeName = instance.info?.node?.name || instance.node_name
            const stale = isStaleInstance(instance)
            const resources = instance.info?.resources
            return (
              <div
                key={instance.node_name}
                className='flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between'
              >
                <div className='min-w-0'>
                  <div className='flex items-center gap-2'>
                    <span className='truncate font-mono text-sm'>
                      {nodeName}
                    </span>
                    <StatusBadge
                      label={stale ? t('Stale') : t('Active')}
                      variant={stale ? 'danger' : 'success'}
                      copyable={false}
                    />
                  </div>
                  <div className='text-muted-foreground mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs'>
                    <span>
                      {t('Role')}:{' '}
                      {instance.info?.role?.is_master
                        ? t('Master')
                        : t('Worker')}
                    </span>
                    <span>
                      {t('Version')}: {instance.info?.runtime?.version || '-'}
                    </span>
                    <span>
                      {t('CPU')}: {formatPercent(resources?.cpu?.usage_percent)}
                    </span>
                    <span>
                      {t('Memory')}:{' '}
                      {formatPercent(resources?.memory?.usage_percent)}
                    </span>
                    <span>
                      {t('Last seen')}: {instanceTime(instance)}
                    </span>
                  </div>
                </div>
                {stale && (
                  <Button
                    variant='ghost'
                    size='sm'
                    disabled={deleteOneMutation.isPending}
                    onClick={() => deleteOneMutation.mutate(instance.node_name)}
                  >
                    {t('Delete')}
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </SettingsSection>
  )
}
