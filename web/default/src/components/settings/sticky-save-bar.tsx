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
import { type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type StickySaveBarProps = {
  /** Bar slides in only while there are unsaved changes. */
  dirty: boolean
  saving?: boolean
  onDiscard: () => void
  onSave: () => void
  /** Extra info next to the message (e.g. changed-field count). */
  children?: ReactNode
  className?: string
}

/**
 * StickySaveBar — Discard / Save bar pinned to the bottom of settings
 * pages; appears when the form turns dirty and replaces per-section
 * save buttons. Entry animation respects reduced motion.
 */
export function StickySaveBar({
  dirty,
  saving,
  onDiscard,
  onSave,
  children,
  className,
}: StickySaveBarProps) {
  const { t } = useTranslation()
  if (!dirty) return null
  return (
    <div
      data-slot='sticky-save-bar'
      role='status'
      className={cn(
        'sticky bottom-0 z-20 -mx-3 mt-4 sm:-mx-4',
        'motion-safe:animate-in motion-safe:slide-in-from-bottom-2 motion-safe:fade-in motion-safe:duration-200',
        className
      )}
    >
      <div className='border-border bg-card/95 supports-[backdrop-filter]:bg-card/80 border-t px-3 py-2.5 backdrop-blur-md sm:px-4'>
        <div className='flex items-center justify-between gap-3'>
          <p className='text-muted-foreground min-w-0 truncate text-sm'>
            {t('You have unsaved changes')}
            {children}
          </p>
          <div className='flex shrink-0 items-center gap-2'>
            <Button
              variant='ghost'
              size='sm'
              onClick={onDiscard}
              disabled={saving}
            >
              {t('Discard')}
            </Button>
            <Button size='sm' onClick={onSave} disabled={saving}>
              {saving && (
                <Loader2 className='animate-spin' data-icon='inline-start' />
              )}
              {t('Save Changes')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
