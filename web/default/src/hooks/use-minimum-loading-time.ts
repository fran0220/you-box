import { useState, useEffect, useRef } from 'react'

/**
 * Ensures a loading skeleton is shown for at least `minimumTime` ms
 * to prevent flickering when data loads too quickly.
 */
export function useMinimumLoadingTime(
  loading: boolean,
  minimumTime = 1000
): boolean {
  // While `loading` is true the output is true regardless of `holding`, so the
  // hold flag can be armed asynchronously without a visible gap.
  const [holding, setHolding] = useState(loading)
  const loadingStartRef = useRef(0)

  useEffect(() => {
    if (!loading) return
    loadingStartRef.current = Date.now()
    const arm = setTimeout(() => setHolding(true), 0)
    return () => clearTimeout(arm)
  }, [loading])

  useEffect(() => {
    if (loading || !holding) return
    const elapsed = Date.now() - loadingStartRef.current
    const remaining = Math.max(0, minimumTime - elapsed)
    const release = setTimeout(() => setHolding(false), remaining)
    return () => clearTimeout(release)
  }, [loading, holding, minimumTime])

  return loading || holding
}
