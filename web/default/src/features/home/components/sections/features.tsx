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
import { Code, DollarSign, ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { AnimateInView } from '@/components/animate-in-view'

interface FeaturesProps {
  className?: string
}

export function Features(props: FeaturesProps) {
  const { t } = useTranslation()

  const features = [
    {
      id: 'compatible-api',
      title: t('One OpenAI-compatible API'),
      description: t(
        'Use one SDK and one base URL for chat, responses, embeddings, and image workflows.'
      ),
      meta: t('Drop-in integration'),
      icon: Code,
    },
    {
      id: 'provider-routing',
      title: t('Routing without provider lock-in'),
      description: t(
        'Switch models and upstream providers without changing client code or exposing extra keys.'
      ),
      meta: t('Failover-ready'),
      icon: ShieldCheck,
    },
    {
      id: 'transparent-usage',
      title: t('Transparent usage and billing'),
      description: t(
        'Track requests, tokens, balance, and errors from the console before traffic scales.'
      ),
      meta: t('Built-in logs'),
      icon: DollarSign,
    },
  ]

  return (
    <section className={cn('relative z-10 py-16 md:py-20', props.className)}>
      <AnimateInView className='mx-auto mb-9 max-w-2xl text-center'>
        <p className='yb-eyebrow mb-3 justify-center'>
          {'// '}
          {t('Core workflow')}
        </p>
        <h2 className='font-display text-2xl leading-tight font-bold tracking-[-0.025em] md:text-3xl'>
          {t('Everything points back to using the API')}
        </h2>
        <p className='text-muted-foreground mt-3 text-sm leading-relaxed md:text-base'>
          {t(
            'The default experience now focuses on the few decisions users make every day: connect, route, and monitor.'
          )}
        </p>
      </AnimateInView>

      <div className='grid gap-4 md:grid-cols-3'>
        {features.map((feature, index) => {
          const Icon = feature.icon

          return (
            <AnimateInView
              key={feature.id}
              delay={index * 80}
              animation='fade-up'
              className='bg-card flex h-full flex-col gap-4 rounded-2xl border p-6 shadow-xs'
            >
              <div className='flex items-center justify-between gap-3'>
                <span className='bg-brand-subtle text-brand flex size-10 items-center justify-center rounded-xl'>
                  <Icon
                    className='size-5'
                    strokeWidth={1.7}
                    aria-hidden='true'
                  />
                </span>
                <span className='text-muted-foreground rounded-full border px-2.5 py-1 font-mono text-[11px]'>
                  {feature.meta}
                </span>
              </div>
              <div className='flex flex-col gap-2'>
                <h3 className='text-base font-semibold tracking-[-0.01em]'>
                  {feature.title}
                </h3>
                <p className='text-muted-foreground text-sm leading-relaxed'>
                  {feature.description}
                </p>
              </div>
            </AnimateInView>
          )
        })}
      </div>
    </section>
  )
}
