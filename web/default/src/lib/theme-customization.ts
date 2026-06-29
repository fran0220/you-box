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
 * Color, radius, and font are fixed on the YouBox monochrome canvas (`theme.css`).
 * Only density and content layout remain user-selectable.
 */

/** Monochrome canvas identity; legacy colorful preset cookies map here. */
export const MONOCHROME_THEME_PRESET = 'default' as const

export type ThemePreset = typeof MONOCHROME_THEME_PRESET

export type ThemeScale = 'default' | 'sm' | 'lg' | 'xl'
export type ContentLayout = 'full' | 'centered'

export type ThemeCustomization = {
  preset: ThemePreset
  scale: ThemeScale
  contentLayout: ContentLayout
}

export const DEFAULT_THEME_CUSTOMIZATION: ThemeCustomization = {
  preset: MONOCHROME_THEME_PRESET,
  scale: 'default',
  contentLayout: 'full',
}

/** Only the monochrome preset is valid; stale colorful cookies are rejected. */
export const THEME_PRESET_VALUES: ReadonlySet<ThemePreset> = new Set([
  MONOCHROME_THEME_PRESET,
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
  scale: 'theme_scale',
  contentLayout: 'theme_content_layout',
} as const
