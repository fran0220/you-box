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
import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type SessionStatItem = {
  label: ReactNode
  value: ReactNode
}

type SessionStatsProps = HTMLAttributes<HTMLDListElement> & {
  items: SessionStatItem[]
}

/**
 * SessionStats (R2-A5) — `// this session` k/v rows: muted label left,
 * mono value right (Tokens / Cost / Latency).
 */
export const SessionStats = ({
  items,
  className,
  ...props
}: SessionStatsProps) => (
  <dl
    data-slot='session-stats'
    className={cn('flex flex-col gap-2', className)}
    {...props}
  >
    {items.map((item, index) => (
      <div key={index} className='flex items-baseline justify-between gap-3'>
        <dt className='text-muted-foreground font-mono text-[13px]'>
          {item.label}
        </dt>
        <dd className='text-foreground m-0 font-mono text-[13px] font-medium tabular-nums'>
          {item.value}
        </dd>
      </div>
    ))}
  </dl>
)
