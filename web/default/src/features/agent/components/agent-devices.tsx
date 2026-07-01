import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { SectionPageLayout } from '@/components/layout'
import { PageHeader } from '@/components/youbox'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { listAgentDevices, revokeAgentDevice } from '../api'

function formatTime(ts: number) {
  if (!ts) return '—'
  return new Date(ts * 1000).toLocaleString()
}

export function AgentDevices() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { data, isLoading, error } = useQuery({
    queryKey: ['agent-devices'],
    queryFn: async () => {
      const res = await listAgentDevices()
      if (!res.success) throw new Error(res.message || t('Failed to load devices'))
      return res.data
    },
  })

  const revokeMutation = useMutation({
    mutationFn: revokeAgentDevice,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['agent-devices'] }),
  })

  return (
    <SectionPageLayout>
      <SectionPageLayout.Content>
        <div className='mx-auto w-full max-w-[960px] space-y-5'>
          <PageHeader
            eyebrow={t('YouBox Agent')}
            title={t('Connected devices')}
            subtitle={t('Manage desktop devices authorized to use your YouBox account.')}
          />
          {isLoading && <p className='text-sm text-muted-foreground'>{t('Loading...')}</p>}
          {error instanceof Error && <p className='text-sm text-destructive'>{error.message}</p>}
          <div className='space-y-3'>
            {(data ?? []).map((device) => (
              <Card key={device.id}>
                <CardContent className='flex items-center justify-between gap-4 py-4'>
                  <div>
                    <p className='font-medium'>{device.device_label}</p>
                    <p className='text-sm text-muted-foreground'>
                      {device.platform || t('Unknown platform')} · {device.device_id}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {t('Last used')}: {formatTime(device.last_used_at)}
                    </p>
                  </div>
                  <Button
                    variant='outline'
                    disabled={!device.active || revokeMutation.isPending}
                    onClick={() => revokeMutation.mutate(device.id)}
                  >
                    {device.active ? t('Revoke') : t('Revoked')}
                  </Button>
                </CardContent>
              </Card>
            ))}
            {!isLoading && (data?.length ?? 0) === 0 && (
              <p className='text-sm text-muted-foreground'>{t('No connected devices yet.')}</p>
            )}
          </div>
        </div>
      </SectionPageLayout.Content>
    </SectionPageLayout>
  )
}