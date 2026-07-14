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
import { Monitor, Moon, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme, type Theme } from '@/context/theme-provider'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const OPTIONS: Array<{ value: Theme; icon: typeof Sun; labelKey: string }> = [
  { value: 'light', icon: Sun, labelKey: 'Light' },
  { value: 'dark', icon: Moon, labelKey: 'Dark' },
  { value: 'system', icon: Monitor, labelKey: 'System' },
]

/**
 * Theme toggle (light / dark / system).
 * Shown for products with `ui.darkMode` (YouBox Circuit). Hidden for Paper/origingame.
 */
export function ThemeSwitch(props: { className?: string }) {
  const { t } = useTranslation()
  const { theme, setTheme, resolvedTheme, darkModeEnabled } = useTheme()

  if (!darkModeEnabled) return null

  const TriggerIcon = resolvedTheme === 'dark' ? Moon : Sun

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        render={
          <Button
            variant='ghost'
            size='icon'
            data-slot='theme-switch'
            className={cn('h-9 w-9 shrink-0', props.className)}
            aria-label={t('Theme')}
            title={t('Theme')}
          />
        }
      >
        <TriggerIcon className='size-4' />
        <span className='sr-only'>{t('Theme')}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='min-w-36'>
        {OPTIONS.map((opt) => {
          const Icon = opt.icon
          return (
            <DropdownMenuItem
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              className={cn(theme === opt.value && 'bg-accent')}
            >
              <Icon className='size-4' />
              {t(opt.labelKey)}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
