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
import { SectionPageLayout } from '@/components/layout'
import { InlineAlert } from '@/components/patterns'
import { PlanPreviewPanel } from './components/plan-preview-panel'
import { SubscriptionsDialogs } from './components/subscriptions-dialogs'
import { SubscriptionsPrimaryButtons } from './components/subscriptions-primary-buttons'
import {
  SubscriptionsProvider,
  useSubscriptions,
} from './components/subscriptions-provider'
import { SubscriptionsTable } from './components/subscriptions-table'

function SubscriptionsContent() {
  const { t } = useTranslation()
  const { complianceConfirmed } = useSubscriptions()

  return (
    <>
      <SectionPageLayout>
        <SectionPageLayout.Title>
          {t('Subscription Management')}
        </SectionPageLayout.Title>
        <SectionPageLayout.Actions>
          <SubscriptionsPrimaryButtons />
        </SectionPageLayout.Actions>
        <SectionPageLayout.Content>
          {/* Stripe/Creem product hint — InlineAlert form (r2-B10 §4),
              copy unchanged. Moved from the header actions slot into the
              content column so it no longer competes with the Create
              button for space. */}
          <InlineAlert tone='info' className='mb-4 px-3 py-2.5'>
            {t(
              'Stripe/Creem requires creating products on the third-party platform and entering the ID'
            )}
          </InlineAlert>
          {/* Compliance gate — copy unchanged; warning tone per r2-B10 §4. */}
          {!complianceConfirmed ? (
            <InlineAlert tone='warning' className='mb-4'>
              {t(
                'Subscription plan creation and changes are locked until the administrator confirms compliance terms in Payment Gateway settings.'
              )}
            </InlineAlert>
          ) : null}
          {/* Collapsed-by-default preview of the user-side plan list. */}
          <PlanPreviewPanel className='mb-4' />
          <SubscriptionsTable />
        </SectionPageLayout.Content>
      </SectionPageLayout>

      <SubscriptionsDialogs />
    </>
  )
}

export function Subscriptions() {
  return (
    <SubscriptionsProvider>
      <SubscriptionsContent />
    </SubscriptionsProvider>
  )
}
