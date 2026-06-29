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
import { Construction } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { sanitizeHtml } from '@/lib/sanitize'
import { cn } from '@/lib/utils'
import { Markdown } from '@/components/ui/markdown'
import { Skeleton } from '@/components/ui/skeleton'
import { AppShell } from '@/components/layout'
import { EmptyState } from '@/components/youbox/empty-state'
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

function EmptyAboutState() {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()

  return (
    <div className='mx-auto flex w-full max-w-2xl flex-col items-center justify-center px-7 py-16'>
      <EmptyState
        icon={Construction}
        title={t('No About Content Set')}
        description={t(
          'The administrator has not configured any about content yet. You can set it in the settings page, supporting HTML or URL.'
        )}
        className='min-h-0 py-8'
      />
      <div className='border-border bg-card mt-2 w-full max-w-lg space-y-4 rounded-lg border border-dashed px-6 py-8 text-center text-sm'>
        <p className='text-muted-foreground'>
          {t('BoxAI')} © {currentYear}
        </p>
        <p className='text-muted-foreground'>
          {t('This project must be used in compliance with the')}{' '}
          <a
            href='/about'
            target='_blank'
            rel='noopener noreferrer'
            className='text-brand font-medium hover:underline'
          >
            {t('AGPL v3.0 License')}
          </a>
          .
        </p>
      </div>
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
  const { data, isLoading } = useQuery({
    queryKey: ['about-content'],
    queryFn: getAboutContent,
  })

  const rawContent = data?.data?.trim() ?? ''
  const mode = resolveAboutContentMode(rawContent)

  if (isLoading) {
    return (
      <AppShell variant='public'>
        <AboutLoadingSkeleton />
      </AppShell>
    )
  }

  if (mode === 'empty') {
    return (
      <AppShell variant='public'>
        <EmptyAboutState />
      </AppShell>
    )
  }

  if (mode === 'url') {
    return (
      <AppShell variant='public'>
        <iframe
          src={rawContent}
          className='min-h-[calc(100svh-var(--app-header-height,3rem))] w-full border-0'
          title={t('About')}
        />
      </AppShell>
    )
  }

  return (
    <AppShell variant='public'>
      <div className='px-7 py-10 md:py-12'>
        <AboutContentPanel mode={mode} rawContent={rawContent} />
      </div>
    </AppShell>
  )
}
