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
import { useEffect, useState } from 'react'
import { useTheme } from '@/context/theme-provider'

/** Semantic CSS variables from theme.css mapped for VChart specs. */
const SEMANTIC_COLOR_VARS = {
  success: '--success',
  warning: '--warning',
  destructive: '--destructive',
  brand: '--brand',
  chart1: '--chart-1',
  chart2: '--chart-2',
  chart3: '--chart-3',
  chart4: '--chart-4',
  chart5: '--chart-5',
  card: '--card',
  foreground: '--foreground',
  mutedForeground: '--muted-foreground',
  background: '--background',
  border: '--border',
} as const

export type VChartThemeColors = {
  [K in keyof typeof SEMANTIC_COLOR_VARS]: string
} & {
  /** Stroke for chart hover / selected states. */
  hoverStroke: string
  /** Outline on colored points and marks. */
  pointStroke: string
  /** Axis tick / label text color (muted foreground). */
  axisLabel: string
  /** Grid line / split-line color (border token). */
  gridLine: string
}

export const THEME_CHART_COLOR_VARIABLES = [
  SEMANTIC_COLOR_VARS.chart1,
  SEMANTIC_COLOR_VARS.chart2,
  SEMANTIC_COLOR_VARS.chart3,
  SEMANTIC_COLOR_VARS.chart4,
  SEMANTIC_COLOR_VARS.chart5,
] as const

const EMPTY_VCHART_THEME_COLORS: VChartThemeColors = {
  success: '',
  warning: '',
  destructive: '',
  brand: '',
  chart1: '',
  chart2: '',
  chart3: '',
  chart4: '',
  chart5: '',
  card: '',
  foreground: '',
  mutedForeground: '',
  background: '',
  border: '',
  hoverStroke: '',
  pointStroke: '',
  axisLabel: '',
  gridLine: '',
}

/**
 * Resolve a theme CSS variable to a literal color VChart can consume.
 * Uses a DOM probe so chained vars (e.g. `--success: var(--green-600)`) resolve fully.
 */
export function resolveCssColor(
  cssVariable: `--${string}`,
  element?: Element | null
): string {
  if (typeof document === 'undefined') return ''

  const host = element ?? document.documentElement
  const probe = document.createElement('div')
  probe.style.color = `var(${cssVariable})`
  probe.style.pointerEvents = 'none'
  probe.style.position = 'absolute'
  probe.style.visibility = 'hidden'

  host.appendChild(probe)
  const resolved = getComputedStyle(probe).color.trim()
  probe.remove()

  if (!resolved || resolved === 'rgba(0, 0, 0, 0)') return ''
  return resolved
}

/** Read `--chart-1` … `--chart-5` as resolved palette colors. */
export function getThemeChartColors(themeKey?: string): string[] {
  void themeKey

  if (typeof document === 'undefined') return []

  return THEME_CHART_COLOR_VARIABLES.map((name) =>
    resolveCssColor(name)
  ).filter(Boolean)
}

/** Snapshot of semantic theme tokens for VChart specs at call time. */
export function resolveVChartThemeColors(themeKey?: string): VChartThemeColors {
  void themeKey

  if (typeof document === 'undefined') return EMPTY_VCHART_THEME_COLORS

  const colors = Object.fromEntries(
    Object.entries(SEMANTIC_COLOR_VARS).map(([key, cssVar]) => [
      key,
      resolveCssColor(cssVar),
    ])
  ) as Pick<VChartThemeColors, keyof typeof SEMANTIC_COLOR_VARS>

  return {
    ...colors,
    hoverStroke: colors.foreground,
    pointStroke: colors.card,
    axisLabel: colors.mutedForeground,
    gridLine: colors.border,
  }
}

/** Reactive semantic colors for React chart components (light / dark). */
export function useVChartThemeColors(refreshKey?: string): VChartThemeColors {
  const { resolvedTheme } = useTheme()
  const [colors, setColors] = useState(() => resolveVChartThemeColors())

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setColors(
        resolveVChartThemeColors(
          refreshKey ? `${resolvedTheme}:${refreshKey}` : resolvedTheme
        )
      )
    })
    return () => cancelAnimationFrame(frame)
  }, [resolvedTheme, refreshKey])

  return colors
}
