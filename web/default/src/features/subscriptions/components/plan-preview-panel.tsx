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
import { ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Panel, PanelBody, PanelHeader, PlanCard } from '@/components/patterns'
import { formatDuration, formatPlanPrice } from '../lib'
import { useAdminPlans } from './use-admin-plans'

/**
 * Collapsible "Plan preview" panel (r2-B10 §2) — the admin-facing,
 * read-only rendition of how enabled plans appear to users (the user
 * side itself lives in the wallet's SubscriptionPlansCard, B3). Enabled
 * plans are sorted by sort_order and rendered as PlanCards without a
 * `current` badge or action. Collapsed by default.
 */
export function PlanPreviewPanel({ className }: { className?: string }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const { data } = useAdminPlans()

  const enabledPlans = (data || [])
    .filter((record) => record.plan?.enabled)
    .sort((a, b) => (a.plan.sort_order ?? 0) - (b.plan.sort_order ?? 0))

  return (
    <Panel className={className}>
      <Collapsible open={open} onOpenChange={setOpen}>
        <PanelHeader
          eyebrow={t('User-side preview')}
          title={t('Plan preview')}
          // Hide the header divider while collapsed so the closed panel
          // reads as a single compact bar.
          className={cn(!open && 'border-b-0')}
          actions={
            <CollapsibleTrigger
              render={
                <Button
                  variant='ghost'
                  size='sm'
                  className='text-muted-foreground'
                />
              }
            >
              {open ? t('Collapse') : t('Expand')}
              <ChevronDown
                aria-hidden='true'
                className={cn(
                  'size-4 transition-transform',
                  open && 'rotate-180'
                )}
              />
            </CollapsibleTrigger>
          }
        />
        <CollapsibleContent>
          <PanelBody>
            {enabledPlans.length > 0 ? (
              <div className='space-y-2.5'>
                {enabledPlans.map((record) => (
                  <PlanCard
                    key={record.plan.id}
                    name={record.plan.title}
                    price={formatPlanPrice(record.plan)}
                    unit={`/ ${formatDuration(record.plan, t)}`}
                    description={record.plan.subtitle}
                  />
                ))}
              </div>
            ) : (
              <p className='text-muted-foreground text-sm'>
                {t('No enabled plans to preview')}
              </p>
            )}
          </PanelBody>
        </CollapsibleContent>
      </Collapsible>
    </Panel>
  )
}
