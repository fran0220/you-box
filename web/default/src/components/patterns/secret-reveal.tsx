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
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { CopyButton } from '@/components/copy-button'

type SecretRevealProps = {
  /** The full secret (copied to clipboard). */
  value: string
  /** Masked form; derived (first 7 + •••• + last 4) when omitted. */
  masked?: string
  /** Start revealed — the "shown only once" post-create state. */
  defaultRevealed?: boolean
  /** Hide the eye toggle (strict one-time reveal). */
  hideToggle?: boolean
  className?: string
}

function deriveMask(value: string) {
  if (value.length <= 12) return '•'.repeat(value.length)
  return `${value.slice(0, 7)}${'•'.repeat(8)}${value.slice(-4)}`
}

/**
 * SecretReveal — mono secret field with mask toggle and copy feedback.
 * Used for the one-time key reveal after creation and anywhere a
 * credential needs a safe copy affordance.
 */
export function SecretReveal({
  value,
  masked,
  defaultRevealed = false,
  hideToggle,
  className,
}: SecretRevealProps) {
  const { t } = useTranslation()
  const [revealed, setRevealed] = useState(defaultRevealed)
  return (
    <div
      data-slot='secret-reveal'
      className={cn(
        'bg-code border-code-border flex h-9 min-w-0 items-center gap-1 rounded-md border ps-3 pe-1',
        className
      )}
    >
      <code className='text-foreground min-w-0 flex-1 truncate font-mono text-[13px]'>
        {revealed ? value : (masked ?? deriveMask(value))}
      </code>
      {!hideToggle && (
        <Button
          variant='ghost'
          size='icon-xs'
          aria-label={revealed ? t('Hide') : t('Show')}
          aria-pressed={revealed}
          onClick={() => setRevealed((v) => !v)}
          className='text-muted-foreground'
        >
          {revealed ? <EyeOff /> : <Eye />}
        </Button>
      )}
      <CopyButton value={value} size='icon' className='size-7' />
    </div>
  )
}
