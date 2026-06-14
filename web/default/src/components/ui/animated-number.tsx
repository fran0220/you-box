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
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface AnimatedNumberProps {
  /** Target numeric value. Animates from the previously shown value to this. */
  value: number
  /**
   * Formats the (interpolated) number for display each frame. Pass a stable
   * formatter (e.g. `formatQuota`) or an inline one — it's read via a ref, so
   * inline functions won't re-trigger the animation.
   */
  format?: (n: number) => string
  /** Count-up duration in ms. */
  duration?: number
  className?: string
  /**
   * Defer the first count-up until the element scrolls into view (for
   * marketing/landing). Defaults to animating on mount / value change.
   */
  startOnView?: boolean
}

const defaultFormat = (n: number) => Math.round(n).toLocaleString()

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/**
 * AnimatedNumber — count-up display for KPIs and stats.
 *
 * Animates from the last shown value to `value` with a cubic ease-out, writing
 * to `textContent` directly (no per-frame React renders). Honors
 * `prefers-reduced-motion` (jumps straight to the value). The initial text is
 * captured once via `useState` so React never fights the imperative updates on
 * re-render — value changes animate smoothly from the previous value with no
 * flash back to zero.
 */
export function AnimatedNumber({
  value,
  format,
  duration = 1000,
  className,
  startOnView = false,
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const fromRef = useRef(0)
  const startedRef = useRef(false)
  const rafRef = useRef(0)

  // Keep the formatter current without making it an effect dependency.
  const formatRef = useRef(format)
  formatRef.current = format

  // Captured once: avoids a flash to 0 when `value` changes (React keeps the
  // children stable; the effect owns textContent thereafter).
  const [initialText] = useState(() => {
    const fmt = format ?? defaultFormat
    const safe = Number.isFinite(value) ? value : 0
    return prefersReducedMotion() ? fmt(safe) : fmt(0)
  })

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const to = Number.isFinite(value) ? value : 0
    const fmt = formatRef.current ?? defaultFormat
    const reduce = prefersReducedMotion()

    const run = () => {
      cancelAnimationFrame(rafRef.current)
      const from = fromRef.current
      if (reduce || from === to || duration <= 0) {
        el.textContent = fmt(to)
        fromRef.current = to
        return
      }
      const start = performance.now()
      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1)
        const eased = 1 - Math.pow(1 - p, 3)
        el.textContent = fmt(from + (to - from) * eased)
        if (p < 1) {
          rafRef.current = requestAnimationFrame(tick)
        } else {
          fromRef.current = to
        }
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    // Defer the very first run until visible when requested.
    if (startOnView && !startedRef.current && !reduce) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            startedRef.current = true
            run()
            observer.disconnect()
          }
        },
        { threshold: 0.5 }
      )
      observer.observe(el)
      return () => observer.disconnect()
    }

    startedRef.current = true
    run()
    return () => cancelAnimationFrame(rafRef.current)
  }, [value, duration, startOnView])

  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {initialText}
    </span>
  )
}
