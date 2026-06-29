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
import { type ReactNode, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { DOCS_NAV } from '../lib/docs-nav'

type DocsTocEntry = {
  id: string
  text: string
}

type DocsLayoutProps = {
  activeSection?: string
  activeTocId?: string
  toc?: DocsTocEntry[]
  children: ReactNode
}

export function DocsLayout(props: DocsLayoutProps) {
  const { t } = useTranslation()
  const groups = useMemo(() => {
    const map = new Map<string, typeof DOCS_NAV>()
    for (const item of DOCS_NAV) {
      const list = map.get(item.group) ?? []
      list.push(item)
      map.set(item.group, list)
    }
    return [...map.entries()]
  }, [])

  return (
    <div className='mx-auto grid w-full max-w-[1320px] grid-cols-1 gap-8 px-7 lg:grid-cols-[228px_minmax(0,1fr)_200px] lg:gap-10'>
      <aside className='hidden lg:block'>
        <nav
          aria-label={t('Documentation')}
          className='sticky top-20 max-h-[calc(100dvh-5rem)] overflow-auto pb-10'
        >
          {groups.map(([group, items]) => (
            <div key={group} className='mb-4'>
              <p className='text-muted-foreground/60 mb-1.5 px-2.5 font-mono text-[10px] tracking-[0.1em] uppercase'>
                {t(group)}
              </p>
              {items.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={cn(
                    'text-muted-foreground hover:bg-surface-hover hover:text-foreground mb-0.5 block rounded-[7px] px-2.5 py-1.5 text-[13.5px] transition-colors',
                    props.activeSection === item.id &&
                      'bg-surface-2 text-text-strong font-medium'
                  )}
                >
                  {t(item.label)}
                </a>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      <div className='min-w-0'>{props.children}</div>

      {props.toc && props.toc.length > 0 ? (
        <aside className='hidden xl:block'>
          <nav
            aria-label={t('On this page')}
            className='sticky top-20 max-h-[calc(100dvh-5rem)] overflow-auto pb-10'
          >
            <p className='text-muted-foreground/60 mb-2 font-mono text-[10px] tracking-[0.08em] uppercase'>
              {t('On this page')}
            </p>
            <ul className='space-y-1'>
              {props.toc.map((entry) => (
                <li key={entry.id}>
                  <a
                    href={`#${entry.id}`}
                    className={cn(
                      'border-border block border-l-[1.5px] py-1 pl-3 text-[12.5px] transition-colors',
                      (props.activeTocId ?? props.activeSection) === entry.id
                        ? 'text-text-strong border-brand font-medium'
                        : 'text-muted-foreground hover:text-text-strong'
                    )}
                  >
                    {entry.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      ) : (
        <div className='hidden xl:block' aria-hidden='true' />
      )}
    </div>
  )
}