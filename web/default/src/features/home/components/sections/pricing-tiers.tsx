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
import { Link } from '@tanstack/react-router'
import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eyebrow } from '@/components/youbox'

type Tier = {
  id: string
  name: string
  price: string
  unit?: string
  featured?: boolean
  features: string[]
  cta: string
  href: string
}

export function PricingTiers() {
  const { t } = useTranslation()

  const tiers: Tier[] = [
    {
      id: 'hobby',
      name: t('Hobby'),
      price: '$0',
      unit: t('/ mo'),
      features: [
        t('Pay-as-you-go credits'),
        t('All models'),
        t('5 requests / sec'),
      ],
      cta: t('Start free'),
      href: '/sign-up',
    },
    {
      id: 'pro',
      name: t('Pro'),
      price: '$20',
      unit: t('/ mo'),
      featured: true,
      features: [
        t('Everything in Hobby'),
        t('500 requests / sec'),
        t('Priority failover routing'),
        t('Usage analytics & alerts'),
      ],
      cta: t('Start Pro trial'),
      href: '/sign-up',
    },
    {
      id: 'enterprise',
      name: t('Enterprise'),
      price: t('Custom'),
      features: [
        t('Volume token discounts'),
        t('SSO, SAML & audit logs'),
        t('Dedicated capacity & SLA'),
      ],
      cta: t('Contact sales'),
      href: '/about',
    },
  ]

  return (
    <section className='px-4 py-16 md:px-6'>
      <div className='mx-auto max-w-6xl'>
        <div className='mx-auto mb-9 max-w-xl text-center'>
          <Eyebrow className='mb-3 justify-center text-center' plain>
            {t('Pricing')}
          </Eyebrow>
          <h2 className='font-display text-text-strong text-[clamp(1.75rem,3vw,2.375rem)] font-bold tracking-[-0.025em]'>
            {t('Pay for tokens, not the gateway.')}
          </h2>
          <p className='text-muted-foreground mt-3 text-base leading-relaxed md:text-[17px]'>
            {t('Start free. Scale to enterprise volume on the same key.')}
          </p>
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={cn(
                'bg-surface-card border-border relative flex flex-col gap-4 rounded-[20px] border p-7',
                tier.featured && 'border-brand-border shadow-[var(--glow-soft)]'
              )}
            >
              {tier.featured ? (
                <Badge className='absolute -top-2.5 right-6'>{t('Most popular')}</Badge>
              ) : null}
              <div className='font-display text-text-strong text-[17px] font-semibold'>
                {tier.name}
              </div>
              <div className='font-display text-text-strong flex items-baseline gap-1.5 text-[42px] leading-none font-bold tracking-[-0.03em]'>
                {tier.price}
                {tier.unit ? (
                  <span className='text-muted-foreground font-mono text-sm font-normal'>
                    {tier.unit}
                  </span>
                ) : null}
              </div>
              <ul className='flex flex-1 flex-col gap-2.5'>
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className='text-muted-foreground flex items-start gap-2 text-sm'
                  >
                    <Check
                      className='text-success mt-0.5 size-4 shrink-0'
                      aria-hidden='true'
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant={tier.featured ? 'default' : 'secondary'}
                className='w-full'
                render={<Link to={tier.href} />}
              >
                {tier.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}