import { useCallback, useSyncExternalStore } from 'react'

// ----------------------------------------------------------------------------
// Favorite models (R2-B14 #1)
// ----------------------------------------------------------------------------
//
// There is no backend favorites endpoint, so favorites are a local-only
// concern: a set of model names persisted to localStorage (recorded
// adaptation in r2-b14). A tiny module-level store + useSyncExternalStore
// keeps every star button and the toolbar filter in sync without context.

const STORAGE_KEY = 'pricing-favorite-models'

function readFromStorage(): ReadonlySet<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return new Set()
    return new Set(
      parsed.filter((item): item is string => typeof item === 'string')
    )
  } catch {
    return new Set()
  }
}

let snapshot: ReadonlySet<string> = readFromStorage()
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

function writeSnapshot(next: ReadonlySet<string>) {
  snapshot = next
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]))
  } catch {
    // Storage may be unavailable (private mode / quota); keep in-memory state.
  }
  emit()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  // Keep multiple tabs in sync: re-read when another tab writes the key.
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) {
      snapshot = readFromStorage()
      emit()
    }
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

function getSnapshot(): ReadonlySet<string> {
  return snapshot
}

export function useFavorites() {
  const favorites = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  const isFavorite = useCallback(
    (modelName: string | undefined | null) =>
      Boolean(modelName) && favorites.has(modelName as string),
    [favorites]
  )

  const toggleFavorite = useCallback((modelName: string | undefined | null) => {
    if (!modelName) return
    const next = new Set(snapshot)
    if (next.has(modelName)) {
      next.delete(modelName)
    } else {
      next.add(modelName)
    }
    writeSnapshot(next)
  }, [])

  return { favorites, isFavorite, toggleFavorite }
}
