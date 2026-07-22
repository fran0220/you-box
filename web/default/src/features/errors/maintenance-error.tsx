import { Wrench } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { ErrorPageShell } from './error-page-shell'

export function MaintenanceError() {
  const { t } = useTranslation()
  return (
    <ErrorPageShell
      code='503'
      icon={Wrench}
      title={t('Website is under maintenance!')}
      description={
        <>
          {t('The site is not available at the moment.')} <br />
          {t("We'll be back online shortly.")}
        </>
      }
      actions={
        <Button variant='secondary' onClick={() => window.location.reload()}>
          {t('Try again')}
        </Button>
      }
    />
  )
}
