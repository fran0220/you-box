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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { formatTimestamp } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/status-badge'
import { EmptyState, SettingsSection } from '@/components/youbox'

type SystemInstance = {
  node_name?: string
  status?: string
  stale?: boolean
  start_time?: number
  last_seen?: number
  updated_at?: number
  [key: string]: unknown
}

async function getSystemInstances(): Promise<SystemInstance[]> {
  const res = await api.get<{ data?: SystemInstance[] | { instances?: SystemInstance[] } }>(
    '/api/system-info/instances'
  )
  if (Array.isArray(res.data.data)) return res.data.data
  return res.data.data?.instances || []
}

async function deleteStaleInstances(): Promise<void> {
  await api.delete('/api/system-info/stale-instances')
}

async function deleteInstance(nodeName: string): Promise<void> {
  await api.delete(`/api/system-info/instances/${encodeURIComponent(nodeName)}`)
}

function isStaleInstance(instance: SystemInstance): boolean {
  return instance.stale === true || String(instance.status || '').toLowerCase() === 'stale'
}

function instanceTime(instance: SystemInstance): string {
  const value = instance.last_seen || instance.updated_at || instance.start_time || 0
  return typeof value === 'number' && value > 0 ? formatTimestamp(value) : '-'
}

export function SystemInstancesPanel() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: ['system-instances'],
    queryFn: getSystemInstances,
  })

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['system-instances'] })
  }

  const deleteStaleMutation = useMutation({
    mutationFn: deleteStaleInstances,
    onSuccess: () => {
      toast.success(t('Stale instances deleted'))
      void refresh()
    },
    onError: () => toast.error(t('Operation failed')),
  })
  const deleteOneMutation = useMutation({
    mutationFn: deleteInstance,
    onSuccess: () => {
      toast.success(t('Instance deleted'))
      void refresh()
    },
    onError: () => toast.error(t('Operation failed')),
  })

  const instances = query.data || []
  const staleCount = instances.filter(isStaleInstance).length

  return (
    <SettingsSection
      title={t('System Instances')}
      description={t('Review active gateway nodes and clean up stale instance records.')}
      footer={
        <Button
          variant='outline'
          disabled={staleCount === 0 || deleteStaleMutation.isPending}
          loading={deleteStaleMutation.isPending}
          onClick={() => deleteStaleMutation.mutate()}
        >
          <Trash2 className='mr-2 size-4' />
          {t('Delete stale instances')}
        </Button>
      }
    >
      {query.isLoading ? (
        <div className='text-muted-foreground py-8 text-sm'>{t('Loading...')}</div>
      ) : instances.length === 0 ? (
        <EmptyState
          title={t('No system instances')}
          description={t('No instance heartbeat records were returned by the server.')}
        />
      ) : (
        <div className='divide-border/70 divide-y'>
          {instances.map((instance) => {
            const nodeName = instance.node_name || String(instance.name || '-')
            const stale = isStaleInstance(instance)
            return (
              <div key={nodeName} className='flex items-center justify-between gap-4 py-3'>
                <div className='min-w-0'>
                  <div className='flex items-center gap-2'>
                    <span className='truncate font-mono text-sm'>{nodeName}</span>
                    <StatusBadge
                      label={stale ? t('Stale') : t('Active')}
                      variant={stale ? 'danger' : 'success'}
                      copyable={false}
                    />
                  </div>
                  <p className='text-muted-foreground mt-1 text-xs'>
                    {t('Last seen')}: {instanceTime(instance)}
                  </p>
                </div>
                <Button
                  variant='ghost'
                  size='sm'
                  disabled={!stale || deleteOneMutation.isPending}
                  onClick={() => deleteOneMutation.mutate(nodeName)}
                >
                  {t('Delete')}
                </Button>
              </div>
            )
          })}
        </div>
      )}
    </SettingsSection>
  )
}
