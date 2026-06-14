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
import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { AnimateInView } from '@/components/animate-in-view'

interface CTAProps {
  className?: string
  isAuthenticated?: boolean
}

export function CTA(props: CTAProps) {
  const { t } = useTranslation()

  if (props.isAuthenticated) {
    return null
  }

  return (
    <section className='relative z-10 overflow-hidden px-6 py-24 md:py-32'>
      <AnimateInView className='mx-auto max-w-4xl' animation='scale-in'>
        <div className='border-brand-border bg-card relative overflow-hidden rounded-2xl border px-8 py-14 text-center shadow-[var(--glow-soft)] md:px-14'>
          <div
            aria-hidden
            className='pointer-events-none absolute -top-32 left-1/2 -z-0 size-[480px] -translate-x-1/2 rounded-full blur-[10px]'
            style={{
              background:
                'radial-gradient(circle, color-mix(in oklch, var(--brand) 16%, transparent), transparent 62%)',
            }}
          />
          <h2 className='font-display relative text-2xl leading-tight font-bold tracking-[-0.03em] md:text-4xl'>
            {t('Ready to simplify')}
            <br />
            <span className='text-brand'>{t('your AI integration?')}</span>
          </h2>
          <p className='text-muted-foreground relative mx-auto mt-5 max-w-md text-sm leading-relaxed md:text-base'>
            {t(
              'Deploy your own gateway and start routing requests through your configured upstream services.'
            )}
          </p>
          <div className='relative mt-8 flex items-center justify-center gap-3'>
            <Button size='lg' className='group' render={<Link to='/sign-up' />}>
              {t('Get Started')}
              <ArrowRight className='duration-fast ml-1 size-3.5 transition-transform group-hover:translate-x-0.5' />
            </Button>
            <Button
              size='lg'
              variant='secondary'
              render={<Link to='/pricing' />}
            >
              {t('View Pricing')}
            </Button>
          </div>
        </div>
      </AnimateInView>
    </section>
  )
}
