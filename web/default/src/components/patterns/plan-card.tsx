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
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

type PlanCardProps = Omit<ComponentProps<'div'>, 'title'> & {
  name: ReactNode
  /** Display-font price; pair with `unit` for "/ mo". */
  price: ReactNode
  unit?: ReactNode
  description?: ReactNode
  /** Marks the user's current plan (brand border + badge). */
  current?: boolean
  /** Action slot for non-current plans (Choose button). */
  action?: ReactNode
}

/**
 * PlanCard — compact plan row: name + description, mono/display price,
 * `current` badge or a Choose action. Used in subscription previews
 * and the wallet plan rail.
 */
export function PlanCard({
  name,
  price,
  unit,
  description,
  current,
  action,
  className,
  ...props
}: PlanCardProps) {
  const { t } = useTranslation()
  return (
    <div
      data-slot='plan-card'
      data-current={current || undefined}
      className={cn(
        'flex items-center gap-3.5 rounded-md border p-3.5',
        current ? 'border-brand-border bg-brand-subtle' : 'border-border',
        className
      )}
      {...props}
    >
      <div className='min-w-0 flex-1'>
        <div className='text-foreground truncate text-sm font-semibold'>{name}</div>
        {description != null && (
          <div className='text-muted-foreground mt-0.5 truncate text-xs'>
            {description}
          </div>
        )}
      </div>
      <div className='font-display text-foreground flex shrink-0 items-baseline gap-1 text-sm font-bold'>
        {price}
        {unit != null && (
          <span className='text-muted-foreground font-mono text-xs font-normal'>
            {unit}
          </span>
        )}
      </div>
      {current ? <Badge>{t('current')}</Badge> : action}
    </div>
  )
}
