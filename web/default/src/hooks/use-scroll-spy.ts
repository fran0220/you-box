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