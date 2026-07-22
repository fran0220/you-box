import { useEffect } from 'react'
import { useRouterState } from '@tanstack/react-router'

/** Scroll window to top on pathname changes (cross-route navigation). */
export function ScrollRestoration() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])

  return null
}
