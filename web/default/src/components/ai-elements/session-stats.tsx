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
