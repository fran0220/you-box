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
import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowRight, Briefcase, Code2, MessagesSquare } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { useStatus } from '@/hooks/use-status'
import { AnimateInView } from '@/components/animate-in-view'

interface Guide {
  eyebrow: string
  title: string
  desc: string
  cta: string
  to: string
  icon: ReactNode
}

function GuideLink(props: {
  guide: Guide
  className?: string
  children: ReactNode
}) {
  const className = cn(
    'group flex h-full flex-col gap-4 py-8 transition-colors',
    props.className
  )
  if (props.guide.to.startsWith('http')) {
    return (
      <a
        href={props.guide.to}
        target='_blank'
        rel='noopener noreferrer'
        className={className}
      >
        {props.children}
      </a>
    )
  }
  return (
    <Link to={props.guide.to} className={className}>
      {props.children}
    </Link>
  )
}

/** Entry points — editorial hairline columns by intent. */
export function HowItWorks() {
  const { t } = useTranslation()
  const { status } = useStatus()
  const docsUrl = (status?.docs_link as string | undefined) || '/docs'

  const guides: Guide[] = [
    {
      eyebrow: t('For chatting'),
      title: t('Chat'),
      desc: t(
        'Talk with 300+ models right in the browser. No code, no setup, just pick a model and start.'
      ),
      cta: t('Open the playground'),
      to: '/playground',
      icon: <MessagesSquare className='size-5' strokeWidth={1.5} />,
    },
    {
      eyebrow: t('For developers'),
      title: t('Developers'),
      desc: t(
        'Call every provider through one OpenAI-compatible API. One key, one balance, drop-in SDK support.'
      ),
      cta: t('Read the docs'),
      to: docsUrl,
      icon: <Code2 className='size-5' strokeWidth={1.5} />,
    },
    {
      eyebrow: t('For everyday work'),
      title: t('Office'),
      desc: t(
        'Bring AI into writing, translation, and analysis with the desktop and web apps you already use.'
      ),
      cta: t('Read the docs'),
      to: docsUrl,
      icon: <Briefcase className='size-5' strokeWidth={1.5} />,
    },
  ]

  return (
    <section className='border-border/70 relative z-10 border-t py-14 md:py-20'>
      <div className='mx-auto w-full max-w-6xl px-4 md:px-6'>
        <AnimateInView className='mb-10 md:mb-12'>
          <p className='yb-eyebrow mb-4'>{t('Get started')}</p>
          <h2 className='font-display max-w-[16em] text-3xl leading-[1.1] font-normal md:text-4xl'>
            {t('Start from what you want to do')}
          </h2>
        </AnimateInView>

        <div className='border-border/70 divide-border/70 grid divide-y border-y md:grid-cols-3 md:divide-x md:divide-y-0'>
          {guides.map((guide, i) => (
            <AnimateInView
              key={guide.title}
              delay={i * 120}
              animation='fade-up'
              className='h-full'
            >
              <GuideLink
                guide={guide}
                className={cn(
                  i === 0 && 'md:pr-8',
                  i === 1 && 'md:px-8',
                  i === 2 && 'md:pl-8'
                )}
              >
                <div className='text-muted-foreground group-hover:text-brand flex items-center gap-3 transition-colors'>
                  <span aria-hidden='true'>{guide.icon}</span>
                  <span className='yb-eyebrow'>{guide.eyebrow}</span>
                </div>
                <h3 className='font-display text-xl font-normal md:text-2xl'>
                  {guide.title}
                </h3>
                <p className='text-muted-foreground max-w-[30em] text-sm leading-relaxed'>
                  {guide.desc}
                </p>
                <span className='text-foreground mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-medium'>
                  {guide.cta}
                  <ArrowRight
                    className='size-4 transition-transform group-hover:translate-x-0.5'
                    aria-hidden='true'
                  />
                </span>
              </GuideLink>
            </AnimateInView>
          ))}
        </div>
      </div>
    </section>
  )
}
