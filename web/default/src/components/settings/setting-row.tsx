import { type ComponentProps, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

type SettingRowProps = Omit<ComponentProps<'div'>, 'title'> & {
  /** Setting name — medium weight. */
  label: ReactNode
  /** Muted helper line under the label. */
  description?: ReactNode
  /** Right-aligned control: Switch, Select, Input, button group. */
  control?: ReactNode
  /** Dims the whole row and blocks interaction (dependent settings). */
  disabled?: boolean
  /** Associate the label with the control's input id. */
  htmlFor?: string
}

/**
 * SettingRow — one configuration item: label + description on the left,
 * control on the right, divider between rows. The building block of
 * every SettingsPanel.
 */
export function SettingRow({
  label,
  description,
  control,
  disabled,
  htmlFor,
  className,
  children,
  ...props
}: SettingRowProps) {
  const LabelTag = htmlFor ? 'label' : 'div'
  return (
    <div
      data-slot='setting-row'
      data-disabled={disabled || undefined}
      aria-disabled={disabled || undefined}
      className={cn(
        'border-divider flex flex-wrap items-center gap-x-5 gap-y-2 border-b py-4 last:border-b-0 sm:flex-nowrap',
        disabled && 'pointer-events-none opacity-50',
        className
      )}
      {...props}
    >
      <div className='min-w-0 flex-1 basis-52'>
        <LabelTag
          htmlFor={htmlFor}
          className='text-foreground block text-sm font-medium'
        >
          {label}
        </LabelTag>
        {description != null && (
          <div className='text-muted-foreground mt-0.5 text-[13px] leading-normal'>
            {description}
          </div>
        )}
      </div>
      {control != null && (
        <div className='flex shrink-0 items-center gap-2'>{control}</div>
      )}
      {children}
    </div>
  )
}
