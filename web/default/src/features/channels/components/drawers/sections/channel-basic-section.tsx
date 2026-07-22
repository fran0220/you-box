import type { ReactNode } from 'react'
import { Info } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { DrawerSection, DrawerSectionHeader } from '@/components/drawer-layout'

type ChannelBasicSectionProps = {
  children: ReactNode
}

/**
 * Basic Information section — unified drawer `card` section.
 * Fields and validation are untouched; only the wrapper changed.
 */
export function ChannelBasicSection(props: ChannelBasicSectionProps) {
  const { t } = useTranslation()

  return (
    <DrawerSection variant='card'>
      <DrawerSectionHeader
        title={t('Basic Information')}
        icon={<Info className='size-4' />}
      />
      <div className='flex flex-col gap-4'>{props.children}</div>
    </DrawerSection>
  )
}
