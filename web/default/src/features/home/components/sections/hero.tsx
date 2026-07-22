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
import { ArrowRight, BookOpen, CircleCheckBig } from 'lucide-react'
import { Trans, useTranslation } from 'react-i18next'
import { getLobeIcon } from '@/lib/lobe-icon'
import { cn } from '@/lib/utils'
import { useStatus } from '@/hooks/use-status'
import { useSystemConfig } from '@/hooks/use-system-config'
import { Button } from '@/components/ui/button'
import { useHeroStatusPill } from '../../hooks/use-hero-status-pill'

/** Client apps and coding agents shown in the hero integrations strip.
 * Names stay untranslated (product names); icons come from @lobehub/icons. */
const INTEGRATION_APPS: Array<{ name: string; icon: string }> = [
  { name: 'Claude Code', icon: 'ClaudeCode.Color' },
  { name: 'Codex', icon: 'Codex' },
  { name: 'OpenCode', icon: 'OpenCode' },
  { name: 'Cherry Studio', icon: 'CherryStudio.Color' },
  { name: 'LobeChat', icon: 'LobeHub.Color' },
  { name: 'Open WebUI', icon: 'OpenWebUI' },
  { name: 'LM Studio', icon: 'LmStudio' },
  { name: 'Cline', icon: 'Cline' },
  { name: 'Roo Code', icon: 'RooCode' },
  { name: 'Cursor', icon: 'Cursor' },
  { name: 'Dify', icon: 'Dify.Color' },
  { name: 'FastGPT', icon: 'FastGPT.Color' },
  { name: 'Coze', icon: 'Coze' },
]

interface HeroProps {
  className?: string
  isAuthenticated?: boolean
}

export function Hero(props: HeroProps) {
  const { t } = useTranslation()
  const { status } = useStatus()
  const { systemName } = useSystemConfig()
  const docsUrl = (status?.docs_link as string | undefined) || '/docs'
  const statusPill = useHeroStatusPill()

  const renderDocsButton = () => {
    const isExternal = docsUrl.startsWith('http')
    if (isExternal) {
      return (
        <Button
          variant='secondary'
          className='group inline-flex h-11 items-center gap-1.5 rounded-lg px-5 text-sm font-medium'
          render={
            <a href={docsUrl} target='_blank' rel='noopener noreferrer' />
          }
        >
          <BookOpen className='text-muted-foreground/80 group-hover:text-foreground size-4' />
          <span>{t('Read the docs')}</span>
        </Button>
      )
    }
    return (
      <Button
        variant='secondary'
        className='group inline-flex h-11 items-center gap-1.5 rounded-lg px-5 text-sm font-medium'
        render={<Link to={docsUrl} />}
      >
        <BookOpen className='text-muted-foreground/80 group-hover:text-foreground size-4' />
        <span>{t('Read the docs')}</span>
      </Button>
    )
  }

  return (
    <section className='relative z-10 overflow-hidden pt-16 pb-16 md:pt-24 md:pb-20 lg:pt-28'>
      <div className='hero-backdrop' aria-hidden='true'>
        <div className='hero-wash hero-wash--brand' />
        <div className='hero-wash hero-wash--warm' />
      </div>

      <div className='relative mx-auto w-full max-w-6xl px-4 md:px-6'>
        <Link
          to='/status'
          className='landing-animate-fade-up border-border bg-surface-2 text-muted-foreground hover:border-brand-border mb-7 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs opacity-0 transition-colors'
          style={{ animationDelay: '0ms' }}
        >
          <span
            className={cn(
              'size-[7px] rounded-full',
              statusPill.variant === 'danger'
                ? 'bg-destructive'
                : statusPill.variant === 'warning'
                  ? 'bg-warning'
                  : 'bg-success'
            )}
            aria-hidden='true'
          />
          <span>{t(statusPill.label)}</span>
          <span className='bg-divider mx-0.5 h-3 w-px' aria-hidden='true' />
          <span className='font-mono text-[11px]'>
            {statusPill.loading
              ? t('Checking status…')
              : t('{{value}} uptime', { value: statusPill.uptimeDisplay })}
          </span>
          <ArrowRight className='size-3.5 opacity-60' aria-hidden='true' />
        </Link>

        <p
          className='yb-eyebrow landing-animate-fade-up mb-5 opacity-0'
          style={{ animationDelay: '40ms' }}
        >
          {t('One API · 300+ models')}
        </p>

        <h1
          className='font-display landing-animate-fade-up max-w-[13em] text-[clamp(2.875rem,7.5vw,5.25rem)] leading-[1.02] font-normal tracking-[-0.015em] opacity-0'
          style={{ animationDelay: '60ms' }}
        >
          <Trans i18nKey='Hero headline' components={{ br: <br /> }} />
        </h1>

        <p
          className='landing-animate-fade-up text-muted-foreground mt-6 max-w-[34em] text-base leading-relaxed opacity-0 md:text-xl md:leading-[1.55]'
          style={{ animationDelay: '120ms' }}
        >
          {t(
            '{{brandName}} is the unified gateway to every frontier LLM. Write one integration and route to any provider — with automatic failover, smart cost routing, and pass-through pricing.',
            { brandName: systemName }
          )}
        </p>

        <div
          className='landing-animate-fade-up mt-9 flex flex-wrap items-center gap-3 opacity-0'
          style={{ animationDelay: '180ms' }}
        >
          {props.isAuthenticated ? (
            <>
              <Button
                className='group h-11 rounded-lg px-5 text-sm font-medium'
                render={<Link to='/dashboard' />}
              >
                {t('Go to Dashboard')}
                <ArrowRight className='ml-1.5 size-4 transition-transform group-hover:translate-x-0.5' />
              </Button>
              {renderDocsButton()}
            </>
          ) : (
            <>
              <Button
                className='group h-11 rounded-lg px-5 text-sm font-medium'
                render={<Link to='/sign-up' />}
              >
                {t('Get your API key')}
                <ArrowRight className='ml-1.5 size-4 transition-transform group-hover:translate-x-0.5' />
              </Button>
              {renderDocsButton()}
            </>
          )}
        </div>

        <p
          className='landing-animate-fade-up text-muted-foreground mt-5 flex items-center gap-2 text-[13px] opacity-0'
          style={{ animationDelay: '220ms' }}
        >
          <CircleCheckBig
            className='text-success size-[15px]'
            aria-hidden='true'
          />
          {t('Drop-in OpenAI, Claude, and Gemini APIs.')}
        </p>

        {/* Client integrations strip: the gateway plugs into the AI apps
            and coding agents people already use. */}
        <div
          className='landing-animate-fade-up border-border/70 mt-14 border-t pt-6 opacity-0'
          style={{ animationDelay: '280ms' }}
        >
          <p className='yb-eyebrow text-muted-foreground/80'>
            {t('Plug into the AI apps you already use')}
          </p>
          <ul className='mt-4 flex flex-wrap items-center gap-x-7 gap-y-3'>
            {INTEGRATION_APPS.map((app) => (
              <li
                key={app.name}
                className='text-muted-foreground hover:text-foreground flex items-center gap-2 text-[13px] font-medium transition-colors'
              >
                <span className='shrink-0 opacity-80' aria-hidden='true'>
                  {getLobeIcon(app.icon, 17)}
                </span>
                {app.name}
              </li>
            ))}
            <li>
              <Link
                to='/playground'
                className='text-muted-foreground/70 hover:text-foreground text-[13px] underline decoration-dotted underline-offset-4 transition-colors'
              >
                {t('and any OpenAI-compatible client')}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}
