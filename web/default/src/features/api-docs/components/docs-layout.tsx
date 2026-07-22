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
          {(() => {
            let chapter = 0
            return groups.map(([group, items]) => (
              <div key={group} className='mb-5'>
                <p className='text-muted-foreground/70 mb-1.5 px-2.5 font-mono text-[10px] font-semibold tracking-[0.14em] uppercase'>
                  {t(group)}
                </p>
                {items.map((item) => {
                  chapter += 1
                  return (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={cn(
                        'text-muted-foreground hover:bg-surface-hover hover:text-foreground mb-0.5 flex items-baseline gap-2 rounded-[7px] px-2.5 py-1.5 text-[13.5px] transition-colors',
                        props.activeSection === item.id &&
                          'bg-surface-2 text-text-strong font-medium'
                      )}
                    >
                      <span
                        aria-hidden='true'
                        className='text-brand/70 w-4 shrink-0 text-right font-mono text-[11px]'
                      >
                        {chapter}.
                      </span>
                      {t(item.label)}
                    </a>
                  )
                })}
              </div>
            ))
          })()}
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