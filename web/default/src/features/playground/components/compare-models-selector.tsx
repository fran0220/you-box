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
import { useMemo, useState } from 'react'
import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { ModelOption } from '../types'

interface CompareModelsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  models: ModelOption[]
  /** The primary model (always active; excluded from this list). */
  primaryModel: string
  /** Currently selected extra models. */
  value: string[]
  onChange: (next: string[]) => void
  /** Maximum total models compared, including the primary. */
  max: number
}

/**
 * CompareModelsDialog — pick additional models to answer side by side with
 * the primary model. Entered from the chat overflow menu; the primary model
 * is implicit and excluded here.
 */
export function CompareModelsDialog(props: CompareModelsDialogProps) {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')

  const selectable = useMemo(
    () => props.models.filter((m) => m.value !== props.primaryModel),
    [props.models, props.primaryModel]
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return selectable
    return selectable.filter(
      (m) =>
        m.value.toLowerCase().includes(q) || m.label.toLowerCase().includes(q)
    )
  }, [selectable, search])

  // Extra models allowed in addition to the primary.
  const maxExtra = Math.max(0, props.max - 1)
  const selectedSet = new Set(props.value)

  const toggle = (modelValue: string) => {
    if (selectedSet.has(modelValue)) {
      props.onChange(props.value.filter((v) => v !== modelValue))
    } else {
      if (props.value.length >= maxExtra) return
      props.onChange([...props.value, modelValue])
    }
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className='gap-0 p-0 sm:max-w-md'>
        <DialogHeader className='border-b px-4 py-3'>
          <DialogTitle>{t('Compare models')}</DialogTitle>
          <DialogDescription>
            {t('Select up to {{count}} more to compare', { count: maxExtra })}
          </DialogDescription>
        </DialogHeader>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={t('Search models...')}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList className='max-h-[320px]'>
            <CommandEmpty>{t('No models found.')}</CommandEmpty>
            <CommandGroup>
              {filtered.map((model) => {
                const checked = selectedSet.has(model.value)
                const atLimit = !checked && props.value.length >= maxExtra
                return (
                  <CommandItem
                    key={model.value}
                    value={model.value}
                    onSelect={() => toggle(model.value)}
                    disabled={atLimit}
                    className={cn(
                      'gap-2 rounded-lg px-2.5 py-2',
                      atLimit && 'opacity-50'
                    )}
                  >
                    <Check
                      className={cn(
                        'size-4 shrink-0',
                        checked ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <span className='min-w-0 flex-1 truncate'>
                      {model.label}
                    </span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
        <div className='flex items-center justify-between gap-2 border-t p-2'>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            disabled={props.value.length === 0}
            onClick={() => props.onChange([])}
          >
            {t('Clear comparison')}
          </Button>
          <Button
            type='button'
            size='sm'
            onClick={() => props.onOpenChange(false)}
          >
            {t('Done')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
