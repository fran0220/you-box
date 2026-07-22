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
