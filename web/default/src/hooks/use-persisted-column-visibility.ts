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
