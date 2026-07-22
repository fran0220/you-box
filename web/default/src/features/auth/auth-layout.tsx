import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useSystemConfig } from '@/hooks/use-system-config'
import { Skeleton } from '@/components/ui/skeleton'
import { ThemeSwitch } from '@/components/theme-switch'

type AuthLayoutProps = {
  children: React.ReactNode
}

/**
 * Auth shell: minimal single centered column with the brand top-left and a
 * soft accent wash behind the header (Amp × Arcade).
 */
export function AuthLayout({ children }: AuthLayoutProps) {
  const { t } = useTranslation()
  const { systemName, logo, loading } = useSystemConfig()

  return (
    <div className='bg-background text-foreground relative flex min-h-svh flex-col'>
      <div
        aria-hidden
        className='pointer-events-none absolute inset-x-0 top-0 h-[420px] overflow-hidden'
      >
        <div
          className='absolute top-[-200px] left-1/2 size-[560px] -translate-x-1/2 rounded-full blur-[90px]'
          style={{
            background:
              'radial-gradient(circle, color-mix(in srgb, var(--brand) 12%, transparent), transparent 62%)',
          }}
        />
      </div>

      <header className='relative flex items-center justify-between px-5 py-5 sm:px-8'>
        <Link
          to='/'
          className='flex items-center gap-2 transition-opacity hover:opacity-80'
        >
          <div className='bg-brand-subtle relative size-8 overflow-hidden rounded-[8px]'>
            {loading ? (
              <Skeleton className='absolute inset-0' />
            ) : (
              <img
                src={logo}
                alt={t('Logo')}
                className='size-8 rounded-[8px] object-cover'
              />
            )}
          </div>
          {loading ? (
            <Skeleton className='h-6 w-24' />
          ) : (
            <span className='font-display text-lg tracking-[-0.02em]'>
              {systemName}
            </span>
          )}
        </Link>
        <ThemeSwitch />
      </header>

      <main className='relative flex flex-1 justify-center px-4 pt-10 pb-16 sm:pt-[10vh]'>
        <div className='w-full max-w-[400px]'>{children}</div>
      </main>
    </div>
  )
}
