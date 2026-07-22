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
