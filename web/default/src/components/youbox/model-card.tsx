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
import {
  type ComponentProps,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

export type ModelCardMetric = {
  key: ReactNode
  value: ReactNode
}

export type ModelCardProps = Omit<ComponentProps<'div'>, 'title'> & {
  name: ReactNode
  author?: ReactNode
  description?: ReactNode
  badge?: ReactNode
  avatarSrc?: string
  avatarFallback?: string
  tags?: ReactNode[]
  metrics?: ModelCardMetric[]
  trailing?: ReactNode
  interactive?: boolean
}

/**
 * ModelCard — interactive catalog tile: avatar, display name, mono author, tags, divider footer metrics.
 */
export function ModelCard(props: ModelCardProps) {
  const {
    name,
    author,
    description,
    badge,
    avatarSrc,
    avatarFallback,
    tags,
    metrics,
    trailing,
    interactive = true,
    className,
    children,
    onClick,
    onKeyDown,
    role,
    tabIndex,
    ...rest
  } = props

  const isClickable = onClick != null
  const showInteractiveChrome = interactive || isClickable

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented || !isClickable) {
      return
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onClick(
        event as unknown as Parameters<
          NonNullable<ModelCardProps['onClick']>
        >[0]
      )
    }
  }

  return (
    <div
      data-slot='youbox-model-card'
      role={isClickable ? (role ?? 'button') : role}
      tabIndex={isClickable ? (tabIndex ?? 0) : tabIndex}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'bg-card border-border flex flex-col rounded-lg border p-4 transition-[border-color,box-shadow,transform] duration-base ease-out',
        showInteractiveChrome &&
          'hover:border-brand-border hover:shadow-[var(--glow-brand)] motion-safe:hover:-translate-y-0.5',
        isClickable &&
          'cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]',
        className
      )}
      {...rest}
    >
      <div className='flex items-start justify-between gap-3'>
        <div className='flex min-w-0 items-start gap-3'>
          <Avatar size='lg' className='shrink-0'>
            {avatarSrc != null && <AvatarImage src={avatarSrc} alt='' />}
            <AvatarFallback>{avatarFallback ?? '?'}</AvatarFallback>
          </Avatar>
          <div className='min-w-0'>
            <div className='flex flex-wrap items-center gap-2'>
              <h3 className='font-display text-foreground truncate text-lg leading-tight font-semibold'>
                {name}
              </h3>
              {badge}
            </div>
            {author != null && (
              <p className='text-muted-foreground mt-0.5 font-mono text-[11px]'>
                {author}
              </p>
            )}
          </div>
        </div>
        {trailing}
      </div>
      {description != null && (
        <p className='text-muted-foreground mt-3 line-clamp-2 text-sm leading-relaxed'>
          {description}
        </p>
      )}
      {tags != null && tags.length > 0 && (
        <div className='mt-3 flex flex-wrap gap-1.5'>
          {tags.map((tag, i) => (
            <Badge key={i} variant='secondary' className='font-mono text-[11px]'>
              {tag}
            </Badge>
          ))}
        </div>
      )}
      {children}
      {metrics != null && metrics.length > 0 && (
        <div className='border-divider mt-4 grid gap-3 border-t pt-3 sm:grid-cols-2'>
          {metrics.map((m, i) => (
            <div key={i} className='flex flex-col gap-0.5'>
              <span className='text-muted-foreground font-mono text-[9px] tracking-[0.06em] uppercase'>
                {m.key}
              </span>
              <span className='text-foreground font-mono text-sm font-medium'>
                {m.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
