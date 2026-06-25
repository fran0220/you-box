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
import { Activity, Timer, TrendingDown, TrendingUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { formatLatency } from '@/features/performance-metrics/lib/format'
import { formatTokenVolume } from '../lib/mock-stats'
import type { ModelStats } from '../types'

// ----------------------------------------------------------------------------
// Headline usage stats (PLACEHOLDER)
// ----------------------------------------------------------------------------
//
// Surfaces the same OpenRouter-style headline numbers that appear on the
// catalog row (tokens/week, weekly growth %, median latency) at the top of the
// detail page. The values come from the DataLayer-enriched `model.stats`, which
// is deterministic mock data seeded by model name — there is no real metrics
// backend yet, so the strip carries a "placeholder" note.

function StatTile(props: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: React.ReactNode
  intent?: 'default' | 'success' | 'destructive'
}) {
  const Icon = props.icon
  const intent = props.intent ?? 'default'
  return (
    <div className='bg-background flex min-w-0 flex-col gap-1 px-3 py-2.5'>
      <span className='text-muted-foreground inline-flex items-center gap-1.5 text-[10px] font-medium tracking-wider uppercase'>
        <Icon className='size-3 shrink-0' />
        <span className='truncate'>{props.label}</span>
      </span>
      <span
        className={cn(
          'text-foreground font-mono text-base font-semibold tabular-nums',
          intent === 'success' && 'text-success',
          intent === 'destructive' && 'text-destructive'
        )}
      >
        {props.value}
      </span>
    </div>
  )
}

export function ModelDetailsUsageStats(props: { stats: ModelStats }) {
  const { t } = useTranslation()
  const { tokensPerWeek, weeklyGrowthPct, latencyMs } = props.stats
  const growthUp = weeklyGrowthPct >= 0

  return (
    <section>
      <div className='bg-muted/20 grid grid-cols-3 gap-px overflow-hidden rounded-lg border'>
        <StatTile
          icon={Activity}
          label={t('Tokens / week')}
          value={formatTokenVolume(tokensPerWeek)}
        />
        <StatTile
          icon={growthUp ? TrendingUp : TrendingDown}
          label={t('Weekly growth')}
          value={`${growthUp ? '+' : ''}${weeklyGrowthPct}%`}
          intent={growthUp ? 'success' : 'destructive'}
        />
        <StatTile
          icon={Timer}
          label={t('Latency')}
          value={formatLatency(latencyMs)}
        />
      </div>
      <p className='text-muted-foreground/40 mt-1.5 text-[10px]'>
        {t('Usage stats are placeholder estimates.')}
      </p>
    </section>
  )
}
