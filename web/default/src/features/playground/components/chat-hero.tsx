import { useMemo } from 'react'
import {
  BarChartIcon,
  BoxIcon,
  CodeSquareIcon,
  GraduationCapIcon,
  NotepadTextIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'
import { Suggestion, Suggestions } from '@/components/ai-elements/suggestion'

type DayPeriod = 'morning' | 'afternoon' | 'evening'

function getDayPeriod(date: Date): DayPeriod {
  const hour = date.getHours()
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'afternoon'
  return 'evening'
}

/**
 * ChatHero — the Claude-style new-chat greeting: a serif display line
 * (time-of-day salutation + user name) shown above the centered composer.
 */
export function ChatHero(props: { className?: string }) {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.auth.user)
  const name = user?.display_name || user?.username || ''
  const period = getDayPeriod(new Date())

  let greeting: string
  if (period === 'morning') {
    greeting = name ? t('Good morning, {{name}}', { name }) : t('Good morning')
  } else if (period === 'afternoon') {
    greeting = name
      ? t('Good afternoon, {{name}}', { name })
      : t('Good afternoon')
  } else {
    greeting = name ? t('Good evening, {{name}}', { name }) : t('Good evening')
  }

  return (
    <div
      className={cn(
        'mx-auto flex w-full max-w-3xl items-end gap-3 px-4 pb-5 sm:px-6',
        props.className
      )}
    >
      <span aria-hidden='true' className='text-brand pb-1 text-xl'>
        ✦
      </span>
      <h1 className='font-display text-foreground min-w-0 truncate text-2xl font-normal sm:text-3xl'>
        {greeting}
      </h1>
    </div>
  )
}

/**
 * ChatSuggestions — starter prompt chips rendered below the composer on the
 * empty state only (they disappear once a conversation starts).
 */
export function ChatSuggestions(props: {
  onPick: (text: string) => void
  disabled?: boolean
  className?: string
}) {
  const { t } = useTranslation()

  const items = useMemo(
    () => [
      { icon: BarChartIcon, textKey: 'Analyze data' as const },
      { icon: CodeSquareIcon, textKey: 'Code' as const },
      { icon: NotepadTextIcon, textKey: 'Summarize text' as const },
      { icon: GraduationCapIcon, textKey: 'Get advice' as const },
      { icon: BoxIcon, textKey: 'Surprise me' as const },
    ],
    []
  )

  return (
    <div
      className={cn(
        'mx-auto flex w-full max-w-3xl justify-center px-4 sm:px-6',
        props.className
      )}
    >
      <Suggestions className='justify-center'>
        {items.map(({ icon: Icon, textKey }) => {
          const label = t(textKey)
          return (
            <Suggestion
              key={textKey}
              suggestion={label}
              disabled={props.disabled}
              onClick={() => props.onPick(label)}
              className='text-muted-foreground text-xs font-normal sm:text-sm'
            >
              <Icon size={15} aria-hidden='true' />
              {label}
            </Suggestion>
          )
        })}
      </Suggestions>
    </div>
  )
}
