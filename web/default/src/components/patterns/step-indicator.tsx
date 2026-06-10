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
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export type StepIndicatorStep = {
  label: string
}

type StepIndicatorProps = {
  steps: StepIndicatorStep[]
  /** Zero-based index of the active step; earlier steps render done. */
  current: number
  className?: string
}

/**
 * StepIndicator — horizontal done/active/pending dots joined by
 * connector lines (setup wizard form). Done = success check,
 * active = brand, pending = muted.
 */
export function StepIndicator({ steps, current, className }: StepIndicatorProps) {
  return (
    <ol
      data-slot='step-indicator'
      className={cn('flex items-center gap-3 sm:gap-4', className)}
    >
      {steps.map((step, index) => {
        const state =
          index < current ? 'done' : index === current ? 'active' : 'pending'
        return (
          <li
            key={index}
            aria-current={state === 'active' ? 'step' : undefined}
            className='flex min-w-0 flex-1 items-center gap-2.5 last:flex-none sm:gap-3'
          >
            <span
              aria-hidden='true'
              className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded-full font-mono text-[13px] font-semibold',
                state === 'done' && 'bg-success text-white',
                state === 'active' && 'bg-brand text-brand-foreground',
                state === 'pending' && 'bg-surface-3 text-muted-foreground'
              )}
            >
              {state === 'done' ? <Check className='size-3.5' strokeWidth={3} /> : index + 1}
            </span>
            <span
              className={cn(
                'truncate text-sm',
                state === 'active'
                  ? 'text-foreground font-semibold'
                  : state === 'done'
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground font-medium'
              )}
            >
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <span aria-hidden='true' className='bg-divider h-px min-w-4 flex-1' />
            )}
          </li>
        )
      })}
    </ol>
  )
}
