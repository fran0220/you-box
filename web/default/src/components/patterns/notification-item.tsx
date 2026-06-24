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
import { type ComponentProps, type ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Eyebrow } from './eyebrow'

const notificationTileVariants = cva(
  'flex size-9 shrink-0 items-center justify-center rounded-md [&>svg]:size-4',
  {
    variants: {
      tone: {
        brand: 'bg-brand-subtle text-brand',
        success: 'bg-success-subtle text-success',
        warning: 'bg-warning-subtle text-warning',
        danger: 'bg-danger-subtle text-destructive',
        info: 'bg-info-subtle text-info',
        accent: 'bg-teal-subtle text-teal',
      },
    },
    defaultVariants: { tone: 'brand' },
  }
)

type NotificationItemProps = Omit<ComponentProps<'div'>, 'title'> &
  VariantProps<typeof notificationTileVariants> & {
    icon: ReactNode
    title: ReactNode
    /** Body copy; markdown-rendered nodes welcome. */
    body?: ReactNode
    /** Mono timestamp on the right ("12m", "2d"). */
    time?: ReactNode
    unread?: boolean
  }

/**
 * NotificationItem — semantic icon tile + title/body + mono timestamp
 * + unread dot. Unread rows sit on surface-2.
 */
export function NotificationItem({
  icon,
  title,
  body,
  time,
  unread,
  tone,
  className,
  ...props
}: NotificationItemProps) {
  return (
    <div
      data-slot='notification-item'
      data-unread={unread || undefined}
      className={cn(
        'border-divider flex gap-3.5 border-b px-4 py-4 last:border-b-0 sm:px-5',
        unread && 'bg-surface-2',
        className
      )}
      {...props}
    >
      <span aria-hidden='true' className={notificationTileVariants({ tone })}>
        {icon}
      </span>
      <div className='min-w-0 flex-1'>
        <div className='flex items-center gap-2'>
          <span className='text-foreground truncate text-sm font-semibold'>
            {title}
          </span>
          {unread && (
            <span
              aria-hidden='true'
              className='bg-brand size-[7px] shrink-0 rounded-full'
            />
          )}
        </div>
        {body != null && (
          <div className='text-muted-foreground mt-0.5 text-[13px] leading-normal'>
            {body}
          </div>
        )}
      </div>
      {time != null && (
        <span className='text-muted-foreground shrink-0 font-mono text-xs'>
          {time}
        </span>
      )}
    </div>
  )
}

type NotificationGroupProps = ComponentProps<'div'> & {
  /** Eyebrow date label: today / earlier / Jun 8. */
  label: ReactNode
}

/** Date-grouped section of NotificationItems with an eyebrow divider. */
export function NotificationGroup({
  label,
  className,
  children,
  ...props
}: NotificationGroupProps) {
  return (
    <div data-slot='notification-group' className={className} {...props}>
      <div className='border-divider border-b px-4 py-2.5 sm:px-5'>
        <Eyebrow>{label}</Eyebrow>
      </div>
      {children}
    </div>
  )
}
