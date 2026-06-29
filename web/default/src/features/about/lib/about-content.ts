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

export function isValidAboutUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function isLikelyAboutHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value)
}

export type AboutContentMode = 'empty' | 'url' | 'html' | 'markdown'

export function resolveAboutContentMode(raw: string): AboutContentMode {
  const trimmed = raw.trim()
  if (trimmed.length === 0) {
    return 'empty'
  }
  if (isValidAboutUrl(trimmed)) {
    return 'url'
  }
  if (isLikelyAboutHtml(trimmed)) {
    return 'html'
  }
  return 'markdown'
}
