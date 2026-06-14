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
import { useEffect } from 'react'
import { Check, Moon, Sun } from 'lucide-react'
import { flushSync } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { useTheme } from '@/context/theme-provider'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function ThemeSwitch() {
  const { t } = useTranslation()
  const { theme, setTheme } = useTheme()

  /* Update theme-color meta tag
   * when theme is updated */
  useEffect(() => {
    const themeColor = theme === 'dark' ? '#020817' : '#fff'
    const metaThemeColor = document.querySelector("meta[name='theme-color']")
    if (metaThemeColor) metaThemeColor.setAttribute('content', themeColor)
  }, [theme])

  // Theme change with a circular reveal via the View Transitions API,
  // emanating from the click point. flushSync forces the theme class onto
  // <html> synchronously inside the transition callback so the captured
  // snapshot reflects the new theme. Falls back to an instant switch when the
  // API is unavailable or the user prefers reduced motion.
  function handleSetTheme(
    next: 'light' | 'dark' | 'system',
    event?: { clientX?: number; clientY?: number }
  ) {
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => { ready: Promise<void> }
    }
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    if (!doc.startViewTransition || prefersReduced) {
      setTheme(next)
      return
    }

    const x = event?.clientX || window.innerWidth / 2
    const y = event?.clientY || window.innerHeight / 2
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    )
    const easing =
      getComputedStyle(document.documentElement)
        .getPropertyValue('--ease-out')
        .trim() || 'ease-out'

    const transition = doc.startViewTransition(() => {
      flushSync(() => setTheme(next))
    })
    transition.ready
      .then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 400,
            easing,
            pseudoElement: '::view-transition-new(root)',
          }
        )
      })
      .catch(() => {})
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        render={<Button variant='ghost' size='icon' className='h-9 w-9' />}
      >
        <Sun className='duration-base size-[1.2rem] scale-100 rotate-0 transition-all ease-out dark:scale-0 dark:-rotate-90' />
        <Moon className='duration-base absolute size-[1.2rem] scale-0 rotate-90 transition-all ease-out dark:scale-100 dark:rotate-0' />
        <span className='sr-only'>{t('Toggle theme')}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={(event) => handleSetTheme('light', event)}>
          {t('Light')}{' '}
          <Check
            size={14}
            className={cn('ms-auto', theme !== 'light' && 'hidden')}
          />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={(event) => handleSetTheme('dark', event)}>
          {t('Dark')}
          <Check
            size={14}
            className={cn('ms-auto', theme !== 'dark' && 'hidden')}
          />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={(event) => handleSetTheme('system', event)}>
          {t('System')}
          <Check
            size={14}
            className={cn('ms-auto', theme !== 'system' && 'hidden')}
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
