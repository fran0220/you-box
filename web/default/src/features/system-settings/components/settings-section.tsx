import { useTranslation } from 'react-i18next'
import { Panel } from '@/components/patterns/panel'
import { SettingsSection as YouboxSettingsSection } from '@/components/youbox'
import { cn } from '@/lib/utils'
import { useSettingsSectionChrome } from './use-settings-section-chrome'

type SettingsSectionProps = {
  title: string
  children: React.ReactNode
  className?: string
}

const panelBodyClassName = 'flex flex-col gap-4 py-3 sm:py-4'

/**
 * Shared container for every system-settings section, using the canonical
 * youbox SettingsSection (Panel + mono group title). When the page chrome
 * already names the section, suppress-header renders a headless panel body
 * only so VAL-SET-010 still finds `[data-slot=settings-panel-body]`.
 */
export function SettingsSection({
  title,
  children,
  className,
}: SettingsSectionProps) {
  const { t } = useTranslation()
  const { suppressSectionHeader: suppressHeader, sectionEyebrow: eyebrowKey } =
    useSettingsSectionChrome()

  if (suppressHeader) {
    return (
      <Panel className={cn(className)}>
        <div data-slot='settings-panel-body' className='px-4 py-1 sm:px-5'>
          <div className={panelBodyClassName}>{children}</div>
        </div>
      </Panel>
    )
  }

  return (
    <YouboxSettingsSection
      className={className}
      title={title}
      description={eyebrowKey ? t(eyebrowKey) : undefined}
    >
      <div data-slot='settings-panel-body' className={panelBodyClassName}>
        {children}
      </div>
    </YouboxSettingsSection>
  )
}
