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
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { usePricingData } from '@/features/pricing/hooks/use-pricing-data'

const FALLBACK_PROVIDERS = [
  'Anthropic',
  'OpenAI',
  'Google',
  'Meta',
  'Mistral AI',
  'DeepSeek',
] as const

export function Providers() {
  const { t } = useTranslation()
  const { vendors, isLoading } = usePricingData()

  const providerNames = useMemo(() => {
    if (vendors.length > 0) {
      return vendors.slice(0, 6).map((vendor) => vendor.name)
    }
    return [...FALLBACK_PROVIDERS]
  }, [vendors])

  const overflow =
    vendors.length > 6 ? vendors.length - 6 : FALLBACK_PROVIDERS.length > 6 ? 28 : 0

  return (
    <section className='px-4 py-8 md:px-6'>
      <div className='mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-3.5'>
        <span className='text-muted-foreground mr-1 font-mono text-[11px] tracking-[0.08em] uppercase'>
          {t('Route to')}
        </span>
        {providerNames.map((name) => (
          <span
            key={name}
            className={cn(
              'border-border bg-surface text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[13px] font-medium',
              isLoading && 'animate-pulse'
            )}
          >
            <span className='bg-accent size-[7px] rounded-full' aria-hidden='true' />
            {name}
          </span>
        ))}
        {overflow > 0 ? (
          <span className='border-border bg-surface text-muted-foreground rounded-full border px-3.5 py-1.5 text-[13px] font-medium'>
            {t('+{{count}} more', { count: overflow })}
          </span>
        ) : null}
      </div>
    </section>
  )
}