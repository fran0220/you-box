import type { ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Eyebrow, Panel } from '@/components/patterns'

type ChannelAdvancedSectionProps = {
  children: ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Advanced Settings section — collapsible SettingsPanel form (r2-B7 §5).
 * The panel header doubles as the collapse trigger; fields, validation
 * and the persisted open/closed preference are untouched.
 */
export function ChannelAdvancedSection(props: ChannelAdvancedSectionProps) {
  const { t } = useTranslation()

  return (
    <Panel>
      <Collapsible open={props.open} onOpenChange={props.onOpenChange}>
        <CollapsibleTrigger
          render={
            <button
              type='button'
              className='hover:bg-muted/40 flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left transition-colors sm:px-5'
              aria-expanded={props.open}
            />
          }
        >
          <div className='min-w-0'>
            <Eyebrow className='mb-0.5'>{t('advanced')}</Eyebrow>
            <h3 className='font-display truncate text-base font-semibold tracking-[-0.01em]'>
              {t('Advanced Settings')}
            </h3>
            <p className='text-muted-foreground mt-0.5 text-xs'>
              {t(
                'Request overrides, routing behavior, and upstream model automation'
              )}
            </p>
          </div>
          <ChevronDown
            className={cn(
              'text-muted-foreground h-4 w-4 shrink-0 transition-transform',
              props.open && 'rotate-180'
            )}
            aria-hidden='true'
          />
        </CollapsibleTrigger>

        <CollapsibleContent className='border-divider border-t'>
          <div className='flex flex-col gap-5 px-4 py-4 sm:px-5'>
            {props.children}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Panel>
  )
}
