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
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

type PasswordStrengthProps = {
  password: string
  className?: string
}

// Simple 0-4 score: length, mixed case, digits, symbols (R2-B15).
// Visual hint only — actual validation stays in the form schema.
function scorePassword(password: string): number {
  if (!password) return 0
  let score = 0
  if (password.length >= 8) score += 1
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1
  if (/\d/.test(password)) score += 1
  if (/[^a-zA-Z0-9]/.test(password)) score += 1
  return score
}

/**
 * PasswordStrength — four-segment strength meter shown under password
 * inputs (sign-up). Filled segments use bg-brand, empty bg-surface-3.
 */
export function PasswordStrength({
  password,
  className,
}: PasswordStrengthProps) {
  const { t } = useTranslation()
  const score = scorePassword(password)

  const labels = [
    t('Weak password'),
    t('Weak password'),
    t('Fair password'),
    t('Good password'),
    t('Strong password'),
  ]

  return (
    <div className={cn('space-y-1.5', className)} aria-live='polite'>
      <div className='flex gap-1'>
        {Array.from({ length: 4 }).map((_, index) => (
          <span
            key={index}
            aria-hidden='true'
            className={cn(
              'h-1 flex-1 rounded',
              index < score ? 'bg-brand' : 'bg-surface-3'
            )}
          />
        ))}
      </div>
      <p className='text-muted-foreground text-xs'>
        {password
          ? labels[score]
          : t('Use 8+ characters with upper & lower case, numbers and symbols')}
      </p>
    </div>
  )
}
