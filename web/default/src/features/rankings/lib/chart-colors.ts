import {
  getThemeChartColors,
  type VChartThemeColors,
} from '@/lib/vchart-theme'

/** Stable monochrome fills for stacked series (charts + legend dots). */
export function buildMonochromeSeriesColorMap(
  names: string[],
  vchartColors?: Pick<
    VChartThemeColors,
    'chart1' | 'chart2' | 'chart3' | 'chart4' | 'chart5' | 'mutedForeground'
  >
): Record<string, string> {
  const palette = getThemeChartColors()
  const fallback = [
    vchartColors?.chart1,
    vchartColors?.chart2,
    vchartColors?.chart3,
    vchartColors?.chart4,
    vchartColors?.chart5,
    vchartColors?.mutedForeground,
  ].filter((c): c is string => Boolean(c))

  const source = palette.length > 0 ? palette : fallback
  const colors =
    source.length > 0 ? source : ['var(--chart-1)', 'var(--chart-2)']

  const result: Record<string, string> = {}
  names.forEach((name, index) => {
    result[name] = colors[index % colors.length]
  })
  return result
}
