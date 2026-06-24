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
import { type ComponentProps, type ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Sparkles,
  XCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const inlineAlertVariants = cva(
  'flex items-start gap-3 rounded-lg border p-4',
  {
    variants: {
      tone: {
        success: 'border-success/35 bg-success-subtle',
        warning: 'border-warning/35 bg-warning-subtle',
        danger: 'border-destructive/35 bg-danger-subtle',
        info: 'border-info/35 bg-info-subtle',
        brand: 'border-brand-border bg-brand-subtle',
      },
    },
    defaultVariants: { tone: 'info' },
  }
)

const TONE_ICON = {
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: XCircle,
  info: Info,
  brand: Sparkles,
} as const

const TONE_TEXT = {
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-destructive',
  info: 'text-info',
  brand: 'text-brand',
} as const

type InlineAlertProps = ComponentProps<'div'> &
  VariantProps<typeof inlineAlertVariants> & {
    /** Bold first line; body goes in children. */
    title?: ReactNode
    /** Override the tone-derived icon; pass null to hide. */
    icon?: ReactNode | null
    /** Right-aligned actions (copy bar, buttons). */
    actions?: ReactNode
  }

/**
 * InlineAlert — subtle semantic panel with icon, content slot and
 * actions. Carries new-key reveals, redemption results and inline
 * guard messages.
 */
export function InlineAlert({
  tone,
  title,
  icon,
  actions,
  className,
  children,
  ...props
}: InlineAlertProps) {
  const resolvedTone = tone ?? 'info'
  const Icon = TONE_ICON[resolvedTone]
  return (
    <div
      data-slot='inline-alert'
      role={
        resolvedTone === 'danger' || resolvedTone === 'warning'
          ? 'alert'
          : 'status'
      }
      className={cn(inlineAlertVariants({ tone }), className)}
      {...props}
    >
      {icon !== null && (
        <span
          aria-hidden='true'
          className={cn(
            'mt-0.5 shrink-0 [&>svg]:size-5',
            TONE_TEXT[resolvedTone]
          )}
        >
          {icon ?? <Icon />}
        </span>
      )}
      <div className='min-w-0 flex-1'>
        {title != null && (
          <div className='text-foreground text-sm font-semibold'>{title}</div>
        )}
        {children != null && (
          <div className='text-muted-foreground mt-0.5 text-[13px] leading-normal'>
            {children}
          </div>
        )}
      </div>
      {actions != null && (
        <div className='flex shrink-0 items-center gap-2 self-center'>
          {actions}
        </div>
      )}
    </div>
  )
}
