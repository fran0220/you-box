
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
