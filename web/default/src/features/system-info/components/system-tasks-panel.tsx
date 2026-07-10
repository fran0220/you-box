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
import { useQuery } from '@tanstack/react-query'
import { RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatTimestamp } from '@/lib/format'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StatusBadge } from '@/components/status-badge'
import { EmptyState, SettingsSection } from '@/components/youbox'
import { listSystemTasks } from '@/features/system-settings/api'
import type {
  SystemTask,
  SystemTaskStatus,
} from '@/features/system-settings/types'

const TASK_LIMIT = 20
const ACTIVE_POLL_INTERVAL_MS = 8_000

const STATUS_META: Record<
  SystemTaskStatus,
  { label: string; variant: 'warning' | 'info' | 'success' | 'danger' }
> = {
  pending: { label: 'Pending', variant: 'warning' },
  running: { label: 'Running', variant: 'info' },
  succeeded: { label: 'Succeeded', variant: 'success' },
  failed: { label: 'Failed', variant: 'danger' },
}

const TYPE_LABEL: Record<string, string> = {
  log_cleanup: 'Log cleanup',
  channel_test: 'Batch channel test',
  model_update: 'Batch upstream model update',
  midjourney_poll: 'Drawing task polling',
  async_task_poll: 'Async task polling',
}

function isActive(task: SystemTask): boolean {
  return task.status === 'pending' || task.status === 'running'
}

function taskProgress(task: SystemTask): string {
  const progress = task.state?.progress
  return typeof progress === 'number' && Number.isFinite(progress)
    ? `${Math.max(0, Math.min(100, progress)).toFixed(0)}%`
    : '-'
}

export function SystemTasksPanel() {
  const { t } = useTranslation()
  const query = useQuery({
    queryKey: ['system-info', 'tasks'],
    queryFn: async () => {
      const result = await listSystemTasks(TASK_LIMIT)
      if (!result.success || !Array.isArray(result.data)) {
        throw new Error(result.message || 'Failed to load system tasks')
      }
      return result.data
    },
    refetchInterval: (state) =>
      state.state.data?.some(isActive) ? ACTIVE_POLL_INTERVAL_MS : false,
  })

  const tasks = query.data ?? []

  return (
    <SettingsSection
      title={t('System Tasks')}
      description={t(
        'Review recent maintenance jobs, execution progress, and failures across gateway instances.'
      )}
      footer={
        <Button
          variant='outline'
          disabled={query.isFetching}
          onClick={() => void query.refetch()}
        >
          <RefreshCw className='size-4' />
          {query.isFetching ? t('Refreshing...') : t('Refresh')}
        </Button>
      }
    >
      {query.isLoading ? (
        <div className='text-muted-foreground py-8 text-sm'>
          {t('Loading...')}
        </div>
      ) : query.isError ? (
        <EmptyState
          title={t('Failed to load system tasks')}
          description={
            query.error instanceof Error ? query.error.message : undefined
          }
          actionLabel={t('Retry')}
          onAction={() => void query.refetch()}
        />
      ) : tasks.length === 0 ? (
        <EmptyState
          title={t('No system tasks')}
          description={t(
            'Maintenance jobs will appear here after they are scheduled.'
          )}
        />
      ) : (
        <div className='overflow-x-auto py-1'>
          <Table className='min-w-[860px]'>
            <TableHeader>
              <TableRow>
                <TableHead>{t('Type')}</TableHead>
                <TableHead>{t('Status')}</TableHead>
                <TableHead>{t('Progress')}</TableHead>
                <TableHead>{t('Executor')}</TableHead>
                <TableHead>{t('Updated')}</TableHead>
                <TableHead>{t('Detail')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => {
                const status = STATUS_META[task.status]
                return (
                  <TableRow key={task.task_id}>
                    <TableCell>
                      <div className='font-medium'>
                        {t(TYPE_LABEL[task.type] ?? task.type)}
                      </div>
                      <div className='text-muted-foreground mt-0.5 font-mono text-[11px]'>
                        {task.type}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        label={t(status.label)}
                        variant={status.variant}
                        appearance='soft'
                        copyable={false}
                      />
                    </TableCell>
                    <TableCell className='font-mono text-xs tabular-nums'>
                      {taskProgress(task)}
                    </TableCell>
                    <TableCell className='text-muted-foreground max-w-48 truncate font-mono text-xs'>
                      {task.locked_by || '-'}
                    </TableCell>
                    <TableCell className='text-muted-foreground text-xs whitespace-nowrap'>
                      {formatTimestamp(task.updated_at)}
                    </TableCell>
                    <TableCell
                      className='text-destructive max-w-64 truncate text-xs'
                      title={task.error || undefined}
                    >
                      {task.error || '-'}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </SettingsSection>
  )
}
