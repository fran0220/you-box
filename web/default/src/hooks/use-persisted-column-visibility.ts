import { useEffect, useState } from 'react'
import type { OnChangeFn, VisibilityState } from '@tanstack/react-table'

/**
 * Persist TanStack Table column visibility in localStorage.
 *
 * Saved values override `defaults`. New default keys (added in later releases)
 * still apply when the stored object does not mention them.
 */
export function usePersistedColumnVisibility(
  storageKey: string,
  defaults: VisibilityState
): [VisibilityState, OnChangeFn<VisibilityState>] {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    () => {
      if (typeof window === 'undefined') return defaults
      try {
        const raw = window.localStorage.getItem(storageKey)
        if (!raw) return defaults
        const parsed = JSON.parse(raw) as VisibilityState
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          return defaults
        }
        return { ...defaults, ...parsed }
      } catch {
        return defaults
      }
    }
  )

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(columnVisibility))
    } catch {
      // Quota / private mode — ignore
    }
  }, [storageKey, columnVisibility])

  return [columnVisibility, setColumnVisibility]
}
