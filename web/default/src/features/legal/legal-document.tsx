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
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FileWarning } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { sanitizeHtml } from '@/lib/sanitize'
import { cn, slugifyHeading } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Markdown } from '@/components/ui/markdown'
import { Skeleton } from '@/components/ui/skeleton'
import { AppShell } from '@/components/layout'
import type { LegalDocumentResponse } from './types'

type LegalDocumentProps = {
  title: string
  queryKey: string
  fetchDocument: () => Promise<LegalDocumentResponse>
  emptyMessage: string
}

function isValidUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function isLikelyHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value)
}

type TocEntry = {
  id: string
  text: string
  level: 2 | 3
}

// Extract h2/h3 headings from raw Markdown for the sticky TOC rail
// (R2-B15). Ids must match the slugs produced by <Markdown withHeadingIds>.
function extractMarkdownToc(markdown: string): TocEntry[] {
  const entries: TocEntry[] = []
  let inFence = false
  for (const line of markdown.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence
      continue
    }
    if (inFence) continue
    const match = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line)
    if (!match) continue
    const text = match[2]
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links -> link text
      .replace(/[*_`~]/g, '') // strip inline emphasis markers
      .trim()
    if (!text) continue
    entries.push({
      id: slugifyHeading(text),
      text,
      level: match[1].length as 2 | 3,
    })
  }
  return entries
}

export function LegalDocument({
  title,
  queryKey,
  fetchDocument,
  emptyMessage,
}: LegalDocumentProps) {
  const { t } = useTranslation()
  const { data, isLoading } = useQuery({
    queryKey: [queryKey],
    queryFn: fetchDocument,
    staleTime: 10 * 60 * 1000,
  })

  const rawContent = data?.data?.trim() ?? ''
  const hasContent = rawContent.length > 0
  const isUrl = hasContent && isValidUrl(rawContent)
  const isHtml = hasContent && !isUrl && isLikelyHtml(rawContent)
  const success = data?.success ?? false

  // TOC rail only for Markdown content; iframe/HTML documents render as-is.
  const tocEntries = useMemo(
    () =>
      hasContent && !isUrl && !isHtml ? extractMarkdownToc(rawContent) : [],
    [hasContent, isUrl, isHtml, rawContent]
  )
  const showToc = tocEntries.length > 0

  if (isLoading) {
    return (
      <AppShell variant='public'>
        <div className='mx-auto flex max-w-4xl flex-col gap-4 py-12'>
          <Skeleton className='h-8 w-[45%]' />
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-[90%]' />
          <Skeleton className='h-4 w-[80%]' />
        </div>
      </AppShell>
    )
  }

  if (!success || !hasContent) {
    return (
      <AppShell variant='public'>
        <div className='mx-auto max-w-2xl py-12'>
          <Card className='border-dashed'>
            <CardHeader className='flex flex-row items-center gap-4'>
              <div className='bg-muted rounded-lg p-2'>
                <FileWarning className='text-muted-foreground h-5 w-5' />
              </div>
              <div className='space-y-1'>
                <CardTitle className='text-lg font-semibold'>{title}</CardTitle>
                <p className='text-muted-foreground text-sm'>
                  {data?.message || emptyMessage}
                </p>
              </div>
            </CardHeader>
          </Card>
        </div>
      </AppShell>
    )
  }

  if (isUrl) {
    return (
      <AppShell variant='public'>
        <div className='mx-auto max-w-2xl py-12'>
          <Card>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p className='text-muted-foreground text-sm'>
                {t(
                  'The administrator configured an external link for this document.'
                )}
              </p>
              <Button
                render={
                  <a
                    href={rawContent}
                    target='_blank'
                    rel='noopener noreferrer'
                  />
                }
              >
                {t('View document')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell variant='public'>
      <div
        className={cn(
          'mx-auto space-y-6 py-12',
          showToc ? 'max-w-5xl' : 'max-w-4xl'
        )}
      >
        <div className='space-y-2'>
          <p className='yb-eyebrow'>
            {'// '}
            {t('Legal')}
          </p>
          <h1 className='font-display text-3xl font-bold tracking-[-0.025em]'>
            {title}
          </h1>
        </div>

        <div
          className={cn(
            showToc &&
              'lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start lg:gap-8'
          )}
        >
          {showToc && (
            <nav
              aria-label={t('On this page')}
              className='hidden lg:sticky lg:top-24 lg:block'
            >
              <p className='text-muted-foreground/70 mb-3 font-mono text-[11px] tracking-wider uppercase'>
                {t('On this page')}
              </p>
              <ul className='border-border space-y-1.5 border-l pl-3'>
                {tocEntries.map((entry, index) => (
                  <li key={`${entry.id}-${index}`}>
                    <a
                      href={`#${entry.id}`}
                      className={cn(
                        'text-muted-foreground hover:text-foreground block truncate text-[13px] leading-snug transition-colors',
                        entry.level === 3 && 'pl-3'
                      )}
                    >
                      {entry.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          <div className='bg-card border-border rounded-lg border p-6 md:p-10'>
            {isHtml ? (
              <div
                className='prose prose-neutral dark:prose-invert max-w-none'
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(rawContent) }}
              />
            ) : (
              <Markdown
                withHeadingIds
                className='prose-neutral dark:prose-invert max-w-none'
              >
                {rawContent}
              </Markdown>
            )}
          </div>
        </div>
        {/* "Last updated" mono footer intentionally omitted (R2-B15
            adaptation): LegalDocumentResponse exposes no timestamp. */}
      </div>
    </AppShell>
  )
}
