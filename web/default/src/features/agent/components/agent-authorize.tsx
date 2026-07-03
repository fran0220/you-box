import { useMemo, useState } from 'react'
import { useSearch } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { SectionPageLayout } from '@/components/layout'
import { PageHeader } from '@/components/youbox'
import { authorizeAgentDevice } from '../api'

const CLIENT_ID = 'youbox-agent'

export function AgentAuthorize() {
  const { t } = useTranslation()
  const search = useSearch({ from: '/_authenticated/agent/authorize' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deviceLabel = search.device_label?.trim() || t('Unknown device')
  const deviceId = search.device_id?.trim() || ''
  const state = search.state?.trim() || ''
  const clientId = search.client_id?.trim() || CLIENT_ID
  const codeChallenge = search.code_challenge?.trim() || ''
  const codeChallengeMethod = search.code_challenge_method?.trim() || 'S256'

  const canAuthorize = useMemo(() => {
    if (clientId !== CLIENT_ID) return false
    if (state.length < 8) return false
    if (deviceId.length < 8) return false
    if (codeChallenge.length < 43) return false
    return codeChallengeMethod === 'S256'
  }, [clientId, state, deviceId, codeChallenge, codeChallengeMethod])

  async function handleAuthorize() {
    if (!canAuthorize) return
    setLoading(true)
    setError(null)
    try {
      const res = await authorizeAgentDevice({
        client_id: clientId,
        device_id: deviceId,
        device_label: deviceLabel,
        state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
      })
      if (!res.success || !res.data?.redirect_uri) {
        setError(res.message || t('Authorization failed'))
        return
      }
      window.location.assign(res.data.redirect_uri)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Authorization failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <SectionPageLayout>
      <SectionPageLayout.Content>
        <div className='mx-auto w-full max-w-[640px] space-y-5'>
          <PageHeader
            eyebrow={t('YouBox Agent')}
            title={t('Authorize desktop app')}
            subtitle={t(
              'Allow YouBox Agent to access your account on this device.'
            )}
          />
          <Card>
            <CardHeader>
              <CardTitle>{t('Device authorization')}</CardTitle>
              <CardDescription>
                {t('You are signing in to YouBox Agent on {{device}}.', {
                  device: deviceLabel,
                })}
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              {!canAuthorize && (
                <p className='text-muted-foreground text-sm'>
                  {t(
                    'This authorization link is invalid or expired. Return to the desktop app and try again.'
                  )}
                </p>
              )}
              {error && <p className='text-destructive text-sm'>{error}</p>}
              <div className='flex gap-3'>
                <Button
                  disabled={!canAuthorize || loading}
                  onClick={() => void handleAuthorize()}
                >
                  {loading ? t('Authorizing...') : t('Authorize')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </SectionPageLayout.Content>
    </SectionPageLayout>
  )
}
