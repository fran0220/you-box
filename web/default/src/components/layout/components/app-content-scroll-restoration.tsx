import { useEffect } from 'react'
import { useRouterState } from '@tanstack/react-router'

function isScrollableElement(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element)
  const overflowY = style.overflowY
  if (overflowY !== 'auto' && overflowY !== 'scroll' && overflowY !== 'overlay') {
    return false
  }
  return element.scrollHeight > element.clientHeight + 1
}

/** Reset inner shell scroll regions on authenticated route changes (VAL-APP-020). */
export function AppContentScrollRestoration() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })

    const inset = document.querySelector('[data-slot="sidebar-inset"]')
    if (!inset) return

    const marked = inset.querySelectorAll<HTMLElement>(
      '[data-app-content-scroll]'
    )
    marked.forEach((el) => {
      el.scrollTop = 0
      el.scrollLeft = 0
    })

    const overflowCandidates = inset.querySelectorAll<HTMLElement>('*')
    overflowCandidates.forEach((el) => {
      if (el.hasAttribute('data-app-content-scroll')) return
      if (!isScrollableElement(el)) return
      el.scrollTop = 0
      el.scrollLeft = 0
    })
  }, [pathname])

  return null
}
