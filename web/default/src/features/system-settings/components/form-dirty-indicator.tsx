import { useTranslation } from 'react-i18next'
import { SettingsPageTitleStatusPortal } from './settings-page-context'

type FormDirtyIndicatorProps = {
  isDirty: boolean
  message?: string
}

/**
 * Compact page-title status indicator for unsaved form changes.
 *
 * @example
 * ```tsx
 * <FormDirtyIndicator isDirty={form.formState.isDirty} />
 * ```
 */
export function FormDirtyIndicator({
  isDirty,
  message,
}: FormDirtyIndicatorProps) {
  const { t } = useTranslation()
  if (!isDirty) return null

  return (
    <SettingsPageTitleStatusPortal>
      <span className='bg-surface-2 text-foreground ring-border inline-flex h-5 items-center gap-1.5 rounded-full px-2 font-mono text-[11px] font-medium tracking-wide whitespace-nowrap uppercase ring-1 ring-inset'>
        <span className='bg-foreground size-1.5 rounded-full opacity-70' />
        {message ? t(message) : t('Unsaved changes')}
      </span>
    </SettingsPageTitleStatusPortal>
  )
}
