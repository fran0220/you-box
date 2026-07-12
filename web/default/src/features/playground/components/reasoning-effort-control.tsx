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
import { BrainIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { SegmentedControl } from '@/components/patterns'
import type { ReasoningEffort } from '../types'

type ReasoningEffortControlProps = {
  value: ReasoningEffort
  onChange: (value: ReasoningEffort) => void
  disabled?: boolean
  className?: string
  /** Compact: icon-only off/low/med/high chips without labels on small screens. */
  compact?: boolean
}

/**
 * Product-facing reasoning intensity control (Off / Low / Medium / High).
 * Shown only when the selected model supports reasoning.
 */
export function ReasoningEffortControl({
  value,
  onChange,
  disabled,
  className,
  compact = true,
}: ReasoningEffortControlProps) {
  const { t } = useTranslation()

  // Map 'minimal' (advanced sheet) into Low for the product control.
  const displayValue: ReasoningEffort =
    value === 'minimal' ? 'low' : value === 'off' ? 'off' : value

  const options = compact
    ? [
        { value: 'off', label: t('Off'), tooltip: t('No extended reasoning') },
        { value: 'low', label: t('Low'), tooltip: t('Low reasoning effort') },
        {
          value: 'medium',
          label: t('Med'),
          tooltip: t('Medium reasoning effort'),
        },
        { value: 'high', label: t('High'), tooltip: t('High reasoning effort') },
      ]
    : [
        { value: 'off', label: t('Off') },
        { value: 'low', label: t('Low') },
        { value: 'medium', label: t('Medium') },
        { value: 'high', label: t('High') },
      ]

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5',
        disabled && 'pointer-events-none opacity-50',
        className
      )}
    >
      <BrainIcon
        className='text-muted-foreground size-3.5 shrink-0'
        aria-hidden
      />
      <SegmentedControl
        ariaLabel={t('Reasoning effort')}
        value={displayValue}
        onChange={(next) => onChange(next as ReasoningEffort)}
        options={options}
        className='h-7'
      />
    </div>
  )
}
