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
import { useScrollSpy } from '@/hooks/use-scroll-spy'
import { useQuery } from '@tanstack/react-query'
import { FileWarning } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { sanitizeHtml } from '@/lib/sanitize'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Markdown } from '@/components/ui/markdown'
import { Skeleton } from '@/components/ui/skeleton'
import {
  extractMarkdownToc,
  isLikelyLegalHtml,
  isValidLegalUrl,
} from './lib/legal-content'
import type { LegalDocumentResponse } from './types'

type LegalDocumentBodyProps = {
  queryKey: string
  fetchDocument: () => Promise<LegalDocumentResponse>
  emptyMessage: string
}

export function LegalDocumentBody(props: LegalDocumentBodyProps) {
  const { t } = useTranslation()
  const { data, isLoading } = useQuery({
    queryKey: [props.queryKey],
    queryFn: props.fetchDocument,
    staleTime: 10 * 60 * 1000,
  })

  const rawContent = data?.data?.trim() ?? ''
  const hasContent = rawContent.length > 0
  const isUrl = hasContent && isValidLegalUrl(rawContent)
  const isHtml = hasContent && !isUrl && isLikelyLegalHtml(rawContent)
  const success = data?.success ?? false

  const tocEntries = useMemo(
    () =>
      hasContent && !isUrl && !isHtml ? extractMarkdownToc(rawContent) : [],
    [hasContent, isUrl, isHtml, rawContent]
  )
  const showToc = tocEntries.length > 0
  const activeTocId = useScrollSpy({
    sectionIds: tocEntries.map((entry) => entry.id),
    defaultId: tocEntries[0]?.id,
  })

  if (isLoading) {
    return (
      <div className='flex flex-col gap-4'>
        <Skeleton className='bg-card border-border h-64 w-full rounded-lg border' />
      </div>
    )
  }

  if (!success || !hasContent) {
    return (
      <Card className='border-border border-dashed'>
        <CardHeader className='flex flex-row items-start gap-4'>
          <div className='bg-brand-subtle text-brand flex size-10 shrink-0 items-center justify-center rounded-lg'>
            <FileWarning className='size-5' aria-hidden='true' />
          </div>
          <div className='space-y-1.5'>
            <CardTitle className='font-display text-lg font-semibold tracking-[-0.02em]'>
              {t('Document unavailable')}
            </CardTitle>
            <p className='text-muted-foreground text-sm leading-relaxed'>
              {data?.message || props.emptyMessage}
            </p>
          </div>
        </CardHeader>
      </Card>
    )
  }

  if (isUrl) {
    return (
      <Card className='border-border'>
        <CardHeader>
          <CardTitle className='font-display text-lg font-semibold'>
            {t('External document')}
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <p className='text-muted-foreground text-sm leading-relaxed'>
            {t(
              'The administrator configured an external link for this document.'
            )}
          </p>
          <Button
            render={
              <a href={rawContent} target='_blank' rel='noopener noreferrer' />
            }
          >
            {t('View document')}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div
      className={cn(
        showToc &&
          'lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start lg:gap-12'
      )}
    >
      {showToc && (
        <nav
          aria-label={t('On this page')}
          className='hidden lg:sticky lg:top-24 lg:block'
        >
          <p className='text-muted-foreground mb-2 font-mono text-[10px] tracking-[0.08em] uppercase'>
            {t('On this page')}
          </p>
          <ul className='border-border space-y-1 border-l pl-3'>
            {tocEntries.map((entry, index) => (
              <li key={`${entry.id}-${index}`}>
                <a
                  href={`#${entry.id}`}
                  className={cn(
                    'hover:text-text-strong block truncate border-l-2 border-transparent py-1.5 pl-3 text-[13px] leading-snug transition-colors',
                    entry.level === 3 && 'pl-5',
                    activeTocId === entry.id
                      ? 'text-text-strong border-brand font-medium'
                      : 'text-muted-foreground'
                  )}
                >
                  {entry.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <div
        className={cn(
          'bg-card border-border rounded-lg border',
          'px-6 py-8 md:px-10 md:py-10'
        )}
      >
        {isHtml ? (
          <div
            className='prose prose-neutral dark:prose-invert font-sans max-w-none'
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(rawContent) }}
          />
        ) : (
          <Markdown
            withHeadingIds
            className='prose-neutral dark:prose-invert font-sans max-w-none'
          >
            {rawContent}
          </Markdown>
        )}
      </div>
    </div>
  )
}