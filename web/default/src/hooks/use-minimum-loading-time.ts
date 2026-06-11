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
