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
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useSystemConfig } from '@/hooks/use-system-config'
import { cn } from '@/lib/utils'
import { useProduct } from '@/products'
import { Skeleton } from '@/components/ui/skeleton'
import { ThemeSwitch } from '@/components/theme-switch'

type AuthLayoutProps = {
  children: React.ReactNode
}

/**
 * Auth shell: Circuit (youbox) uses glass card + brand wash + theme toggle;
 * Paper (origingame) keeps the minimal single column.
 */
export function AuthLayout({ children }: AuthLayoutProps) {
  const { t } = useTranslation()
  const { systemName, logo, loading } = useSystemConfig()
  const product = useProduct()
  const isCircuit = product.ui.skin === 'circuit'

  return (
    <div
      className={cn(
        'bg-background text-foreground relative flex min-h-svh flex-col',
        isCircuit && 'overflow-hidden'
      )}
    >
      <div
        aria-hidden
        className='pointer-events-none absolute inset-x-0 top-0 h-[420px] overflow-hidden'
      >
        <div
          className={cn(
            'absolute top-[-200px] left-1/2 -translate-x-1/2 rounded-full blur-[90px]',
            isCircuit ? 'size-[640px]' : 'size-[560px]'
          )}
          style={{
            background: isCircuit
              ? 'radial-gradient(circle, color-mix(in srgb, var(--brand) 22%, transparent), color-mix(in srgb, #22d3ee 10%, transparent) 45%, transparent 70%)'
              : 'radial-gradient(circle, color-mix(in oklch, var(--brand) 9%, transparent), transparent 62%)',
          }}
        />
        {isCircuit ? (
          <div
            className='absolute inset-0 opacity-[0.35]'
            style={{
              backgroundImage:
                'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
              maskImage:
                'radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent)',
            }}
          />
        ) : null}
      </div>

      <header className='relative flex items-center justify-between px-5 py-5 sm:px-8'>
        <Link
          to='/'
          className='flex items-center gap-2 transition-opacity hover:opacity-80'
        >
          <div
            className={cn(
              'bg-brand-subtle relative size-8 overflow-hidden',
              isCircuit
                ? 'rounded-lg ring-1 ring-[var(--brand-border)]'
                : 'rounded-[8px]'
            )}
          >
            {loading ? (
              <Skeleton className='absolute inset-0' />
            ) : (
              <img
                src={logo}
                alt={t('Logo')}
                className={cn(
                  'size-8 object-cover',
                  isCircuit ? 'rounded-lg' : 'rounded-[8px]'
                )}
              />
            )}
          </div>
          {loading ? (
            <Skeleton className='h-6 w-24' />
          ) : (
            <span
              className={cn(
                'font-display text-lg tracking-[-0.02em]',
                isCircuit ? 'font-semibold' : 'font-bold'
              )}
            >
              {systemName}
            </span>
          )}
        </Link>
        {isCircuit ? <ThemeSwitch /> : null}
      </header>

      <main className='relative flex flex-1 justify-center px-4 pt-10 pb-16 sm:pt-[10vh]'>
        <div
          className={cn('w-full max-w-[400px]', isCircuit && 'max-w-[420px]')}
          data-slot={isCircuit ? 'auth-card' : undefined}
        >
          {children}
        </div>
      </main>
    </div>
  )
}
