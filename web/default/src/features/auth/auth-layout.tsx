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
import { AnimatedNumber } from '@/components/ui/animated-number'
import { Skeleton } from '@/components/ui/skeleton'
import { AnimateInView } from '@/components/animate-in-view'

type AuthLayoutProps = {
  children: React.ReactNode
}

/**
 * YouBox auth shell: split layout — form column on the left, brand side
 * panel (surface-card, brand glow, value prop + platform stats) on the
 * right. The side panel collapses below lg, leaving the single card.
 */
export function AuthLayout({ children }: AuthLayoutProps) {
  const { t } = useTranslation()
  const { systemName, logo, loading } = useSystemConfig()

  const brand = (
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
        <h1 className='font-display text-lg font-bold tracking-[-0.02em]'>
          {systemName}
        </h1>
      )}
    </Link>
  )

  const stats: Array<{ value: number; suffix: string; label: string }> = [
    { value: 50, suffix: '+', label: t('upstream services integrated') },
    { value: 100, suffix: '+', label: t('model billing support') },
    { value: 50, suffix: '+', label: t('compatible API routes') },
  ]

  return (
    <div className='grid h-svh grid-cols-1 lg:grid-cols-[1fr_0.85fr]'>
      {/* Form column */}
      <div className='relative flex items-center justify-center overflow-y-auto px-4 py-10 sm:px-8'>
        <div className='absolute top-4 left-4 sm:top-8 sm:left-8'>{brand}</div>
        <div className='mx-auto flex w-full max-w-[420px] flex-col justify-center space-y-2 pt-12 sm:pt-0'>
          {children}
        </div>
      </div>

      {/* Brand side panel */}
      <div className='bg-card border-border relative hidden flex-col justify-between overflow-hidden border-l p-14 lg:flex'>
        <div
          aria-hidden
          className='pointer-events-none absolute -top-28 -right-28 size-[420px] rounded-full blur-[10px]'
          style={{
            background:
              'radial-gradient(circle, color-mix(in oklch, var(--brand) 16%, transparent), transparent 62%)',
          }}
        />
        <div className='relative'>{brand}</div>
        <AnimateInView as='div' animation='fade-up' className='relative'>
          <p className='yb-eyebrow mb-4'>
            {'// '}
            {t('AI Application Infrastructure Foundation')}
          </p>
          <p className='font-display max-w-[18em] text-3xl leading-[1.25] font-semibold tracking-[-0.02em]'>
            {t('Unified API Gateway for')} {t('Vast Range of AI Models')}
          </p>
        </AnimateInView>
        <AnimateInView
          as='div'
          animation='fade-up'
          delay={120}
          className='relative flex gap-8'
        >
          {stats.map((s) => (
            <div key={s.label}>
              <div className='font-display text-2xl font-bold'>
                <AnimatedNumber
                  value={s.value}
                  format={(n) => `${Math.round(n)}${s.suffix}`}
                />
              </div>
              <div className='text-muted-foreground mt-1 max-w-[12em] font-mono text-[11px] tracking-[0.06em] uppercase'>
                {s.label}
              </div>
            </div>
          ))}
        </AnimateInView>
      </div>
    </div>
  )
}
