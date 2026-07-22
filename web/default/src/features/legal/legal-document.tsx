import { useMemo } from 'react'
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

type LegalDocumentProps = {
  title: string
  queryKey: string
  fetchDocument: () => Promise<LegalDocumentResponse>
  emptyMessage: string
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
  const isUrl = hasContent && isValidLegalUrl(rawContent)
  const isHtml = hasContent && !isUrl && isLikelyLegalHtml(rawContent)
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
      <>
        <div className='mx-auto flex w-full max-w-4xl flex-col gap-4 px-7 py-12 md:py-14'>
          <Skeleton className='h-3 w-24' />
          <Skeleton className='h-10 w-[55%]' />
          <Skeleton className='bg-card border-border h-64 w-full rounded-lg border' />
        </div>
      </>
    )
  }

  if (!success || !hasContent) {
    return (
      <>
        <div className='mx-auto w-full max-w-2xl px-7 py-12 md:py-14'>
          <Card className='border-border border-dashed'>
            <CardHeader className='flex flex-row items-start gap-4'>
              <div className='bg-brand-subtle text-brand flex size-10 shrink-0 items-center justify-center rounded-lg'>
                <FileWarning className='size-5' aria-hidden='true' />
              </div>
              <div className='space-y-1.5'>
                <CardTitle className='font-display text-lg font-semibold tracking-[-0.02em]'>
                  {title}
                </CardTitle>
                <p className='text-muted-foreground text-sm leading-relaxed'>
                  {data?.message || emptyMessage}
                </p>
              </div>
            </CardHeader>
          </Card>
        </div>
      </>
    )
  }

  if (isUrl) {
    return (
      <>
        <div className='mx-auto w-full max-w-2xl space-y-6 px-7 py-12 md:py-14'>
          <div className='space-y-2'>
            <p className='yb-eyebrow'>
              {t('Legal')}
            </p>
            <h1 className='font-display text-text-strong text-3xl font-bold tracking-[-0.03em] md:text-4xl'>
              {title}
            </h1>
          </div>
          <Card className='border-border'>
            <CardHeader>
              <CardTitle className='font-display text-lg font-semibold'>
                {title}
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
      </>
    )
  }

  return (
    <>
      <div
        className={cn(
          'mx-auto w-full space-y-8 px-7 py-12 md:py-14',
          showToc ? 'max-w-[1080px]' : 'max-w-4xl'
        )}
      >
        <div className='space-y-3'>
          <p className='yb-eyebrow'>
            {t('Legal')}
          </p>
          <h1 className='font-display text-text-strong text-3xl font-bold tracking-[-0.03em] md:text-4xl'>
            {title}
          </h1>
        </div>

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
                        'text-muted-foreground hover:text-text-strong block truncate py-1.5 text-[13px] leading-snug transition-colors',
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
        {/* "Last updated" mono footer intentionally omitted (R2-B15
            adaptation): LegalDocumentResponse exposes no timestamp. */}
      </div>
    </>
  )
}
