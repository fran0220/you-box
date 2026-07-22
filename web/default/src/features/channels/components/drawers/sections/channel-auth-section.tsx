import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Eyebrow } from '@/components/patterns'

type ChannelAuthSectionProps = {
  children: ReactNode
}

/**
 * Authentication sub-section. Nested inside the API Access SettingsPanel,
 * so it uses the eyebrow micro-label form instead of its own panel
 * (r2-B7 §5). Fields and validation are untouched.
 */
export function ChannelAuthSection(props: ChannelAuthSectionProps) {
  const { t } = useTranslation()

  return (
    <div className='border-divider flex flex-col gap-4 border-t pt-4'>
      <Eyebrow>{t('authentication')}</Eyebrow>
      {props.children}
    </div>
  )
}
