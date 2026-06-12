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
 * Lazy renderer for @lobehub/icons.
 *
 * The icon set is several megabytes of SVG components, so the module is
 * imported on demand and cached; a sized placeholder is rendered until the
 * chunk arrives. Use via getLobeIcon() from '@/lib/lobe-icon'.
 */
import { useEffect, useState } from 'react'

type LobeIconsModule = typeof import('@lobehub/icons')

let cachedIcons: LobeIconsModule | null = null
let iconsPromise: Promise<LobeIconsModule> | null = null

function loadIcons(): Promise<LobeIconsModule> {
  if (!iconsPromise) {
    iconsPromise = import('@lobehub/icons').then((mod) => {
      cachedIcons = mod
      return mod
    })
  }
  return iconsPromise
}

/**
 * Parse a property value from string to appropriate type
 * @param raw - Raw string value
 * @returns Parsed value (boolean, number, or string)
 */
function parseValue(raw: string | undefined | null): string | number | boolean {
  if (raw == null) return true

  let v = String(raw).trim()

  // Remove curly braces
  if (v.startsWith('{') && v.endsWith('}')) {
    v = v.slice(1, -1).trim()
  }

  // Remove quotes
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    return v.slice(1, -1)
  }

  // Boolean
  if (v === 'true') return true
  if (v === 'false') return false

  // Number
  if (/^-?\d+(?:\.\d+)?$/.test(v)) return Number(v)

  // Return as string
  return v
}

function renderLobeIcon(
  LobeIcons: LobeIconsModule,
  trimmedName: string,
  size: number
): React.ReactNode {
  // Parse component path and chained properties
  const segments = trimmedName.split('.')
  const baseKey = segments[0]
  const BaseIcon = (LobeIcons as Record<string, unknown>)[baseKey] as
    | Record<string, unknown>
    | undefined

  let IconComponent: React.ComponentType<Record<string, unknown>> | undefined
  let propStartIndex: number

  if (BaseIcon && segments.length > 1 && BaseIcon[segments[1]]) {
    IconComponent = BaseIcon[segments[1]] as React.ComponentType<
      Record<string, unknown>
    >
    propStartIndex = 2
  } else {
    IconComponent = (LobeIcons as Record<string, unknown>)[baseKey] as
      | React.ComponentType<Record<string, unknown>>
      | undefined
    propStartIndex = segments.length > 1 && /^[A-Z]/.test(segments[1]) ? 2 : 1
  }

  // Fallback if icon not found
  if (
    !IconComponent ||
    (typeof IconComponent !== 'function' && typeof IconComponent !== 'object')
  ) {
    const firstLetter = trimmedName.charAt(0).toUpperCase()
    return (
      <div
        className='bg-muted text-muted-foreground flex items-center justify-center rounded-full text-xs font-medium'
        style={{ width: size, height: size }}
      >
        {firstLetter}
      </div>
    )
  }

  // Parse chained properties (e.g., "type={'platform'}", "shape='square'")
  const props: Record<string, string | number | boolean> = {}

  for (let i = propStartIndex; i < segments.length; i++) {
    const seg = segments[i]
    if (!seg) continue

    const eqIdx = seg.indexOf('=')
    if (eqIdx === -1) {
      props[seg.trim()] = true
      continue
    }

    const key = seg.slice(0, eqIdx).trim()
    const valRaw = seg.slice(eqIdx + 1).trim()
    props[key] = parseValue(valRaw)
  }

  // Set size if not explicitly specified in the string
  if (props.size == null && size != null) {
    props.size = size
  }

  return <IconComponent {...props} />
}

export function LazyLobeIcon(props: { name: string; size: number }) {
  const [icons, setIcons] = useState<LobeIconsModule | null>(cachedIcons)

  useEffect(() => {
    if (icons) return
    let active = true
    loadIcons().then((mod) => {
      if (active) setIcons(mod)
    })
    return () => {
      active = false
    }
  }, [icons])

  if (!icons) {
    return (
      <span
        className='inline-block shrink-0'
        style={{ width: props.size, height: props.size }}
        aria-hidden='true'
      />
    )
  }

  return renderLobeIcon(icons, props.name, props.size)
}
