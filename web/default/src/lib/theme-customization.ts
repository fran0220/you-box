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
/**
 * Theme customization constants and types.
 *
 * Lives in `lib/` (not `context/`) so it can be imported alongside the
 * provider without breaking React Fast Refresh boundaries.
 *
 * Color/radius preset axes are frozen under the monochrome YouBox canvas;
 * only layout/density/font preferences remain user-selectable.
 */

/** Monochrome canvas identity; legacy colorful preset cookies map here. */
export const MONOCHROME_THEME_PRESET = 'default' as const

export type ThemePreset = typeof MONOCHROME_THEME_PRESET

export type ThemeRadius = 'default' | 'none' | 'sm' | 'md' | 'lg' | 'xl'
export type ThemeScale = 'default' | 'sm' | 'lg' | 'xl'
export type ContentLayout = 'full' | 'centered'

/**
 * Font axis for the theme.
 *
 * - `default` — resolves to sans on the monochrome canvas.
 * - `sans` — humanist sans (Public Sans).
 * - `serif` — editorial serif (Lora + CJK fallbacks).
 */
export type ThemeFont = 'default' | 'sans' | 'serif'

export type ResolvedThemeFont = Exclude<ThemeFont, 'default'>

export type ThemeCustomization = {
  preset: ThemePreset
  font: ThemeFont
  radius: ThemeRadius
  scale: ThemeScale
  contentLayout: ContentLayout
}

export const DEFAULT_THEME_CUSTOMIZATION: ThemeCustomization = {
  preset: MONOCHROME_THEME_PRESET,
  font: 'default',
  radius: 'default',
  scale: 'default',
  contentLayout: 'full',
}

/** Only the monochrome preset is valid; stale colorful cookies are rejected. */
export const THEME_PRESET_VALUES: ReadonlySet<ThemePreset> = new Set([
  MONOCHROME_THEME_PRESET,
])

export const THEME_FONT_VALUES: ReadonlySet<ThemeFont> = new Set([
  'default',
  'sans',
  'serif',
])

export const THEME_RADIUS_VALUES: ReadonlySet<ThemeRadius> = new Set([
  'default',
  'none',
  'sm',
  'md',
  'lg',
  'xl',
])

export const THEME_SCALE_VALUES: ReadonlySet<ThemeScale> = new Set([
  'default',
  'sm',
  'lg',
  'xl',
])

export const CONTENT_LAYOUT_VALUES: ReadonlySet<ContentLayout> = new Set([
  'full',
  'centered',
])

export const THEME_COOKIE_KEYS = {
  preset: 'theme_preset',
  font: 'theme_font',
  radius: 'theme_radius',
  scale: 'theme_scale',
  contentLayout: 'theme_content_layout',
} as const

/**
 * Resolve a user font preference into the concrete font that should drive the
 * DOM. On the monochrome canvas, `default` always resolves to sans.
 */
export function resolveThemeFont(
  font: ThemeFont,
  _preset: ThemePreset = MONOCHROME_THEME_PRESET
): ResolvedThemeFont {
  if (font === 'default') {
    return 'sans'
  }
  return font
}
