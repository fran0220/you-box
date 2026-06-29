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
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatusBadge } from '@/components/status-badge'
import type { UptimeMonitor } from '@/features/dashboard/types'
import {
  buildUptimeBars,
  monitorStatusLabel,
  monitorStatusVariant,
} from '../lib/status-helpers'

type ServiceStatusRowProps = {
  icon: LucideIcon
  name: string
  subtitle?: string
  monitor: UptimeMonitor
  className?: string
}

export function ServiceStatusRow(props: ServiceStatusRowProps) {
  const Icon = props.icon
  const bars = buildUptimeBars(
    props.monitor.status,
    props.monitor.history
  )
  const uptimePct = ((props.monitor.uptime ?? 0) * 100).toFixed(2)

  return (
    <div
      className={cn(
        'border-border/60 flex flex-col gap-3 border-t px-5 py-4 first:border-t-0 sm:flex-row sm:items-center',
        props.className
      )}
    >
      <div className='bg-surface-3 text-foreground flex size-[34px] shrink-0 items-center justify-center rounded-[9px]'>
        <Icon className='size-[17px]' aria-hidden='true' />
      </div>
      <div className='w-full shrink-0 sm:w-[200px]'>
        <div className='text-sm font-medium'>{props.name}</div>
        {props.subtitle ? (
          <div className='text-muted-foreground font-mono text-[11px]'>
            {props.subtitle}
          </div>
        ) : null}
      </div>
      <div
        className='flex h-[30px] min-w-0 flex-1 items-end gap-0.5'
        aria-hidden='true'
      >
        {bars.map((barClass, index) => (
          <span
            key={index}
            className={cn('min-w-[2px] flex-1 rounded-[2px]', barClass)}
            style={{ height: '100%' }}
          />
        ))}
      </div>
      <div className='text-foreground w-[54px] shrink-0 text-right font-mono text-xs tabular-nums'>
        {uptimePct}%
      </div>
      <StatusBadge variant={monitorStatusVariant(props.monitor.status)}>
        {monitorStatusLabel(props.monitor.status)}
      </StatusBadge>
    </div>
  )
}