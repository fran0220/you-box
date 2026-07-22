import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/auth-store'
import { Markdown } from '@/components/ui/markdown'
import { Skeleton } from '@/components/ui/skeleton'
import { CTA, Hero, HowItWorks, Modalities, Providers } from './components'
import { useHomePageContent } from './hooks'

export function Home() {
  const { t } = useTranslation()
  const { auth } = useAuthStore()
  const isAuthenticated = !!auth.user
  const { content, isLoaded, isUrl } = useHomePageContent()

  if (!isLoaded) {
    return (
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
    )
  }

  if (content) {
    return (
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
    )
  }

  return (
    <>
      <Hero isAuthenticated={isAuthenticated} />
      <Providers />
      <Modalities />
      <HowItWorks />
      <CTA isAuthenticated={isAuthenticated} />
    </>
  )
}
