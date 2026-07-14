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
import { Inbox, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export type EmptyStateProps = ComponentProps<'div'> & {
  icon?: LucideIcon
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState(props: EmptyStateProps) {
  const {
    icon: IconProp,
    title,
    description,
    action,
    actionLabel,
    onAction,
    className,
    ...rest
  } = props
  const Icon = IconProp ?? Inbox
  const resolvedAction =
    action ??
    (onAction != null && actionLabel != null ? (
      <Button onClick={onAction}>{actionLabel}</Button>
    ) : null)

  return (
    <div
      data-slot='youbox-empty-state'
      className={cn(
        'flex flex-col items-center justify-center px-6 py-12 text-center',
        className
      )}
      {...rest}
    >
      <div className='bg-brand-subtle text-brand border-brand-border flex size-12 items-center justify-center rounded-xl border'>
        <Icon aria-hidden='true' className='size-6 opacity-90' />
      </div>
      <p className='text-foreground mt-4 text-base font-semibold tracking-[-0.01em]'>
        {title}
      </p>
      {description != null && (
        <p className='text-muted-foreground mt-1.5 max-w-sm text-sm leading-relaxed'>
          {description}
        </p>
      )}
      {resolvedAction != null && <div className='mt-6'>{resolvedAction}</div>}
    </div>
  )
}
