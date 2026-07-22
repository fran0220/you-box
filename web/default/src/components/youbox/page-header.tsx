import { type ComponentProps, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Eyebrow } from './eyebrow'

export type PageHeaderProps = Omit<ComponentProps<'header'>, 'title'> & {
  eyebrow?: ReactNode
  title: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
}

/**
 * PageHeader — optional mono eyebrow, display title, muted subtitle, actions row.
 */
export function PageHeader(props: PageHeaderProps) {
  const { eyebrow, title, subtitle, actions, className, ...rest } = props
  return (
    <header
      data-slot='youbox-page-header'
      className={cn(
        'flex flex-wrap items-start justify-between gap-4',
        className
      )}
      {...rest}
    >
      <div className='min-w-0 flex-1'>
        {eyebrow != null && <Eyebrow className='mb-1.5'>{eyebrow}</Eyebrow>}
        <h1 className='font-display text-foreground text-2xl leading-tight font-semibold tracking-[-0.02em]'>
          {title}
        </h1>
        {subtitle != null && (
          <p className='text-muted-foreground mt-1.5 max-w-2xl text-sm leading-relaxed'>
            {subtitle}
          </p>
        )}
      </div>
      {actions != null && (
        <div
          data-slot='youbox-page-header-actions'
          className='flex shrink-0 flex-wrap items-center gap-2'
        >
          {actions}
        </div>
      )}
    </header>
  )
}
