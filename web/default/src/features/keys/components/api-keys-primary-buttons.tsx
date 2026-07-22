import { BookOpen, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useStatus } from '@/hooks/use-status'
import { Button } from '@/components/ui/button'
import { useApiKeys } from './api-keys-provider'

export function ApiKeysPrimaryButtons() {
  const { t } = useTranslation()
  const { setOpen } = useApiKeys()
  const { status } = useStatus()
  // Docs button (r2-B2 section 1): the status payload exposes a
  // `docs_link` field (general_setting.docs_link); render the external
  // link only when an address is configured, otherwise omit it.
  const docsLink = (status?.docs_link as string | undefined) || ''
  return (
    <div className='flex gap-2'>
      {docsLink && (
        <Button
          variant='outline'
          size='sm'
          render={
            <a href={docsLink} target='_blank' rel='noopener noreferrer' />
          }
        >
          <BookOpen className='h-4 w-4' />
          {t('Docs')}
        </Button>
      )}
      <Button size='sm' onClick={() => setOpen('create')}>
        <Plus className='h-4 w-4' />
        {t('Create API Key')}
      </Button>
    </div>
  )
}
