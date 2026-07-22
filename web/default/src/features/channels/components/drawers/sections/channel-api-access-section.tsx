import type { ReactNode } from 'react'
import { KeyRound } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { DrawerSection, DrawerSectionHeader } from '@/components/drawer-layout'

type ChannelApiAccessSectionProps = {
  children: ReactNode
}

/**
 * API Access section — unified drawer `card` section.
 * Fields and validation are untouched; only the wrapper changed.
 */
export function ChannelApiAccessSection(props: ChannelApiAccessSectionProps) {
  const { t } = useTranslation()

  return (
    <DrawerSection variant='card'>
      <DrawerSectionHeader
        title={t('API Access')}
        icon={<KeyRound className='size-4' />}
      />
      <div className='flex flex-col gap-4'>{props.children}</div>
    </DrawerSection>
  )
}
