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
import { useQuery } from '@tanstack/react-query'
import { AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { sanitizeHtml } from '@/lib/sanitize'
import { cn } from '@/lib/utils'
import { Markdown } from '@/components/ui/markdown'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/youbox/empty-state'
import { AboutMarketingFallback } from './components/about-marketing-fallback'
import { getAboutContent } from './api'
import { resolveAboutContentMode } from './lib/about-content'

function AboutLoadingSkeleton() {
  return (
    <div className='mx-auto flex w-full max-w-[1000px] flex-col gap-4 px-7 py-12'>
      <Skeleton className='h-8 w-[45%]' />
      <Skeleton className='h-4 w-full' />
      <Skeleton className='h-4 w-[90%]' />
      <Skeleton className='h-4 w-[80%]' />
    </div>
  )
}

function AboutErrorState(props: { onRetry: () => void }) {
  const { t } = useTranslation()

  return (
    <div className='mx-auto flex w-full max-w-2xl flex-col items-center justify-center px-7 py-16'>
      <EmptyState
        icon={AlertCircle}
        title={t('Failed to load about content')}
        description={t(
          'Something went wrong while loading this page. Please try again.'
        )}
        className='min-h-0 py-8'
        action={
          <Button variant='secondary' onClick={() => props.onRetry()}>
            {t('Try again')}
          </Button>
        }
      />
    </div>
  )
}

function AboutContentPanel(props: {
  mode: 'html' | 'markdown'
  rawContent: string
}) {
  return (
    <div
      className={cn(
        'bg-card border-border mx-auto w-full max-w-[1000px] rounded-lg border',
        'px-6 py-8 md:px-10 md:py-10'
      )}
    >
      {props.mode === 'html' ? (
        <div
          className='prose prose-neutral dark:prose-invert font-sans max-w-none'
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(props.rawContent) }}
        />
      ) : (
        <Markdown className='prose-neutral dark:prose-invert font-sans max-w-none'>
          {props.rawContent}
        </Markdown>
      )}
    </div>
  )
}

export function About() {
  const { t } = useTranslation()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['about-content'],
    queryFn: getAboutContent,
  })

  const rawContent = data?.data?.trim() ?? ''
  const mode = resolveAboutContentMode(rawContent)

  if (isLoading) {
    return (
      <>
        <AboutLoadingSkeleton />
      </>
    )
  }

  if (isError) {
    return (
      <>
        <AboutErrorState onRetry={() => void refetch()} />
      </>
    )
  }

  if (mode === 'empty') {
    return (
      <>
        <AboutMarketingFallback />
      </>
    )
  }

  if (mode === 'url') {
    return (
      <>
        <iframe
          src={rawContent}
          className='min-h-[calc(100svh-var(--app-header-height,3rem))] w-full border-0'
          title={t('About')}
        />
      </>
    )
  }

  return (
    <>
      <div className='px-7 py-10 md:py-12'>
        <AboutContentPanel mode={mode} rawContent={rawContent} />
      </div>
    </>
  )
}
