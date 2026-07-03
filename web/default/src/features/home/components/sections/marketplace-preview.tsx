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
import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Eyebrow } from '@/components/youbox'
import { ModelCard } from '@/features/pricing/components/model-card'
import { usePricingData } from '@/features/pricing/hooks/use-pricing-data'

export function MarketplacePreview() {
  const { t } = useTranslation()
  const { models, isLoading } = usePricingData()
  const previewModels = models.slice(0, 3)

  return (
    <section className='px-4 py-16 md:px-6'>
      <div className='mx-auto max-w-6xl'>
        <div className='mb-8 flex flex-wrap items-end justify-between gap-6'>
          <div className='max-w-xl'>
            <Eyebrow className='mb-3'>{t('Models and pricing')}</Eyebrow>
            <h2 className='font-display text-text-strong text-[clamp(1.75rem,3vw,2.375rem)] leading-[1.08] font-bold tracking-[-0.025em]'>
              {t('Pick a model when the job changes.')}
            </h2>
            <p className='text-muted-foreground mt-3 text-base leading-relaxed md:text-[17px]'>
              {t(
                'Compare price, context, and provider options without turning the homepage into a full marketplace.'
              )}
            </p>
          </div>
          <Button
            variant='secondary'
            className='gap-2'
            render={<Link to='/pricing' />}
          >
            <span>
              {t('See all {{count}} models', {
                count: models.length > 0 ? models.length : '…',
              })}
            </span>
            <ArrowRight className='size-4' aria-hidden='true' />
          </Button>
        </div>

        <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
          {isLoading
            ? Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className='h-56 w-full rounded-[14px]' />
              ))
            : previewModels.map((model) => (
                <ModelCard key={model.model_name} model={model} />
              ))}
        </div>
      </div>
    </section>
  )
}
