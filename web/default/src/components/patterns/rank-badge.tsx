import { Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Rank chip: a trophy for the top 3, the numeric rank otherwise. */
export function RankBadge(props: { rank: number }) {
  const rank = props.rank
  const palette =
    rank === 1
      ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
      : rank === 2
        ? 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300'
        : rank === 3
          ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300'
          : 'bg-muted text-muted-foreground'
  return (
    <span
      className={cn(
        'inline-flex size-7 shrink-0 items-center justify-center rounded-md font-mono text-xs font-bold tabular-nums',
        palette
      )}
    >
      {rank <= 3 ? <Trophy className='size-3.5' /> : rank}
    </span>
  )
}
