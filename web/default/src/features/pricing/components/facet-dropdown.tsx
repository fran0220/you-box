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
import { ChevronDown, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getLobeIcon } from '@/lib/lobe-icon'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import type { FacetOption } from '../lib/filters'

export type FacetDropdownOption = FacetOption & {
  iconKey?: string
  suffix?: string
}

export interface FacetDropdownProps {
  label: string
  options: FacetDropdownOption[]
  selected: string[]
  onToggle: (value: string) => void
  /** Show an in-popover search input (for long option lists). */
  searchable?: boolean
  align?: 'start' | 'end'
  className?: string
}

/**
 * Cloudflare-catalog-style facet control: an outline trigger with a selected
 * count, opening a checkbox list. The popover stays open across toggles so
 * multi-select feels immediate.
 */
export function FacetDropdown(props: FacetDropdownProps) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')

  const q = query.trim().toLowerCase()
  const visible = useMemo(() => {
    if (!q) return props.options
    return props.options.filter((o) => o.label.toLowerCase().includes(q))
  }, [props.options, q])

  const selectedCount = props.selected.length

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          'border-border bg-background hover:bg-muted text-foreground inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors',
          props.className
        )}
      >
        {props.label}
        {selectedCount > 0 && (
          <span className='bg-brand text-brand-foreground rounded-full px-1.5 text-[10px] font-medium tabular-nums'>
            {selectedCount}
          </span>
        )}
        <ChevronDown className='text-muted-foreground size-3.5' />
      </PopoverTrigger>
      <PopoverContent
        align={props.align ?? 'start'}
        className='w-64 p-0'
        sideOffset={6}
      >
        {props.searchable && (
          <div className='border-border/60 relative border-b p-2'>
            <Search className='text-muted-foreground/60 pointer-events-none absolute top-1/2 left-4.5 size-3.5 -translate-y-1/2' />
            <input
              type='text'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('Filter options...')}
              className='border-border/60 bg-background placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-primary/20 h-8 w-full rounded-md border pr-2 pl-8 text-xs outline-none focus:ring-2'
              aria-label={t('Filter options')}
            />
          </div>
        )}
        <div className='max-h-72 space-y-0.5 overflow-y-auto p-1.5'>
          {visible.length === 0 && (
            <p className='text-muted-foreground px-2 py-3 text-center text-xs'>
              {t('No results found')}
            </p>
          )}
          {visible.map((option) => {
            const checked = props.selected.includes(option.value)
            return (
              <label
                key={option.value}
                className='hover:bg-muted/60 flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5'
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => props.onToggle(option.value)}
                />
                {option.iconKey && (
                  <span className='shrink-0' aria-hidden='true'>
                    {getLobeIcon(option.iconKey, 14)}
                  </span>
                )}
                <span
                  className={cn(
                    'min-w-0 flex-1 truncate text-xs',
                    checked
                      ? 'text-foreground font-medium'
                      : 'text-muted-foreground'
                  )}
                  title={option.label}
                >
                  {option.label}
                </span>
                {option.suffix && (
                  <span className='text-muted-foreground/60 shrink-0 font-mono text-[10px]'>
                    {option.suffix}
                  </span>
                )}
                <span className='text-muted-foreground/50 shrink-0 text-[11px] tabular-nums'>
                  {option.count}
                </span>
              </label>
            )
          })}
        </div>
        {selectedCount > 0 && (
          <div className='border-border/60 border-t p-1.5'>
            <button
              type='button'
              onClick={() =>
                props.selected.forEach((value) => props.onToggle(value))
              }
              className='text-brand hover:text-brand-hover hover:bg-muted/60 w-full rounded-md px-2 py-1.5 text-left text-xs font-medium'
            >
              {t('Clear')}
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
