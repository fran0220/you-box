import { useNavigate, useRouter } from '@tanstack/react-router'
import { ShieldOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { ErrorPageShell } from './error-page-shell'

export function ForbiddenError() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { history } = useRouter()
  return (
    <ErrorPageShell
      code='403'
      icon={ShieldOff}
      title={t('Access Forbidden')}
      description={
        <>
          {t("You don't have necessary permission")} <br />
          {t('to view this resource.')}
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
