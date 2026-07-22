import { useTranslation } from 'react-i18next'
import { getLobeIcon } from '@/lib/lobe-icon'
import { DeltaBadge, ProgressBar, RankBadge } from '@/components/patterns'
import { formatTokens } from '../lib/format'
import type { ModelRanking } from '../types'
import { ModelLink, VendorLink } from './entity-links'

type ModelLeaderboardProps = {
  rows: ModelRanking[]
  /** Density variant. `compact` is used inside per-category sections; the
   * default fits the larger overall "Top Models" section. */
  variant?: 'default' | 'compact'
  /** Optional cap (rows beyond this are dropped). */
  limit?: number
}

/**
 * Two-column model leaderboard list: "rank · model
 * (with vendor below) · tokens (with growth below)" rendering. Splits
 * `rows` evenly between the two columns so the visual rhythm matches a
 * single ranked list rather than two independent lists.
 *
 * Each row carries a share ProgressBar scaled against the leader's token
 * volume, and growth renders as a DeltaBadge (R2-B14 #8).
 *
 * Both the model name and vendor name are clickable: model jumps to
 * `/pricing/{modelName}` and vendor jumps to `/pricing?vendor={vendor}`.
 */
export function ModelLeaderboard(props: ModelLeaderboardProps) {
  const limited = props.limit ? props.rows.slice(0, props.limit) : props.rows
  const half = Math.ceil(limited.length / 2)
  const left = limited.slice(0, half)
  const right = limited.slice(half)
  const variant = props.variant ?? 'default'
  const maxTokens = limited.reduce(
    (max, row) => Math.max(max, row.total_tokens),
    0
  )

  if (limited.length === 0) {
    return null
  }

  return (
    <div className='grid grid-cols-1 gap-x-8 md:grid-cols-2'>
      <ModelList rows={left} variant={variant} maxTokens={maxTokens} />
      {right.length > 0 && (
        <ModelList rows={right} variant={variant} maxTokens={maxTokens} />
      )}
    </div>
  )
}

function GrowthBadge(props: { value: number; className?: string }) {
  const v = props.value
  const finite = Number.isFinite(v)
  const direction = !finite || v === 0 ? 'flat' : v > 0 ? 'up' : 'down'
  const text = finite
    ? `${Math.abs(v).toFixed(Math.abs(v) >= 100 ? 0 : 1)}%`
    : '0%'
  return (
    <DeltaBadge direction={direction} className={props.className}>
      {text}
    </DeltaBadge>
  )
}

function ModelList(props: {
  rows: ModelRanking[]
  variant: 'default' | 'compact'
  /** Leader's token volume — every row's share bar is scaled against it. */
  maxTokens: number
}) {
  const { t } = useTranslation()
  const compact = props.variant === 'compact'
  return (
    <ul>
      {props.rows.map((row) => (
        <li
          key={row.model_name}
          className={
            compact
              ? 'flex items-center gap-3 py-2'
              : 'flex items-center gap-3 py-2.5'
          }
        >
          <RankBadge rank={row.rank} />
          <span className='shrink-0'>
            {getLobeIcon(row.vendor_icon, compact ? 20 : 22)}
          </span>
          <div className='min-w-0 flex-1'>
            <ModelLink
              modelName={row.model_name}
              className={
                compact
                  ? 'text-foreground block truncate font-mono text-xs font-medium'
                  : 'text-foreground block truncate font-mono text-sm font-medium'
              }
            >
              {row.model_name}
            </ModelLink>
            <p
              className={
                compact
                  ? 'text-muted-foreground/80 truncate text-[11px] italic'
                  : 'text-muted-foreground/80 truncate text-xs italic'
              }
            >
              {t('by')}{' '}
              <VendorLink vendor={row.vendor}>
                {row.vendor.toLowerCase()}
              </VendorLink>
            </p>
            <ProgressBar
              value={row.total_tokens}
              max={props.maxTokens}
              tone='brand'
              label={t('Token share relative to the top model')}
              className={compact ? 'mt-1 h-1 max-w-40' : 'mt-1.5 h-1 max-w-56'}
            />
          </div>
          <div className='shrink-0 text-right'>
            <div
              className={
                compact
                  ? 'text-foreground font-mono text-xs font-semibold tabular-nums'
                  : 'text-foreground font-mono text-sm font-semibold tabular-nums'
              }
            >
              {formatTokens(row.total_tokens)}
              {!compact && (
                <>
                  {' '}
                  <span className='text-muted-foreground/80 font-normal'>
                    {t('tokens')}
                  </span>
                </>
              )}
            </div>
            <GrowthBadge
              value={row.growth_pct}
              className={compact ? 'text-[10px] [&>svg]:size-3' : 'text-[11px]'}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}
