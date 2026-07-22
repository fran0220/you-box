import { useNavigate, useRouter } from '@tanstack/react-router'
import { Compass } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { ErrorPageShell } from './error-page-shell'

export function NotFoundError() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { history } = useRouter()
  return (
    <ErrorPageShell
      code='404'
      icon={Compass}
      title={t('Oops! Page Not Found!')}
      description={
        <>
          {t("It seems like the page you're looking for")} <br />
          {t('does not exist or might have been removed.')}
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
