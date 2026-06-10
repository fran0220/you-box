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
import { useId, type ComponentProps } from 'react'
import { cn } from '@/lib/utils'

type SparklineProps = Omit<
  ComponentProps<'svg'>,
  'children' | 'fill' | 'color' | 'height' | 'width'
> & {
  data: number[]
  /** CSS color for stroke/fill; any token works. */
  color?: string
  /** Draw the gradient area under the line (default true). */
  fill?: boolean
  /** Rendered height in px (width is fluid). */
  height?: number
}

/**
 * Sparkline — single-series area microchart for stat cards and table
 * rows. Pure presentational SVG: no axes, no interaction; pair with a
 * visually-hidden text alternative when the trend carries meaning.
 */
export function Sparkline({
  data,
  color = 'var(--brand)',
  fill = true,
  height = 32,
  className,
  ...props
}: SparklineProps) {
  const gradientId = useId()
  const w = 100
  const h = 32
  const max = Math.max(...data, 1) * 1.15
  const n = data.length
  const points =
    n === 1
      ? `0,${h - (data[0] / max) * h} ${w},${h - (data[0] / max) * h}`
      : data
          .map((v, i) => `${(i / (n - 1)) * w},${h - (v / max) * h}`)
          .join(' ')

  if (n === 0) return null

  return (
    <svg
      data-slot='sparkline'
      viewBox={`0 0 ${w} ${h}`}
      width='100%'
      height={height}
      preserveAspectRatio='none'
      aria-hidden='true'
      className={cn('block', className)}
      {...props}
    >
      {fill && (
        <>
          <defs>
            <linearGradient id={gradientId} x1='0' y1='0' x2='0' y2='1'>
              <stop offset='0' stopColor={color} stopOpacity='0.22' />
              <stop offset='1' stopColor={color} stopOpacity='0' />
            </linearGradient>
          </defs>
          <polygon points={`0,${h} ${points} ${w},${h}`} fill={`url(#${gradientId})`} />
        </>
      )}
      <polyline
        points={points}
        fill='none'
        stroke={color}
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
        vectorEffect='non-scaling-stroke'
      />
    </svg>
  )
}
