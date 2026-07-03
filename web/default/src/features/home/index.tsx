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
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/auth-store'
import { Markdown } from '@/components/ui/markdown'
import { Skeleton } from '@/components/ui/skeleton'
import { AppShell } from '@/components/layout/components/app-shell'
import {
  CTA,
  Features,
  Hero,
  HowItWorks,
  MarketplacePreview,
} from './components'
import { useHomePageContent } from './hooks'

export function Home() {
  const { t } = useTranslation()
  const { auth } = useAuthStore()
  const isAuthenticated = !!auth.user
  const { content, isLoaded, isUrl } = useHomePageContent()

  if (!isLoaded) {
    return (
      <AppShell variant='public'>
        <div
          className='flex min-h-[50vh] flex-1 flex-col items-center justify-center gap-3 px-4'
          aria-busy
          aria-live='polite'
        >
          <Skeleton className='h-4 w-32' />
          <p className='text-muted-foreground font-mono text-sm'>
            {t('Loading...')}
          </p>
        </div>
      </AppShell>
    )
  }

  if (content) {
    return (
      <AppShell variant='public'>
        <div className='overflow-x-hidden'>
          {isUrl ? (
            <iframe
              src={content}
              className='min-h-[calc(100svh-var(--app-header-height,3rem))] w-full border-none'
              title={t('Custom Home Page')}
            />
          ) : (
            <div className='py-2'>
              <div className='bg-card border-border rounded-[var(--radius-lg)] border p-6 md:p-10'>
                <Markdown className='custom-home-content'>{content}</Markdown>
              </div>
            </div>
          )}
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell variant='public'>
      <Hero isAuthenticated={isAuthenticated} />
      <Features />
      <HowItWorks />
      <MarketplacePreview />
      <CTA isAuthenticated={isAuthenticated} />
    </AppShell>
  )
}
