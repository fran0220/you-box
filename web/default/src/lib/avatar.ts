import type { CSSProperties } from 'react'

export type UserAvatarStyle = Pick<CSSProperties, 'backgroundColor' | 'color'>

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  }
  return hash
}

/** Monochrome initials palette (YouBox DS); no chromatic hues. */
const MONO_AVATAR_PALETTE = [
  '#9a9aa4',
  '#74747f',
  '#565663',
  '#c2c2c9',
  '#3b3b47',
  '#8b9097',
  '#807c75',
  '#a7abb1',
] as const

export function getUserAvatarStyle(name: string): UserAvatarStyle {
  const hash = hashString(name)
  const backgroundColor =
    MONO_AVATAR_PALETTE[hash % MONO_AVATAR_PALETTE.length]

  return {
    backgroundColor,
    color: '#ffffff',
  }
}

export function getUserAvatarFallback(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?'
}
