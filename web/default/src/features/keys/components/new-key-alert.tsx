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
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { InlineAlert, SecretReveal } from '@/components/patterns'
import { useApiKeys } from './api-keys-provider'

/**
 * One-time reveal banner for a freshly created key (r2-B2 section 3).
 * Rendered above the table while `lastCreatedKey` is set; dismissed via
 * the close action or implicitly by a page reload (state is in-memory).
 */
export function NewKeyAlert() {
  const { t } = useTranslation()
  const { lastCreatedKey, setLastCreatedKey } = useApiKeys()

  if (!lastCreatedKey) return null

  return (
    <InlineAlert
      tone='brand'
      title={t('New key created — copy it now')}
      actions={
        <Button
          variant='ghost'
          size='icon-sm'
          aria-label={t('Dismiss')}
          onClick={() => setLastCreatedKey(null)}
        >
          <X className='size-4' />
        </Button>
      }
    >
      <p>
        {t(
          'The full key for {{name}} is shown only this once. Copy it now and store it securely.',
          { name: lastCreatedKey.name }
        )}
      </p>
      <SecretReveal
        value={lastCreatedKey.key}
        defaultRevealed
        className='mt-2 max-w-xl'
      />
    </InlineAlert>
  )
}
