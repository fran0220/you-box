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
import { useQuery } from '@tanstack/react-query'
import { Lock, Route, Shield, Zap } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSystemConfig } from '@/hooks/use-system-config'
import { Card } from '@/components/ui/card'
import { Eyebrow, StatCard, StatCardRow } from '@/components/youbox'
import { getUptimeStatus } from '@/features/dashboard/api'
import { getPricing } from '@/features/pricing/api'
import {
  averageMonitorUptime,
  flattenMonitors,
} from '@/features/status/lib/status-helpers'

const PRINCIPLES = [
  {
    icon: Lock,
    title: 'No lock-in, ever',
    body: 'Standard OpenAI-compatible API. If you ever want to leave, your code already runs anywhere. We earn your business every month.',
  },
  {
    icon: Route,
    title: 'Routing is the product',
    body: 'Smart failover, cost-aware routing, and provider selection are built in — not bolt-on extras.',
  },
  {
    icon: Shield,
    title: 'Security by default',
    body: 'Encryption in transit, scoped API keys, and retention controls designed for production workloads.',
  },
  {
    icon: Zap,
    title: 'Ship speed matters',
    body: 'Change one model string to switch providers. Ship new models without rewriting your integration.',
  },
] as const

export function AboutMarketingFallback() {
  const { t } = useTranslation()
  const { systemName } = useSystemConfig()

  const pricingQuery = useQuery({
    queryKey: ['pricing'],
    queryFn: getPricing,
    staleTime: 5 * 60 * 1000,
  })

  const uptimeQuery = useQuery({
    queryKey: ['uptime-status'],
    queryFn: getUptimeStatus,
    staleTime: 60_000,
    retry: false,
  })

  const modelCount = pricingQuery.data?.data?.length ?? 0
  const vendorCount = pricingQuery.data?.vendors?.length ?? 0
  const monitors = flattenMonitors(uptimeQuery.data?.data ?? [])
  const avgUptime = averageMonitorUptime(monitors)

  return (
    <div className='mx-auto w-full max-w-[1000px] px-7 py-12 md:py-16'>
      <section className='mb-14 text-center'>
        <Eyebrow className='mb-4 text-center'>
          {t('About {{brandName}}', { brandName: systemName })}
        </Eyebrow>
        <h1 className='font-display text-text-strong mx-auto max-w-[14em] text-[clamp(2rem,5vw,3.25rem)] leading-[1.05] font-bold tracking-[-0.035em]'>
          {t("We're building the routing layer for every model.")}
        </h1>
        <p className='text-muted-foreground mx-auto mt-5 max-w-[34em] text-lg leading-relaxed'>
          {t(
            'The model landscape changes weekly. {{brandName}} exists so your code never has to. One integration, every provider, no lock-in — that is the whole idea.',
            { brandName: systemName }
          )}
        </p>
      </section>

      <Card className='mb-14 p-6 md:p-8'>
        <StatCardRow columns={4}>
          <StatCard
            label={t('Models routed')}
            value={modelCount > 0 ? String(modelCount) : '—'}
            loading={pricingQuery.isLoading}
          />
          <StatCard
            label={t('Providers')}
            value={vendorCount > 0 ? String(vendorCount) : '—'}
            loading={pricingQuery.isLoading}
          />
          <StatCard
            label={t('API formats')}
            value={
              pricingQuery.data?.supported_endpoint
                ? String(
                    Object.keys(pricingQuery.data.supported_endpoint).length
                  )
                : '—'
            }
            loading={pricingQuery.isLoading}
          />
          <StatCard
            label={t('Uptime')}
            value={Number.isFinite(avgUptime) ? avgUptime.toFixed(2) : '—'}
            unit={Number.isFinite(avgUptime) ? '%' : undefined}
            loading={uptimeQuery.isLoading}
          />
        </StatCardRow>
      </Card>

      <section className='mb-10'>
        <Eyebrow className='mb-3'>{t('Principles')}</Eyebrow>
        <h2 className='font-display text-text-strong mb-8 text-[clamp(1.5rem,3vw,2.125rem)] font-bold tracking-[-0.025em]'>
          {t('What we optimize for')}
        </h2>
        <div className='grid gap-4 md:grid-cols-2'>
          {PRINCIPLES.map((item) => {
            const Icon = item.icon
            return (
              <Card key={item.title} className='p-5'>
                <span className='bg-brand-subtle text-brand mb-3.5 flex size-[42px] items-center justify-center rounded-[10px]'>
                  <Icon className='size-5' aria-hidden='true' />
                </span>
                <h3 className='font-display text-text-strong mb-2 text-lg font-semibold'>
                  {t(item.title)}
                </h3>
                <p className='text-muted-foreground text-sm leading-relaxed'>
                  {t(item.body)}
                </p>
              </Card>
            )
          })}
        </div>
      </section>

      <p className='text-muted-foreground text-center text-sm'>
        {t(
          'Backed by teams shipping production AI across every major provider.'
        )}
      </p>
    </div>
  )
}
