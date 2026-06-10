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
