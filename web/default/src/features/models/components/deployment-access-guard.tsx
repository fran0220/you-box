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
import type { ReactNode } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { CheckCircle2, Circle, Loader2, Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { InlineAlert } from '@/components/patterns'

type LoadingPhase = 'idle' | 'settings' | 'connection' | 'done'
type StepStatus = 'pending' | 'loading' | 'done'

function getSettingsStatus(phase: LoadingPhase): StepStatus {
  if (phase === 'settings') return 'loading'
  if (phase === 'connection' || phase === 'done') return 'done'
  return 'pending'
}

function getConnectionStatus(
  phase: LoadingPhase,
  connectionOk: boolean | null
): StepStatus {
  if (phase === 'connection') return 'loading'
  if (phase === 'done' && connectionOk) return 'done'
  return 'pending'
}

interface DeploymentAccessGuardProps {
  children: ReactNode
  loading: boolean
  loadingPhase?: LoadingPhase
  isEnabled: boolean
  connectionLoading: boolean
  connectionOk: boolean | null
  connectionError: string | null
  onRetry: () => void
}

function LoadingStep({
  label,
  status,
}: {
  label: string
  status: 'pending' | 'loading' | 'done'
}) {
  return (
    <div className='flex items-center gap-3'>
      {status === 'loading' && (
        <Loader2 className='text-primary h-5 w-5 animate-spin' />
      )}
      {status === 'done' && <CheckCircle2 className='h-5 w-5 text-green-500' />}
      {status === 'pending' && (
        <Circle className='text-muted-foreground/40 h-5 w-5' />
      )}
      <span
        className={cn(
          'text-sm',
          status === 'loading' && 'text-foreground font-medium',
          status === 'done' && 'text-muted-foreground',
          status === 'pending' && 'text-muted-foreground/60'
        )}
      >
        {label}
      </span>
    </div>
  )
}

export function DeploymentAccessGuard({
  children,
  loading,
  loadingPhase = 'settings',
  isEnabled,
  connectionLoading,
  connectionOk,
  connectionError,
  onRetry,
}: DeploymentAccessGuardProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const handleGoToSettings = () => {
    navigate({
      to: '/system-settings/models/$section',
      params: { section: 'model-deployment' },
    })
  }

  // Combined loading state with step indicator
  if (loading || connectionLoading) {
    const settingsStatus = getSettingsStatus(loadingPhase)
    const connectionStatus = getConnectionStatus(loadingPhase, connectionOk)

    return (
      <div className='mx-auto mt-8 max-w-md'>
        <div className='flex flex-col items-center justify-center py-12'>
          <Loader2 className='text-primary mb-6 h-10 w-10 animate-spin' />
          <div className='space-y-3'>
            <LoadingStep
              label={t('Loading configuration')}
              status={settingsStatus}
            />
            <LoadingStep
              label={t('Checking connection')}
              status={connectionStatus}
            />
          </div>
        </div>
      </div>
    )
  }

  // Disabled state — InlineAlert warning + Go to settings (r2-B11 §4)
  if (!isEnabled) {
    return (
      <div className='mx-auto mt-8 max-w-2xl'>
        <InlineAlert
          tone='warning'
          title={t('Model deployment service is disabled')}
          actions={
            <Button size='sm' onClick={handleGoToSettings}>
              <Settings className='mr-2 h-4 w-4' />
              {t('Go to settings')}
            </Button>
          }
        >
          {t(
            'Please enable io.net model deployment service and configure an API key in System Settings.'
          )}
        </InlineAlert>
      </div>
    )
  }

  // Connection error state — InlineAlert danger + Retry / Go to settings
  // (r2-B11 §4)
  if (connectionOk === false && connectionError) {
    return (
      <div className='mx-auto mt-8 max-w-2xl'>
        <InlineAlert
          tone='danger'
          title={t('Connection failed')}
          actions={
            <>
              <Button size='sm' variant='outline' onClick={onRetry}>
                {t('Retry')}
              </Button>
              <Button size='sm' onClick={handleGoToSettings}>
                <Settings className='mr-2 h-4 w-4' />
                {t('Go to settings')}
              </Button>
            </>
          }
        >
          {t(connectionError)}
        </InlineAlert>
      </div>
    )
  }

  return <>{children}</>
}
