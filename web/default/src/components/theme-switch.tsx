import { Monitor, Moon, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { useTheme, type Theme } from '@/context/theme-provider'
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
 * Shown when the active product enables `ui.darkMode`.
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
