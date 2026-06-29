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

type UseScrollSpyOptions = {
  sectionIds: string[]
  /** IntersectionObserver rootMargin; matches Design Lab convention. */
  rootMargin?: string
  /** Fallback when no section intersects. */
  defaultId?: string
}

/**
 * Tracks which section id is currently in view for sticky nav / TOC highlighting.
 */
export function useScrollSpy(options: UseScrollSpyOptions): string | undefined {
  const {
    sectionIds,
    rootMargin = '-10% 0px -80% 0px',
    defaultId,
  } = options

  const [activeId, setActiveId] = useState<string | undefined>(
    defaultId ?? sectionIds[0]
  )

  useEffect(() => {
    if (sectionIds.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin }
    )

    for (const id of sectionIds) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [sectionIds, rootMargin])

  return activeId
}