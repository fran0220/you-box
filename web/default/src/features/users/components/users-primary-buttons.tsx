import { UserPlus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { useUsers } from './users-provider'

export function UsersPrimaryButtons() {
  const { t } = useTranslation()
  const { setOpen, setCurrentRow } = useUsers()

  const handleCreate = () => {
    setCurrentRow(null)
    setOpen('create')
  }

  return (
    <div className='flex gap-2'>
      <Button size='sm' onClick={handleCreate}>
        <UserPlus className='h-4 w-4' />
        <span className='max-sm:hidden'>{t('Add User')}</span>
        <span className='sm:hidden'>{t('Add')}</span>
      </Button>
    </div>
  )
}
