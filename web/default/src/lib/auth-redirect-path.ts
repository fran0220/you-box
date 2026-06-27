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

const DEFAULT_POST_AUTH_PATH = '/dashboard'

/**
 * Normalize a post-login redirect from search params or location.href into a
 * same-origin pathname (+ search) suitable for TanStack Router `navigate({ to })`.
 */
export function resolveAuthRedirectPath(
  raw: string | undefined | null,
  fallback = DEFAULT_POST_AUTH_PATH
): string {
  if (!raw || typeof raw !== 'string') {
    return fallback
  }

  const trimmed = raw.trim()
  if (!trimmed) {
    return fallback
  }

  try {
    const base =
      typeof window !== 'undefined'
        ? window.location.origin
        : 'http://localhost'
    const url = new URL(trimmed, base)
    if (typeof window !== 'undefined' && url.origin !== window.location.origin) {
      return fallback
    }
    const path = `${url.pathname}${url.search}${url.hash}`
    if (!path.startsWith('/') || path.startsWith('//')) {
      return fallback
    }
    if (path.startsWith('/sign-in') || path.startsWith('/sign-up')) {
      return fallback
    }
    return path
  } catch {
    if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
      return trimmed
    }
    return fallback
  }
}
