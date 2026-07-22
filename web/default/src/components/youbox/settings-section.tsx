import { type ComponentProps, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Panel } from '@/components/patterns/panel'

export type SettingsSectionProps = Omit<ComponentProps<'section'>, 'title'> & {
  title: ReactNode
  description?: ReactNode
  footer?: ReactNode
}

export function SettingsSection(props: SettingsSectionProps) {
  const { title, description, footer, className, children, ...rest } = props
  return (
    <Panel
      data-slot='youbox-settings-section'
      className={cn(className)}
      {...rest}
    >
      <div className='border-divider border-b px-4 py-4 sm:px-5'>
        <h2 className='text-foreground font-mono text-[11px] font-medium tracking-[0.06em] uppercase'>
          {title}
        </h2>
        {description != null && (
          <p className='text-muted-foreground mt-1 text-[13px] leading-normal'>
            {description}
          </p>
        )}
      </div>
      <div className='px-4 sm:px-5'>{children}</div>
      {footer != null && (
        <div className='border-divider flex justify-end border-t px-4 py-4 sm:px-5'>
          {footer}
        </div>
      )}
    </Panel>
  )
}
