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
export function applyFaviconToDom(url: string) {
  if (typeof document === 'undefined' || !url) return
  try {
    const next = new URL(url, window.location.href).href
    const existing =
      document.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]')
    if (existing.length === 1 && existing[0].href === next) return
    const link = document.createElement('link')
    link.rel = 'icon'
    link.href = url
    existing.forEach((l) => l.remove())
    document.head.appendChild(link)
  } catch {
    // Ignore malformed URLs
  }
}

type DocumentBranding = {
  title?: string
  description?: string
  favicon?: string
  themeColor?: string
}

function setMetaContent(
  selector: string,
  attributes: Record<string, string>,
  content: string
) {
  if (!content) return
  let meta = document.querySelector<HTMLMetaElement>(selector)
  if (!meta) {
    meta = document.createElement('meta')
    Object.entries(attributes).forEach(([key, value]) => {
      meta?.setAttribute(key, value)
    })
    document.head.appendChild(meta)
  }
  meta.setAttribute('content', content)
}

export function applyDocumentBrandingToDom(branding: DocumentBranding) {
  if (typeof document === 'undefined') return

  const title = branding.title?.trim()
  if (title) {
    document.title = title
    setMetaContent('meta[name="title"]', { name: 'title' }, title)
    setMetaContent('meta[property="og:title"]', { property: 'og:title' }, title)
    setMetaContent(
      'meta[name="twitter:title"]',
      { name: 'twitter:title' },
      title
    )
  }

  const description = branding.description?.trim()
  if (description) {
    setMetaContent(
      'meta[name="description"]',
      { name: 'description' },
      description
    )
    setMetaContent(
      'meta[property="og:description"]',
      { property: 'og:description' },
      description
    )
    setMetaContent(
      'meta[name="twitter:description"]',
      { name: 'twitter:description' },
      description
    )
  }

  const themeColor = branding.themeColor?.trim()
  if (themeColor) {
    setMetaContent(
      'meta[name="theme-color"]',
      { name: 'theme-color' },
      themeColor
    )
  }

  if (branding.favicon) {
    applyFaviconToDom(branding.favicon)
  }
}

function currentCanvasThemeColor(): string {
  const root = document.documentElement
  const canvas = getComputedStyle(root).getPropertyValue('--background').trim()
  if (canvas) return canvas
  return root.classList.contains('light')
    ? 'rgb(249, 249, 248)'
    : 'rgb(11, 11, 15)'
}

function hexToRgb(color: string) {
  const normalized = color.trim().replace(/^#/, '')
  const value =
    normalized.length === 3
      ? normalized
          .split('')
          .map((part) => `${part}${part}`)
          .join('')
      : normalized

  if (!/^[0-9a-fA-F]{6}$/.test(value)) return null

  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  }
}

function readableTextColor(color: string): string {
  const rgb = hexToRgb(color)
  if (!rgb) return '#ffffff'

  const luminance = (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255
  return luminance > 0.62 ? '#0f0f14' : '#ffffff'
}

export function applyBrandColorToDom(color?: string) {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  const value = color?.trim()
  const customProperties = [
    '--brand',
    '--brand-hover',
    '--brand-active',
    '--brand-subtle',
    '--brand-border',
    '--brand-on',
    '--brand-ring',
    '--primary',
    '--primary-foreground',
    '--text-link',
    '--text-on-brand',
    '--ring',
    '--meta-theme-color',
  ]

  if (!value || !hexToRgb(value)) {
    customProperties.forEach((property) => root.style.removeProperty(property))
    setMetaContent(
      'meta[name="theme-color"]',
      { name: 'theme-color' },
      currentCanvasThemeColor()
    )
    return
  }

  const foreground = readableTextColor(value)
  root.style.setProperty('--brand', value)
  root.style.setProperty(
    '--brand-hover',
    `color-mix(in srgb, ${value} 86%, black)`
  )
  root.style.setProperty(
    '--brand-active',
    `color-mix(in srgb, ${value} 74%, black)`
  )
  root.style.setProperty(
    '--brand-subtle',
    `color-mix(in srgb, ${value} 12%, transparent)`
  )
  root.style.setProperty(
    '--brand-border',
    `color-mix(in srgb, ${value} 28%, transparent)`
  )
  root.style.setProperty('--brand-on', foreground)
  root.style.setProperty(
    '--brand-ring',
    `color-mix(in srgb, ${value} 32%, transparent)`
  )
  root.style.setProperty('--primary', value)
  root.style.setProperty('--primary-foreground', foreground)
  root.style.setProperty('--text-link', value)
  root.style.setProperty('--text-on-brand', foreground)
  root.style.setProperty(
    '--ring',
    `color-mix(in srgb, ${value} 32%, transparent)`
  )
  root.style.setProperty('--meta-theme-color', value)
  setMetaContent('meta[name="theme-color"]', { name: 'theme-color' }, value)
}
