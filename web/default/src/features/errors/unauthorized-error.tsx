import { useNavigate, useRouter } from '@tanstack/react-router'
import { KeyRound } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { ErrorPageShell } from './error-page-shell'

export function UnauthorisedError() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { history } = useRouter()
  return (
    <ErrorPageShell
      code='401'
      icon={KeyRound}
      title={t('Unauthorized Access')}
      description={
        <>
          {t('Please log in with the appropriate credentials')} <br />
          {t('to access this resource.')}
        </>
      }
      actions={
        <>
          <Button variant='secondary' onClick={() => history.go(-1)}>
            {t('Go Back')}
          </Button>
          <Button onClick={() => navigate({ to: '/' })}>
            {t('Back to Home')}
          </Button>
        </>
      }
    />
  )
}
