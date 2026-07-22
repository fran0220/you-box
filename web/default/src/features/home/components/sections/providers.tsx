import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getLobeIcon } from '@/lib/lobe-icon'

const PROVIDERS: Array<{ name: string; icon: string }> = [
  { name: 'Anthropic', icon: 'Anthropic' },
  { name: 'OpenAI', icon: 'OpenAI' },
  { name: 'Google', icon: 'Google.Color' },
  { name: 'xAI', icon: 'XAI' },
  { name: 'Meta', icon: 'Meta.Color' },
  { name: 'Mistral', icon: 'Mistral.Color' },
  { name: 'DeepSeek', icon: 'DeepSeek.Color' },
  { name: 'Qwen', icon: 'Qwen.Color' },
  { name: 'Moonshot AI', icon: 'Moonshot' },
  { name: 'Zhipu AI', icon: 'Zhipu.Color' },
  { name: 'MiniMax', icon: 'Minimax.Color' },
  { name: 'ByteDance', icon: 'ByteDance.Color' },
  { name: 'Tencent', icon: 'Tencent.Color' },
  { name: 'Baidu', icon: 'Baidu.Color' },
  { name: 'Cohere', icon: 'Cohere.Color' },
  { name: '01.AI', icon: 'Yi.Color' },
  { name: 'StepFun', icon: 'Stepfun.Color' },
  { name: 'InternLM', icon: 'InternLM.Color' },
]

/** Provider wall — editorial hairline grid. */
export function Providers() {
  const { t } = useTranslation()

  return (
    <section className='border-border/70 border-t py-14 md:py-20'>
      <div className='mx-auto w-full max-w-6xl px-4 md:px-6'>
        <p className='yb-eyebrow mb-4'>{t('Model providers')}</p>
        <h2 className='font-display max-w-[16em] text-3xl leading-[1.1] font-normal md:text-4xl'>
          {t('Every frontier lab, one endpoint')}
        </h2>
        <p className='text-muted-foreground mt-4 max-w-[36em] text-base leading-relaxed'>
          {t(
            'From Anthropic to xAI — switch providers and models without changing a line of code.'
          )}
        </p>

        <ul className='border-border/70 mt-10 grid grid-cols-2 border-t border-l sm:grid-cols-3 lg:grid-cols-6'>
          {PROVIDERS.map((provider) => (
            <li
              key={provider.name}
              className='border-border/70 text-muted-foreground hover:text-foreground flex items-center gap-2.5 border-r border-b px-4 py-4 text-[13px] font-medium transition-colors'
            >
              <span className='shrink-0' aria-hidden='true'>
                {getLobeIcon(provider.icon, 18)}
              </span>
              <span className='truncate'>{provider.name}</span>
            </li>
          ))}
        </ul>

        <Link
          to='/pricing'
          className='group text-muted-foreground hover:text-foreground mt-6 inline-flex items-center gap-1.5 text-sm transition-colors'
        >
          {t('Browse all models in the Model Plaza')}
          <ArrowRight
            className='size-4 transition-transform group-hover:translate-x-0.5'
            aria-hidden='true'
          />
        </Link>
      </div>
    </section>
  )
}
