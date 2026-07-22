import { type ComponentProps, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Panel, PanelHeader } from '@/components/patterns'

type SettingsPanelProps = ComponentProps<'section'> & {
  /** `// group` eyebrow above the title. */
  eyebrow?: ReactNode
  title?: ReactNode
  /** Header tools (search, sync button, badge). */
  actions?: ReactNode
  /** Remove body padding for flush content (tables, editors). */
  flush?: boolean
}

/**
 * SettingsPanel — Panel + eyebrow-grouped header + a SettingRow list.
 * The standard container for every settings section.
 */
export function SettingsPanel({
  eyebrow,
  title,
  actions,
  flush,
  className,
  children,
  ...props
}: SettingsPanelProps) {
  return (
    <Panel className={className} {...props}>
      {(title != null || eyebrow != null || actions != null) && (
        <PanelHeader eyebrow={eyebrow} title={title} actions={actions} />
      )}
      <div
        data-slot='settings-panel-body'
        className={cn(!flush && 'px-4 py-1 sm:px-5')}
      >
        {children}
      </div>
    </Panel>
  )
}
