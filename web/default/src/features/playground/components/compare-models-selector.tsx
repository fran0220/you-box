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
import { Check, Columns3 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import type { ModelOption } from '../types'

interface CompareModelsSelectorProps {
  models: ModelOption[]
  /** The primary model (always active; excluded from this list). */
  primaryModel: string
  /** Currently selected extra models. */
  value: string[]
  onChange: (next: string[]) => void
  /** Maximum total models compared, including the primary. */
  max: number
  disabled?: boolean
}

/**
 * Multi-select used to pick additional models to compare side by side with the
 * primary model. The primary model is implicit and excluded here.
 */
export function CompareModelsSelector({
  models,
  primaryModel,
  value,
  onChange,
  max,
  disabled,
}: CompareModelsSelectorProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const selectable = useMemo(
    () => models.filter((m) => m.value !== primaryModel),
    [models, primaryModel]
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
  const maxExtra = Math.max(0, max - 1)
  const selectedSet = new Set(value)

  const toggle = (modelValue: string) => {
    if (selectedSet.has(modelValue)) {
      onChange(value.filter((v) => v !== modelValue))
    } else {
      if (value.length >= maxExtra) return
      onChange([...value, modelValue])
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type='button'
            variant='ghost'
            size='sm'
            disabled={disabled}
            aria-label={t('Compare models')}
            title={t('Compare models')}
            className='gap-1.5'
          />
        }
      >
        <Columns3 className='size-4' />
        <span className='hidden sm:inline'>{t('Compare')}</span>
        {value.length > 0 && (
          <Badge variant='secondary' className='ml-0.5 px-1.5 text-[10px]'>
            {value.length + 1}
          </Badge>
        )}
      </PopoverTrigger>
      <PopoverContent
        align='end'
        className='w-72 overflow-hidden rounded-xl p-0 shadow-lg'
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={t('Search models...')}
            value={search}
            onValueChange={setSearch}
          />
          <div className='text-muted-foreground border-b px-3 py-1.5 text-[11px]'>
            {t('Select up to {{count}} more to compare', { count: maxExtra })}
          </div>
          <CommandList className='max-h-[320px]'>
            <CommandEmpty>{t('No models found.')}</CommandEmpty>
            <CommandGroup>
              {filtered.map((model) => {
                const checked = selectedSet.has(model.value)
                const atLimit = !checked && value.length >= maxExtra
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
                    <span className='min-w-0 flex-1 truncate'>{model.label}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
          {value.length > 0 && (
            <div className='border-t p-1.5'>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                className='w-full'
                onClick={() => onChange([])}
              >
                {t('Clear comparison')}
              </Button>
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  )
}
