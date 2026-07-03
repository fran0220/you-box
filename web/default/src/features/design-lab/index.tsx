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
import { Suspense, useEffect, useState } from 'react'
import { FlaskConical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Eyebrow } from '@/components/patterns'
import { DESIGN_LAB_GROUPS } from './registry'

/**
 * Design Lab — dev-only component gallery (route: /design-lab).
 *
 * Acceptance carrier for every Phase A component: variants, sizes and
 * states are reviewed here, in both themes, before pages may consume
 * them. Never shipped: the route guard and the lazy import are both
 * behind import.meta.env.DEV, so production builds contain none of it.
 */
export default function DesignLab() {
  const [active, setActive] = useState(DESIGN_LAB_GROUPS[0]?.id)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id)
        }
      },
      { rootMargin: '-10% 0px -80% 0px' }
    )
    for (const group of DESIGN_LAB_GROUPS) {
      const el = document.getElementById(group.id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [])

  return (
    <div className='bg-background text-foreground min-h-svh'>
      <header className='bg-background/85 sticky top-0 z-20 border-b backdrop-blur-md'>
        <div className='mx-auto flex h-14 max-w-[1240px] items-center gap-3 px-4 sm:px-8'>
          <span className='bg-brand-subtle text-brand flex size-7 items-center justify-center rounded-md'>
            <FlaskConical className='size-4' />
          </span>
          <span className='font-display text-base font-bold tracking-[-0.02em]'>
            Design Lab
          </span>
          <span className='text-muted-foreground font-mono text-[10px] tracking-[0.08em] uppercase'>
            dev only
          </span>
          <div className='flex-1' />
        </div>
      </header>

      <div className='mx-auto grid max-w-[1240px] gap-8 px-4 py-6 sm:px-8 lg:grid-cols-[200px_1fr]'>
        <nav className='top-20 hidden self-start lg:sticky lg:flex lg:flex-col lg:gap-0.5'>
          {DESIGN_LAB_GROUPS.map((group) => (
            <a
              key={group.id}
              href={`#${group.id}`}
              className={cn(
                'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active === group.id
                  ? 'bg-surface-2 text-foreground'
                  : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground'
              )}
            >
              {group.title}
            </a>
          ))}
        </nav>

        <main className='flex min-w-0 flex-col gap-10 pb-24'>
          {DESIGN_LAB_GROUPS.map((group) => {
            const Demos = group.component
            return (
              <section
                key={group.id}
                id={group.id}
                className='scroll-mt-20'
                aria-label={group.title}
              >
                <Eyebrow className='mb-1'>{group.id}</Eyebrow>
                <h2 className='font-display mb-4 text-xl font-bold tracking-[-0.02em]'>
                  {group.title}
                </h2>
                <Suspense
                  fallback={
                    <div className='bg-surface-2 h-32 rounded-lg motion-safe:animate-pulse' />
                  }
                >
                  <Demos />
                </Suspense>
              </section>
            )
          })}
        </main>
      </div>
    </div>
  )
}
