import type { ReactNode } from 'react'
import { Boxes } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { DrawerSection, DrawerSectionHeader } from '@/components/drawer-layout'

type ChannelModelsSectionProps = {
  children: ReactNode
}

/**
 * Models & Groups section — unified drawer `card` section.
 * Fields and validation are untouched; only the wrapper changed.
 */
export function ChannelModelsSection(props: ChannelModelsSectionProps) {
  const { t } = useTranslation()

  return (
    <DrawerSection variant='card'>
      <DrawerSectionHeader
        title={t('Models & Groups')}
        icon={<Boxes className='size-4' />}
      />
      <div className='flex flex-col gap-4'>{props.children}</div>
    </DrawerSection>
  )
}
